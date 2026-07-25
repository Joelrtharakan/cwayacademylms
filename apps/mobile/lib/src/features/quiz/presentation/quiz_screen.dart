import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/localization/localized_text.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/error_banner.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../dashboard/application/dashboard_controller.dart';
import '../../learn/data/learn_repository.dart';
import '../data/quiz_dto.dart';
import '../data/quiz_repository.dart';
import '../quiz_args.dart';
import 'widgets/quiz_option_tile.dart';
import 'widgets/quiz_result_view.dart';

enum _Phase { intro, starting, taking, submitting, result }

class QuizScreen extends ConsumerStatefulWidget {
  const QuizScreen({super.key, required this.quizId, this.args});

  final String quizId;
  final QuizArgs? args;

  @override
  ConsumerState<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends ConsumerState<QuizScreen> {
  _Phase _phase = _Phase.intro;
  AttemptStartDto? _attempt;
  final Map<String, Object?> _answers = {};
  QuizResultDto? _result;
  String? _error;

  Timer? _timer;
  int _remaining = 0;
  DateTime _startedAt = DateTime.now();

  QuizRepository get _repo => ref.read(quizRepositoryProvider);

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _start() async {
    setState(() {
      _phase = _Phase.starting;
      _error = null;
      _answers.clear();
      _result = null;
    });
    try {
      final attempt = await _repo.start(widget.quizId);
      _attempt = attempt;
      _startedAt = DateTime.now();
      final limit = attempt.quiz.timeLimit;
      if (limit != null && limit > 0) {
        _remaining = limit;
        _timer = Timer.periodic(const Duration(seconds: 1), _tick);
      }
      setState(() => _phase = _Phase.taking);
    } on ApiException catch (e) {
      setState(() {
        _error = e.message;
        _phase = _Phase.intro;
      });
    }
  }

  void _tick(Timer _) {
    if (_remaining <= 1) {
      _timer?.cancel();
      setState(() => _remaining = 0);
      _submit(auto: true);
    } else {
      setState(() => _remaining -= 1);
    }
  }

  Future<void> _submit({bool auto = false}) async {
    final attempt = _attempt;
    if (attempt == null || _phase == _Phase.submitting) return;

    if (!auto) {
      final unanswered =
          attempt.quiz.questions.where((q) => _answers[q.id] == null).length;
      if (unanswered > 0) {
        final proceed = await showDialog<bool>(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('Submit quiz?'),
            content: Text('$unanswered question(s) are unanswered. Submit anyway?'),
            actions: [
              TextButton(
                  onPressed: () => Navigator.pop(ctx, false),
                  child: const Text('Keep going'),),
              FilledButton(
                  onPressed: () => Navigator.pop(ctx, true),
                  child: const Text('Submit'),),
            ],
          ),
        );
        if (proceed != true) return;
      }
    }

    _timer?.cancel();
    setState(() => _phase = _Phase.submitting);
    try {
      final result = await _repo.submit(
        quizId: widget.quizId,
        attemptId: attempt.attemptId,
        answers: _answers,
        timeTaken: DateTime.now().difference(_startedAt).inSeconds,
      );
      _result = result;
      if (result.passed) await _syncCompletion();
      setState(() => _phase = _Phase.result);
    } on ApiException catch (e) {
      setState(() {
        _error = e.message;
        _phase = _Phase.taking;
      });
    }
  }

  Future<void> _syncCompletion() async {
    final args = widget.args;
    if (args == null || !args.canCompleteLesson) return;
    try {
      await ref.read(learnRepositoryProvider).completeLesson(
            enrollmentId: args.enrollmentId!,
            lessonId: args.lessonId!,
          );
      ref.invalidate(learnEnrollmentProvider(args.courseId!));
      ref.invalidate(dashboardControllerProvider);
    } on Object {
      // Non-fatal: the quiz still recorded a pass server-side.
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_attempt?.quiz.title.resolveFor(context) ?? 'Quiz'),
        actions: [
          if (_phase == _Phase.taking && _timer != null)
            Padding(
              padding: const EdgeInsets.only(right: AppSpacing.lg),
              child: Center(child: _TimerPill(seconds: _remaining)),
            ),
        ],
      ),
      body: switch (_phase) {
        _Phase.intro => _IntroView(
            quizId: widget.quizId,
            error: _error,
            onStart: _start,
          ),
        _Phase.starting || _Phase.submitting =>
          const Center(child: CircularProgressIndicator()),
        _Phase.taking => _TakingView(
            quiz: _attempt!.quiz,
            answers: _answers,
            onSelect: (qid, value) => setState(() => _answers[qid] = value),
            onSubmit: _submit,
          ),
        _Phase.result => QuizResultView(
            result: _result!,
            onRetake: _result!.canRetake ? _start : null,
            onDone: () => Navigator.of(context).maybePop(),
          ),
      },
    );
  }
}

class _TimerPill extends StatelessWidget {
  const _TimerPill({required this.seconds});
  final int seconds;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final low = seconds <= 30;
    final mm = (seconds ~/ 60).toString().padLeft(2, '0');
    final ss = (seconds % 60).toString().padLeft(2, '0');
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 6),
      decoration: BoxDecoration(
        color: (low ? colors.danger : colors.forestMid).withValues(alpha: 0.12),
        borderRadius: AppRadii.rPill,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.timer_outlined,
              size: 16, color: low ? colors.danger : colors.forestMid,),
          const SizedBox(width: 4),
          Text('$mm:$ss',
              style: TextStyle(
                  color: low ? colors.danger : colors.forestMid,
                  fontWeight: FontWeight.w700,),),
        ],
      ),
    );
  }
}

class _IntroView extends ConsumerWidget {
  const _IntroView({required this.quizId, required this.error, required this.onStart});
  final String quizId;
  final String? error;
  final VoidCallback onStart;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final attempts = ref.watch(quizAttemptsProvider(quizId));

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        const SizedBox(height: AppSpacing.xl),
        Icon(Icons.quiz_rounded, size: 56, color: colors.goldPrimary),
        const SizedBox(height: AppSpacing.md),
        Text('Ready to test your knowledge?',
            style: text.headlineSmall, textAlign: TextAlign.center,),
        const SizedBox(height: AppSpacing.xxl),
        if (error != null) ...[
          ErrorBanner(message: error!),
          const SizedBox(height: AppSpacing.lg),
        ],
        attempts.when(
          loading: () => const SizedBox.shrink(),
          error: (_, __) => const SizedBox.shrink(),
          data: (list) => list.isEmpty
              ? const SizedBox.shrink()
              : _PastAttempts(attempts: list),
        ),
        const SizedBox(height: AppSpacing.xl),
        PrimaryButton(
          label: 'Start attempt',
          icon: Icons.play_arrow_rounded,
          variant: ButtonVariant.gold,
          onPressed: onStart,
        ),
      ],
    );
  }
}

class _PastAttempts extends StatelessWidget {
  const _PastAttempts({required this.attempts});
  final List<QuizAttemptDto> attempts;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Previous attempts',
            style: text.labelMedium?.copyWith(color: colors.textMuted),),
        const SizedBox(height: AppSpacing.sm),
        for (final a in attempts.where((a) => a.completedAt != null))
          Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.xs),
            child: Row(
              children: [
                Icon(
                  a.passed ? Icons.check_circle_rounded : Icons.cancel_rounded,
                  size: 18,
                  color: a.passed ? colors.success : colors.danger,
                ),
                const SizedBox(width: AppSpacing.sm),
                Text('${a.score.round()}%', style: text.bodyMedium),
                const Spacer(),
                Text(a.passed ? 'Passed' : 'Failed',
                    style: text.labelSmall?.copyWith(
                        color: a.passed ? colors.success : colors.danger,),),
              ],
            ),
          ),
      ],
    );
  }
}

class _TakingView extends StatelessWidget {
  const _TakingView({
    required this.quiz,
    required this.answers,
    required this.onSelect,
    required this.onSubmit,
  });

  final QuizDto quiz;
  final Map<String, Object?> answers;
  final void Function(String questionId, Object? value) onSelect;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final answered = quiz.questions.where((q) => answers[q.id] != null).length;

    if (quiz.questions.isEmpty) {
      return const EmptyState(
        icon: Icons.help_outline_rounded,
        title: 'No questions',
        message: 'This quiz has no questions yet.',
      );
    }

    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(AppSpacing.lg),
            itemCount: quiz.questions.length,
            itemBuilder: (context, i) => _QuestionCard(
              index: i + 1,
              question: quiz.questions[i],
              value: answers[quiz.questions[i].id],
              onSelect: (v) => onSelect(quiz.questions[i].id, v),
            ),
          ),
        ),
        SafeArea(
          child: Container(
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: colors.surface,
              border: Border(top: BorderSide(color: colors.border)),
            ),
            child: Row(
              children: [
                Text('$answered / ${quiz.questions.length} answered',
                    style: text.bodySmall?.copyWith(color: colors.textMuted),),
                const Spacer(),
                PrimaryButton(
                  label: 'Submit',
                  variant: ButtonVariant.gold,
                  expand: false,
                  onPressed: onSubmit,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _QuestionCard extends StatelessWidget {
  const _QuestionCard({
    required this.index,
    required this.question,
    required this.value,
    required this.onSelect,
  });

  final int index;
  final QuizQuestionDto question;
  final Object? value;
  final ValueChanged<Object?> onSelect;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;

    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.lg),
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: AppRadii.rLg,
        border: Border.all(color: colors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text('Question $index', style: text.labelMedium?.copyWith(color: colors.textMuted)),
              const Spacer(),
              Text('${question.points} pt${question.points == 1 ? '' : 's'}',
                  style: text.labelSmall?.copyWith(color: colors.goldDark),),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(question.text.resolveFor(context), style: text.titleMedium),
          if (question.scriptureRef != null && question.scriptureRef!.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.xs),
            Text(question.scriptureRef!,
                style: text.bodySmall?.copyWith(
                    color: colors.goldDark, fontStyle: FontStyle.italic,),),
          ],
          const SizedBox(height: AppSpacing.lg),
          if (question.isShortAnswer)
            TextFormField(
              initialValue: value is String ? value! as String : null,
              minLines: 2,
              maxLines: 5,
              decoration: const InputDecoration(hintText: 'Type your answer…'),
              onChanged: onSelect,
            )
          else
            for (final a in question.answers)
              QuizOptionTile(
                label: a.text.resolveFor(context),
                selected: value == a.id,
                onTap: () => onSelect(a.id),
              ),
        ],
      ),
    );
  }
}

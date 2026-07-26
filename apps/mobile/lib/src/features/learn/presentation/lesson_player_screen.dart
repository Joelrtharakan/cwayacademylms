import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/localization/localized_text.dart';
import '../../../core/router/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';
import '../../../shared/widgets/error_banner.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../assignments/assignment_args.dart';
import '../../courses/presentation/widgets/lesson_type_icon.dart';
import '../../dashboard/application/dashboard_controller.dart';
import '../../quiz/quiz_args.dart';
import '../data/learn_dto.dart';
import '../data/learn_repository.dart';
import '../data/notes_repository.dart';
import 'widgets/lesson_list_sheet.dart';
import 'widgets/notes_sheet.dart';
import 'widgets/youtube_lesson_player.dart';

class LessonPlayerScreen extends ConsumerStatefulWidget {
  const LessonPlayerScreen({
    super.key,
    required this.courseId,
    this.initialLessonId,
  });

  final String courseId;
  final String? initialLessonId;

  @override
  ConsumerState<LessonPlayerScreen> createState() => _LessonPlayerScreenState();
}

class _LessonPlayerScreenState extends ConsumerState<LessonPlayerScreen> {
  String? _currentLessonId;
  final Set<String> _completed = {};

  // Progress throttling.
  int _pendingSeconds = 0;
  int _lastSavedSeconds = -1;
  DateTime _lastSaveAt = DateTime.fromMillisecondsSinceEpoch(0);
  bool _completing = false;

  LearnRepository get _repo => ref.read(learnRepositoryProvider);

  String _initialLessonId(EnrollmentLearnDto data) {
    final lessons = data.orderedLessons;
    if (widget.initialLessonId != null &&
        lessons.any((l) => l.id == widget.initialLessonId)) {
      return widget.initialLessonId!;
    }
    for (final l in lessons) {
      if (!_isDone(l)) return l.id;
    }
    return lessons.first.id;
  }

  bool _isDone(LearnLessonDto l) => l.isCompleted || _completed.contains(l.id);

  void _onPosition(String enrollmentId, String lessonId, int seconds) {
    _pendingSeconds = seconds;
    final now = DateTime.now();
    if (seconds != _lastSavedSeconds &&
        now.difference(_lastSaveAt).inSeconds >= 8) {
      _save(enrollmentId, lessonId, seconds);
    }
  }

  void _save(String enrollmentId, String lessonId, int seconds) {
    _lastSavedSeconds = seconds;
    _lastSaveAt = DateTime.now();
    _repo
        .saveProgress(
            enrollmentId: enrollmentId, lessonId: lessonId, watchedSeconds: seconds,)
        .catchError((_) {}); // best-effort; retried on the next tick
  }

  void _flush(String enrollmentId, String lessonId) {
    if (_pendingSeconds > 0 && _pendingSeconds != _lastSavedSeconds) {
      _save(enrollmentId, lessonId, _pendingSeconds);
    }
  }

  void _switchLesson(EnrollmentLearnDto data, String lessonId) {
    if (lessonId == _currentLessonId) return;
    _flush(data.id, _currentLessonId!);
    setState(() {
      _currentLessonId = lessonId;
      _pendingSeconds = 0;
      _lastSavedSeconds = -1;
      _lastSaveAt = DateTime.fromMillisecondsSinceEpoch(0);
    });
  }

  void _openNotes(LearnLessonDto lesson) {
    NotesSheet.show(
      context,
      lessonId: lesson.id,
      lessonTitle: lesson.title.resolveFor(context),
      currentSeconds: _pendingSeconds > 0 ? _pendingSeconds : null,
    );
  }

  void _openQuiz(EnrollmentLearnDto data, LearnLessonDto lesson) {
    final quizId = lesson.quiz?.id;
    if (quizId == null) return;
    context.push(
      AppRoutes.quizPath(quizId),
      extra: QuizArgs(
        courseId: data.courseId,
        lessonId: lesson.id,
        enrollmentId: data.id,
      ),
    );
  }

  void _openAssignment(EnrollmentLearnDto data, LearnLessonDto lesson) {
    final a = lesson.assignment;
    if (a == null) return;
    context.push(
      AppRoutes.assignmentPath(a.id),
      extra: AssignmentArgs(
        title: a.title,
        description: a.description,
        dueDate: a.dueDate,
        maxScore: a.maxScore,
        attachmentUrl: a.attachmentUrl,
        courseId: data.courseId,
        lessonId: lesson.id,
        enrollmentId: data.id,
      ),
    );
  }

  Future<void> _markComplete(EnrollmentLearnDto data, LearnLessonDto lesson) async {
    setState(() => _completing = true);
    try {
      await _repo.completeLesson(enrollmentId: data.id, lessonId: lesson.id);
      _completed.add(lesson.id);
      ref.invalidate(dashboardControllerProvider);
      final lessons = data.orderedLessons;
      final idx = lessons.indexWhere((l) => l.id == lesson.id);
      if (idx >= 0 && idx < lessons.length - 1) {
        _switchLesson(data, lessons[idx + 1].id);
      }
    } finally {
      if (mounted) setState(() => _completing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(learnEnrollmentProvider(widget.courseId));

    return PopScope(
      canPop: true,
      onPopInvokedWithResult: (didPop, _) {
        final data = async.valueOrNull;
        if (data != null && _currentLessonId != null) {
          _flush(data.id, _currentLessonId!);
        }
      },
      child: Scaffold(
        body: async.when(
          loading: () => const _PlayerLoading(),
          error: (_, __) => _PlayerError(
            onRetry: () =>
                ref.invalidate(learnEnrollmentProvider(widget.courseId)),
          ),
          data: (data) {
            final lessons = data.orderedLessons;
            if (lessons.isEmpty) {
              return const _PlayerError.empty();
            }
            _currentLessonId ??= _initialLessonId(data);
            final lesson = lessons.firstWhere(
              (l) => l.id == _currentLessonId,
              orElse: () => lessons.first,
            );
            return _PlayerBody(
              data: data,
              lesson: lesson,
              isDone: _isDone(lesson),
              completing: _completing,
              onPosition: (s) => _onPosition(data.id, lesson.id, s),
              onOpenList: () => LessonListSheet.show(
                context,
                enrollment: data,
                currentLessonId: lesson.id,
                onSelect: (id) => _switchLesson(data, id),
              ),
              onPrev: () {
                final i = lessons.indexOf(lesson);
                if (i > 0) _switchLesson(data, lessons[i - 1].id);
              },
              onNext: () {
                final i = lessons.indexOf(lesson);
                if (i < lessons.length - 1) _switchLesson(data, lessons[i + 1].id);
              },
              onComplete: () => _markComplete(data, lesson),
              onOpenQuiz: () => _openQuiz(data, lesson),
              onOpenAssignment: () => _openAssignment(data, lesson),
              onOpenNotes: () => _openNotes(lesson),
            );
          },
        ),
      ),
    );
  }
}

class _PlayerBody extends StatelessWidget {
  const _PlayerBody({
    required this.data,
    required this.lesson,
    required this.isDone,
    required this.completing,
    required this.onPosition,
    required this.onOpenList,
    required this.onPrev,
    required this.onNext,
    required this.onComplete,
    required this.onOpenQuiz,
    required this.onOpenAssignment,
    required this.onOpenNotes,
  });

  final EnrollmentLearnDto data;
  final LearnLessonDto lesson;
  final bool isDone;
  final bool completing;
  final ValueChanged<int> onPosition;
  final VoidCallback onOpenList;
  final VoidCallback onPrev;
  final VoidCallback onNext;
  final VoidCallback onComplete;
  final VoidCallback onOpenQuiz;
  final VoidCallback onOpenAssignment;
  final VoidCallback onOpenNotes;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final lessons = data.orderedLessons;
    final index = lessons.indexOf(lesson);

    return SafeArea(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Top bar over the media area.
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.arrow_back_rounded),
                onPressed: () => Navigator.of(context).maybePop(),
              ),
              Expanded(
                child: Text(
                  data.course.title.resolveFor(context),
                  style: text.titleMedium,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              _NotesButton(lessonId: lesson.id, onPressed: onOpenNotes),
              IconButton(
                icon: const Icon(Icons.playlist_play_rounded),
                tooltip: 'Course content',
                onPressed: onOpenList,
              ),
            ],
          ),
          if (lesson.hasPlayableVideo)
            YouTubeLessonPlayer(
              key: ValueKey(lesson.youTubeId),
              videoId: lesson.youTubeId!,
              startSeconds: lesson.watchedSeconds,
              onPositionSecond: onPosition,
            )
          else
            _NonVideoPanel(lesson: lesson),
          Expanded(
            child: RepaintBoundary(
              child: ListView(
                padding: const EdgeInsets.all(AppSpacing.lg),
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        lesson.title.resolveFor(context),
                        style: text.headlineSmall,
                      ),
                    ),
                    if (isDone)
                      Icon(Icons.check_circle_rounded, color: colors.success),
                  ],
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  'Lesson ${index + 1} of ${lessons.length}',
                  style: text.bodySmall?.copyWith(color: colors.textMuted),
                ),
                const SizedBox(height: AppSpacing.xl),
                if (lesson.isAssignment && lesson.assignment != null)
                  PrimaryButton(
                    label: 'Open assignment',
                    icon: Icons.assignment_rounded,
                    variant: ButtonVariant.gold,
                    onPressed: onOpenAssignment,
                  )
                else if (lesson.isQuiz && lesson.quiz != null)
                  PrimaryButton(
                    label: isDone ? 'Review / retake quiz' : 'Start quiz',
                    icon: Icons.quiz_rounded,
                    variant: ButtonVariant.gold,
                    onPressed: onOpenQuiz,
                  )
                else if (!isDone)
                  PrimaryButton(
                    label: 'Mark as complete',
                    icon: Icons.check_rounded,
                    variant: ButtonVariant.gold,
                    isLoading: completing,
                    onPressed: completing ? null : onComplete,
                  )
                else
                  PrimaryButton(
                    label: index < lessons.length - 1
                        ? 'Next lesson'
                        : 'Course complete',
                    icon: Icons.arrow_forward_rounded,
                    onPressed: index < lessons.length - 1 ? onNext : null,
                  ),
                const SizedBox(height: AppSpacing.md),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: index > 0 ? onPrev : null,
                        icon: const Icon(Icons.chevron_left_rounded),
                        label: const Text('Previous'),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: index < lessons.length - 1 ? onNext : null,
                        icon: const Icon(Icons.chevron_right_rounded),
                        label: const Text('Next'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          ),
        ],
      ),
    );
  }
}

/// Top-bar notes affordance. Reflects whether a note already exists for the
/// lesson (filled + gold) versus not (outline), and opens the editor sheet.
class _NotesButton extends ConsumerWidget {
  const _NotesButton({required this.lessonId, required this.onPressed});

  final String lessonId;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = context.colors;
    final hasNote =
        ref.watch(lessonNoteProvider(lessonId)).valueOrNull != null;
    return IconButton(
      icon: Icon(
        hasNote ? Icons.sticky_note_2_rounded : Icons.sticky_note_2_outlined,
        color: hasNote ? colors.goldDark : null,
      ),
      tooltip: hasNote ? 'Edit note' : 'Add note',
      onPressed: onPressed,
    );
  }
}

class _NonVideoPanel extends StatelessWidget {
  const _NonVideoPanel({required this.lesson});
  final LearnLessonDto lesson;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    return AspectRatio(
      aspectRatio: 16 / 9,
      child: DecoratedBox(
        decoration: BoxDecoration(gradient: colors.forestGradient),
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(lessonTypeIcon(lesson.type), size: 44, color: colors.goldLight),
              const SizedBox(height: AppSpacing.sm),
              Text(
                lesson.type.toUpperCase() == 'VIDEO'
                    ? 'Video unavailable'
                    : '${_label(lesson.type)} lesson',
                style: Theme.of(context)
                    .textTheme
                    .titleMedium
                    ?.copyWith(color: Colors.white),
              ),
            ],
          ),
        ),
      ),
    );
  }

  static String _label(String type) =>
      type.isEmpty ? 'Content' : type[0].toUpperCase() + type.substring(1).toLowerCase();
}

class _PlayerLoading extends StatelessWidget {
  const _PlayerLoading();
  @override
  Widget build(BuildContext context) =>
      const Scaffold(body: Center(child: CircularProgressIndicator()));
}

class _PlayerError extends StatelessWidget {
  const _PlayerError({required this.onRetry}) : _empty = false;
  const _PlayerError.empty()
      : onRetry = null,
        _empty = true;

  final VoidCallback? onRetry;
  final bool _empty;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Center(
          child: ErrorBanner(
            message: _empty
                ? 'This course has no lessons yet.'
                : "We couldn't load this lesson. Please try again.",
            onRetry: onRetry,
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/i18n/i18n_extension.dart';
import '../../../core/localization/localized_text.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/router/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';
import '../../../shared/widgets/error_banner.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../assignments/assignment_args.dart';
import '../../courses/presentation/widgets/lesson_type_icon.dart';
import '../../dashboard/application/dashboard_controller.dart';
import '../../forum/forum_args.dart';
import '../../quiz/quiz_args.dart';
import '../data/learn_dto.dart';
import '../data/learn_repository.dart';
import '../data/notes_repository.dart';
import 'widgets/lesson_list_sheet.dart';
import 'widgets/notes_sheet.dart';
import 'widgets/youtube_lesson_player.dart';

/// Resolves [key], falling back to [fallback] when the catalog hasn't loaded it
/// (e.g. a stale asset bundle) so a raw key is never shown to the user.
String _trFallback(BuildContext context, String key, String fallback) {
  final v = context.tr(key);
  return v == key ? fallback : v;
}

/// Celebratory "course complete" state shown on the final lesson once every
/// lesson is done: an animated gold badge, congratulations, and an exit action.
class _CourseCompleteView extends StatelessWidget {
  const _CourseCompleteView({required this.onExit});

  final VoidCallback onExit;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(
          vertical: AppSpacing.xl, horizontal: AppSpacing.lg,),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [colors.forestMid, colors.forestDeep],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: AppRadii.rXl,
        boxShadow: AppShadows.card(colors.forestDeep),
      ),
      child: Column(
        children: [
          Container(
            width: 84,
            height: 84,
            decoration: BoxDecoration(
              gradient: colors.goldGradient,
              shape: BoxShape.circle,
              boxShadow: AppShadows.glow(colors.goldPrimary),
            ),
            child: const Icon(Icons.emoji_events_rounded,
                    color: Colors.white, size: 44,)
                .animate(onPlay: (c) => c.repeat(reverse: true))
                .scale(
                    begin: const Offset(1, 1),
                    end: const Offset(1.08, 1.08),
                    duration: 1200.ms,
                    curve: Curves.easeInOut,),
          )
              .animate()
              .scale(
                  begin: const Offset(0.4, 0.4),
                  end: const Offset(1, 1),
                  duration: 600.ms,
                  curve: Curves.elasticOut,)
              .fadeIn(duration: 300.ms)
              .then()
              .shimmer(duration: 1400.ms, color: Colors.white70),
          const SizedBox(height: AppSpacing.lg),
          Text(
            _trFallback(
                context, 'mobile.player.courseCompleteTitle', 'Course Complete!',),
            style: text.headlineSmall?.copyWith(color: Colors.white),
            textAlign: TextAlign.center,
          ).animate(delay: 200.ms).fadeIn(duration: 400.ms).slideY(begin: 0.3),
          const SizedBox(height: AppSpacing.xs),
          Text(
            _trFallback(context, 'mobile.player.courseCompleteSubtitle',
                "You've finished every lesson. Well done!",),
            style: text.bodyMedium?.copyWith(color: Colors.white70),
            textAlign: TextAlign.center,
          ).animate(delay: 350.ms).fadeIn(duration: 400.ms),
          const SizedBox(height: AppSpacing.xl),
          PrimaryButton(
            label: _trFallback(context, 'mobile.player.exitCourse', 'Exit course'),
            icon: Icons.check_rounded,
            variant: ButtonVariant.gold,
            onPressed: onExit,
          ).animate(delay: 500.ms).fadeIn(duration: 400.ms).slideY(begin: 0.3),
        ],
      ),
    );
  }
}

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

  void _snack(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(msg)));
  }

  /// Resolves [key], falling back to [fallback] if the catalog hasn't loaded it.
  String _trOr(String key, String fallback) {
    final v = context.tr(key);
    return v == key ? fallback : v;
  }

  Future<void> _markComplete(EnrollmentLearnDto data, LearnLessonDto lesson) async {
    setState(() => _completing = true);
    try {
      await _repo.completeLesson(enrollmentId: data.id, lessonId: lesson.id);
      if (!mounted) return;
      setState(() => _completed.add(lesson.id));
      ref.invalidate(dashboardControllerProvider);
      _snack(_trOr('mobile.player.markedComplete', 'Lesson marked complete.'));
    } on ApiException catch (e) {
      _snack(e.message);
    } catch (_) {
      _snack(_trOr('mobile.player.markCompleteFailed',
          "Couldn't mark this lesson complete. Please try again.",),);
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
              allComplete: lessons.every(_isDone),
              completing: _completing,
              onExit: () => context.pop(),
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
    required this.allComplete,
    required this.completing,
    required this.onExit,
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
  final bool allComplete;
  final bool completing;
  final VoidCallback onExit;
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

    // Cap the 16:9 media so it never overflows a short (e.g. landscape)
    // viewport; the content below stays scrollable in the Expanded ListView.
    final screen = MediaQuery.sizeOf(context);
    final mediaHeight =
        (screen.width * 9 / 16).clamp(0.0, screen.height * 0.6);

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
                tooltip: context.tr('mobile.player.courseContent'),
                onPressed: onOpenList,
              ),
            ],
          ),
          if (lesson.hasPlayableVideo)
            SizedBox(
              height: mediaHeight,
              child: YouTubeLessonPlayer(
                key: ValueKey(lesson.youTubeId),
                videoId: lesson.youTubeId!,
                startSeconds: lesson.watchedSeconds,
                onPositionSecond: onPosition,
              ),
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
                  context.tr('mobile.player.lessonProgress', {'index': index + 1, 'total': lessons.length}),
                  style: text.bodySmall?.copyWith(color: colors.textMuted),
                ),
                const SizedBox(height: AppSpacing.xl),
                if (lesson.type.toUpperCase() == 'FORUM') ...[
                  PrimaryButton(
                    label: _trFallback(
                        context, 'mobile.player.openForum', 'Open discussion',),
                    icon: Icons.forum_rounded,
                    variant: ButtonVariant.gold,
                    onPressed: () => context.push(
                      AppRoutes.forumPath(lesson.id),
                      extra: ForumArgs(
                        title: lesson.title.resolveFor(context),
                        prompt: lesson.content is String
                            ? lesson.content! as String
                            : null,
                        courseId: data.courseId,
                        enrollmentId: data.id,
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                ],
                if (lesson.isAssignment && lesson.assignment != null)
                  PrimaryButton(
                    label: context.tr('mobile.player.openAssignment'),
                    icon: Icons.assignment_rounded,
                    variant: ButtonVariant.gold,
                    onPressed: onOpenAssignment,
                  )
                else if (lesson.type.toUpperCase() == 'FORUM' && !isDone)
                  PrimaryButton(
                    label: context.tr('student.player.markComplete'),
                    icon: Icons.check_rounded,
                    variant: ButtonVariant.outline,
                    isLoading: completing,
                    onPressed: completing ? null : onComplete,
                  )
                else if (lesson.isQuiz && lesson.quiz != null)
                  PrimaryButton(
                    label: isDone
                        ? context.tr('mobile.player.reviewQuiz')
                        : context.tr('mobile.player.startQuiz'),
                    icon: Icons.quiz_rounded,
                    variant: ButtonVariant.gold,
                    onPressed: onOpenQuiz,
                  )
                else if (!isDone)
                  PrimaryButton(
                    label: context.tr('student.player.markComplete'),
                    icon: Icons.check_rounded,
                    variant: ButtonVariant.gold,
                    isLoading: completing,
                    onPressed: completing ? null : onComplete,
                  )
                else if (index < lessons.length - 1)
                  PrimaryButton(
                    label: context.tr('mobile.player.nextLesson'),
                    icon: Icons.arrow_forward_rounded,
                    onPressed: onNext,
                  )
                else if (allComplete)
                  _CourseCompleteView(onExit: onExit)
                else
                  PrimaryButton(
                    label: context.tr('mobile.player.courseComplete'),
                    icon: Icons.check_circle_rounded,
                    onPressed: null,
                  ),
                const SizedBox(height: AppSpacing.md),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: index > 0 ? onPrev : null,
                        icon: const Icon(Icons.chevron_left_rounded),
                        label: Text(context.tr('mobile.player.previous')),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: index < lessons.length - 1 ? onNext : null,
                        icon: const Icon(Icons.chevron_right_rounded),
                        label: Text(context.tr('mobile.common.next')),
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
      tooltip: hasNote ? context.tr('mobile.player.editNote') : context.tr('mobile.player.addNote'),
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
                    ? context.tr('mobile.player.videoUnavailable')
                    : context.tr('mobile.player.typeLesson', {'type': _label(context, lesson.type)}),
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

  static String _label(BuildContext context, String type) =>
      type.isEmpty ? context.tr('mobile.player.contentLabel') : type[0].toUpperCase() + type.substring(1).toLowerCase();
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
                ? context.tr('mobile.player.emptyLessons')
                : context.tr('mobile.player.loadError'),
            onRetry: onRetry,
          ),
        ),
      ),
    );
  }
}

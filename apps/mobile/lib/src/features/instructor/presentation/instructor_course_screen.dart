import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/i18n/i18n_extension.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/error_banner.dart';
import '../data/course_insights_dto.dart';
import '../data/course_insights_repository.dart';

/// Instructor management view for a single owned course: enrolled students and
/// aggregate analytics. Both tabs consume ownership-scoped backend endpoints.
class InstructorCourseScreen extends StatelessWidget {
  const InstructorCourseScreen({
    super.key,
    required this.courseId,
    this.courseTitle,
  });

  final String courseId;
  final String? courseTitle;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          backgroundColor: colors.forestDeep,
          foregroundColor: Colors.white,
          iconTheme: const IconThemeData(color: Colors.white),
          systemOverlayStyle: SystemUiOverlayStyle.light,
          flexibleSpace: Container(
            decoration: BoxDecoration(gradient: colors.forestGradient),
          ),
          title: Text(
            courseTitle ?? context.tr('mobile.instructorCourse.courseFallback'),
            style: text.titleLarge?.copyWith(color: Colors.white),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          bottom: TabBar(
            indicatorColor: colors.goldLight,
            labelColor: Colors.white,
            unselectedLabelColor: Colors.white70,
            tabs: [
              Tab(text: context.tr('mobile.instructorCourse.tabStudents')),
              Tab(text: context.tr('mobile.instructorCourse.tabAnalytics')),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _StudentsTab(courseId: courseId),
            _AnalyticsTab(courseId: courseId),
          ],
        ),
      ),
    );
  }
}

class _StudentsTab extends ConsumerWidget {
  const _StudentsTab({required this.courseId});
  final String courseId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = context.colors;
    final async = ref.watch(courseStudentsProvider(courseId));

    return RefreshIndicator(
      color: colors.goldPrimary,
      onRefresh: () => ref.refresh(courseStudentsProvider(courseId).future),
      child: async.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => ListView(
          children: [
            SizedBox(height: MediaQuery.sizeOf(context).height * 0.1),
            Padding(
              padding: const EdgeInsets.all(AppSpacing.xl),
              child: ErrorBanner(
                message: context.tr('mobile.instructorCourse.studentsLoadError'),
                onRetry: () => ref.invalidate(courseStudentsProvider(courseId)),
              ),
            ),
          ],
        ),
        data: (students) {
          if (students.isEmpty) {
            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              children: [
                SizedBox(height: MediaQuery.sizeOf(context).height * 0.12),
                EmptyState(
                  icon: Icons.groups_outlined,
                  title: context.tr('mobile.instructorCourse.noStudents'),
                  message: context.tr('mobile.instructorCourse.noStudentsDesc'),
                ),
              ],
            );
          }
          return ListView.separated(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(AppSpacing.lg),
            itemCount: students.length,
            separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.md),
            itemBuilder: (_, i) => _StudentRow(student: students[i]),
          );
        },
      ),
    );
  }
}

class _StudentRow extends StatelessWidget {
  const _StudentRow({required this.student});
  final EnrolledStudentDto student;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final s = student;
    final hasAvatar = s.studentAvatar?.startsWith('http') ?? false;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: AppRadii.rLg,
        border: Border.all(color: colors.border),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 22,
            backgroundColor: colors.forestMid,
            backgroundImage: hasAvatar ? NetworkImage(s.studentAvatar!) : null,
            child: hasAvatar
                ? null
                : Text(
                    s.studentName.isNotEmpty
                        ? s.studentName.characters.first.toUpperCase()
                        : '?',
                    style: const TextStyle(color: Colors.white),
                  ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(s.studentName,
                          style: text.titleSmall,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,),
                    ),
                    if (s.isCompleted)
                      Icon(Icons.workspace_premium_rounded,
                          size: 16, color: colors.goldPrimary,),
                  ],
                ),
                if (s.lastCompletedTitle != null) ...[
                  const SizedBox(height: 2),
                  Text(context.tr('mobile.instructorCourse.lastCompleted', {'title': s.lastCompletedTitle}),
                      style: text.labelSmall?.copyWith(color: colors.textMuted),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,),
                ],
                const SizedBox(height: AppSpacing.sm),
                Row(
                  children: [
                    Expanded(
                      child: ClipRRect(
                        borderRadius: AppRadii.rPill,
                        child: LinearProgressIndicator(
                          value: (s.progress / 100).clamp(0, 1),
                          minHeight: 6,
                          backgroundColor: colors.surfaceMuted,
                          valueColor:
                              AlwaysStoppedAnimation(colors.goldPrimary),
                        ),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Text('${s.progress.round()}%',
                        style: text.labelSmall
                            ?.copyWith(color: colors.textSecondary),),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _AnalyticsTab extends ConsumerWidget {
  const _AnalyticsTab({required this.courseId});
  final String courseId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final async = ref.watch(courseAnalyticsProvider(courseId));

    return RefreshIndicator(
      color: colors.goldPrimary,
      onRefresh: () => ref.refresh(courseAnalyticsProvider(courseId).future),
      child: async.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => ListView(
          children: [
            SizedBox(height: MediaQuery.sizeOf(context).height * 0.1),
            Padding(
              padding: const EdgeInsets.all(AppSpacing.xl),
              child: ErrorBanner(
                message: context.tr('mobile.instructorCourse.analyticsLoadError'),
                onRetry: () => ref.invalidate(courseAnalyticsProvider(courseId)),
              ),
            ),
          ],
        ),
        data: (a) => ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(AppSpacing.lg),
          children: [
            Text(context.tr('mobile.instructorCourse.studentProgress'), style: text.titleLarge),
            const SizedBox(height: AppSpacing.md),
            _ProgressBreakdown(analytics: a),
            const SizedBox(height: AppSpacing.xl),
            if (a.enrollmentsOverTime.isNotEmpty) ...[
              Text(context.tr('mobile.instructorCourse.enrollments6mo'), style: text.titleLarge),
              const SizedBox(height: AppSpacing.md),
              _EnrollmentBars(points: a.enrollmentsOverTime),
              const SizedBox(height: AppSpacing.xl),
            ],
            if (a.lessonCompletion.isNotEmpty) ...[
              Text(context.tr('mobile.instructorCourse.lessonCompletion'), style: text.titleLarge),
              const SizedBox(height: AppSpacing.md),
              for (final l in a.lessonCompletion) ...[
                _LessonBar(lesson: l),
                const SizedBox(height: AppSpacing.md),
              ],
            ],
          ],
        ),
      ),
    );
  }
}

class _ProgressBreakdown extends StatelessWidget {
  const _ProgressBreakdown({required this.analytics});
  final CourseAnalyticsDto analytics;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final total = analytics.totalStudents;
    final segments = <(String, int, Color)>[
      (context.tr('mobile.instructorCourse.completed'), analytics.completed, colors.success),
      (context.tr('mobile.instructorCourse.inProgress'), analytics.inProgress, colors.goldPrimary),
      (context.tr('mobile.instructorCourse.notStarted'), analytics.notStarted, colors.textMuted),
    ];

    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: AppRadii.rLg,
        border: Border.all(color: colors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(context.tr('mobile.instructorCourse.studentCount', {'count': total}),
              style: text.headlineSmall,),
          const SizedBox(height: AppSpacing.md),
          ClipRRect(
            borderRadius: AppRadii.rPill,
            child: SizedBox(
              height: 12,
              child: total == 0
                  ? ColoredBox(color: colors.surfaceMuted)
                  : Row(
                      children: [
                        for (final (_, count, color) in segments)
                          if (count > 0)
                            Expanded(flex: count, child: ColoredBox(color: color)),
                      ],
                    ),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Wrap(
            spacing: AppSpacing.lg,
            runSpacing: AppSpacing.sm,
            children: [
              for (final (label, count, color) in segments)
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(
                          color: color, shape: BoxShape.circle,),
                    ),
                    const SizedBox(width: 6),
                    Text(context.tr('mobile.instructorCourse.segmentLabel', {'label': label, 'count': count}),
                        style: text.labelSmall
                            ?.copyWith(color: colors.textSecondary),),
                  ],
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _EnrollmentBars extends StatelessWidget {
  const _EnrollmentBars({required this.points});
  final List<MonthlyCount> points;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final maxCount =
        points.fold<int>(1, (m, p) => p.count > m ? p.count : m);

    return Container(
      height: 160,
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: AppRadii.rLg,
        border: Border.all(color: colors.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          for (final p in points)
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text('${p.count}',
                      style: text.labelSmall?.copyWith(color: colors.textMuted),),
                  const SizedBox(height: 4),
                  Expanded(
                    child: TweenAnimationBuilder<double>(
                      tween: Tween(begin: 0, end: p.count / maxCount),
                      duration: AppMotion.slow,
                      curve: AppMotion.curve,
                      builder: (_, v, __) => FractionallySizedBox(
                        alignment: Alignment.bottomCenter,
                        heightFactor: v.clamp(0.02, 1.0),
                        child: Container(
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          decoration: BoxDecoration(
                            gradient: colors.goldGradient,
                            borderRadius: const BorderRadius.vertical(
                                top: Radius.circular(4),),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(p.month,
                      style: text.labelSmall?.copyWith(color: colors.textMuted),),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _LessonBar extends StatelessWidget {
  const _LessonBar({required this.lesson});
  final LessonCompletion lesson;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(lesson.title,
                  style: text.bodySmall,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,),
            ),
            Text('${lesson.rate.round()}%',
                style: text.labelSmall?.copyWith(color: colors.textSecondary),),
          ],
        ),
        const SizedBox(height: 4),
        ClipRRect(
          borderRadius: AppRadii.rPill,
          child: LinearProgressIndicator(
            value: (lesson.rate / 100).clamp(0, 1),
            minHeight: 6,
            backgroundColor: colors.surfaceMuted,
            valueColor: AlwaysStoppedAnimation(colors.forestLight),
          ),
        ),
      ],
    );
  }
}

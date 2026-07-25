import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/localization/localized_text.dart';
import '../../../core/router/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/animated_press.dart';
import '../../../shared/widgets/error_banner.dart';
import '../../auth/application/auth_controller.dart';
import '../../courses/data/course_dto.dart';
import '../../courses/data/courses_repository.dart';
import '../../instructor/data/grading_repository.dart';
import 'widgets/dashboard_skeleton.dart';
import 'widgets/stat_tile.dart';

/// Home surface for INSTRUCTOR. Shows a snapshot of the courses they own
/// (scoped server-side) with quick access to manage them. Rich per-course
/// analytics/grading arrive in the instructor studio phase.
class InstructorDashboardScreen extends ConsumerWidget {
  const InstructorDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final user = ref.watch(currentUserProvider);
    final async = ref.watch(myCoursesProvider);
    final firstName = (user?.name.trim().split(' ').first) ?? 'there';

    return Scaffold(
      body: RefreshIndicator(
        color: colors.goldPrimary,
        onRefresh: () => ref.refresh(myCoursesProvider.future),
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            SliverAppBar(
              expandedHeight: 120,
              pinned: true,
              stretch: true,
              backgroundColor: colors.forestDeep,
              flexibleSpace: FlexibleSpaceBar(
                stretchModes: const [StretchMode.zoomBackground],
                background: DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [colors.forestMid, colors.forestDeep],
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                    ),
                  ),
                ),
                titlePadding: const EdgeInsets.only(left: AppSpacing.lg, bottom: 16),
                title: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Instructor',
                        style: text.labelSmall?.copyWith(color: colors.goldLight, letterSpacing: 1),),
                    Text(firstName,
                        style: text.titleLarge?.copyWith(color: Colors.white),),
                  ],
                ),
              ),
              actions: [
                Padding(
                  padding: const EdgeInsets.only(right: AppSpacing.lg),
                  child: GestureDetector(
                    onTap: () => context.go(AppRoutes.profile),
                    child: Container(
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: colors.goldPrimary, width: 2),
                      ),
                      child: CircleAvatar(
                        radius: 18,
                        backgroundColor: colors.goldPrimary.withValues(alpha: 0.2),
                        child: Text(user?.initials ?? '?',
                            style: TextStyle(
                                color: colors.goldLight, fontWeight: FontWeight.w700,),),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            SliverPadding(
              padding: const EdgeInsets.only(
                left: AppSpacing.lg,
                right: AppSpacing.lg,
                top: AppSpacing.lg,
                bottom: 140,
              ),
              sliver: async.when(
                skipLoadingOnRefresh: true,
                skipLoadingOnReload: true,
                loading: () => const SliverToBoxAdapter(child: DashboardSkeleton()),
                error: (_, __) => SliverToBoxAdapter(
                  child: ListView(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    children: [
                      SizedBox(height: MediaQuery.sizeOf(context).height * 0.1),
                      Padding(
                        padding: const EdgeInsets.all(AppSpacing.xl),
                        child: ErrorBanner(
                          message: "Couldn't load your teaching overview. Pull to retry.",
                          onRetry: () => ref.invalidate(myCoursesProvider),
                        ),
                      ),
                    ],
                  ),
                ),
                data: (courses) => _BodySliver(courses: courses, firstName: firstName),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BodySliver extends StatelessWidget {
  const _BodySliver({required this.courses, required this.firstName});
  final List<CourseListItemDto> courses;
  final String firstName;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final published = courses.where((c) => c.isPublished).length;
    final students = courses.fold<int>(0, (s, c) => s + c.enrollmentCount);

    return SliverList(
      delegate: SliverChildListDelegate([
        Row(
          children: [
            Expanded(
              child: StatTile(
                icon: Icons.menu_book_rounded,
                value: '${courses.length}',
                label: 'My courses',
                accent: true,
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: StatTile(
                icon: Icons.verified_rounded,
                value: '$published',
                label: 'Published',
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: StatTile(
                icon: Icons.people_alt_rounded,
                value: Formatters.compact(students),
                label: 'Students',
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.xl),
        const _GradingCard(),
        const SizedBox(height: AppSpacing.xl),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Your courses', style: text.titleLarge),
            if (courses.isNotEmpty)
              TextButton(
                onPressed: () => context.go(AppRoutes.courses),
                child: const Text('Manage all'),
              ),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        if (courses.isEmpty)
          _EmptyTeaching()
        else
          for (final c in courses.take(4)) ...[
            _CoursePreview(
              course: c,
              onTap: () => context.push(
                AppRoutes.instructorCoursePath(c.id),
                extra: c.title.resolveFor(context),
              ),
            ),
            const SizedBox(height: AppSpacing.md),
          ],
      ].animate(interval: 50.ms).fade(duration: 300.ms).slideY(begin: 0.1, duration: 300.ms, curve: Curves.easeOutQuad),),
    );
  }
}

class _CoursePreview extends StatelessWidget {
  const _CoursePreview({required this.course, required this.onTap});
  final CourseListItemDto course;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    return AnimatedPress(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: colors.surfaceElevated,
          borderRadius: AppRadii.rLg,
          boxShadow: AppShadows.card(colors.forestDeep),
          border: Border.all(
            color: Theme.of(context).brightness == Brightness.light
                ? colors.border.withValues(alpha: 0.5)
                : colors.border,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: colors.surfaceMuted,
                borderRadius: AppRadii.rMd,
              ),
              child: Icon(Icons.play_lesson_rounded, color: colors.forestMid),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(course.title.resolveFor(context),
                      style: text.titleSmall,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,),
                  const SizedBox(height: 2),
                  Text(
                    '${course.isPublished ? 'Published' : 'Draft'} · ${Formatters.compact(course.enrollmentCount)} students',
                    style: text.labelSmall?.copyWith(color: colors.textMuted),
                  ),
                ],
              ),
            ),
            Icon(Icons.chevron_right_rounded, color: colors.textMuted),
          ],
        ),
      ),
    );
  }
}

/// Entry point to the grading queue, showing the live count of submissions
/// awaiting a grade across the instructor's courses.
class _GradingCard extends ConsumerWidget {
  const _GradingCard();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final pending = ref.watch(pendingGradingProvider).valueOrNull?.length;

    return AnimatedPress(
      onTap: () => context.push(AppRoutes.grading),
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          color: colors.surfaceElevated,
          borderRadius: AppRadii.rLg,
          boxShadow: AppShadows.card(colors.forestDeep),
          border: Border.all(
            color: Theme.of(context).brightness == Brightness.light
                ? colors.border.withValues(alpha: 0.5)
                : colors.border,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(AppSpacing.sm),
              decoration: BoxDecoration(
                color: colors.goldPrimary.withValues(alpha: 0.12),
                borderRadius: AppRadii.rSm,
              ),
              child: Icon(Icons.rate_review_rounded, color: colors.goldDark),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Grading queue', style: text.titleSmall),
                  Text(
                    pending == null
                        ? 'Review student submissions'
                        : pending == 0
                            ? 'All caught up — nothing to grade'
                            : '$pending awaiting a grade',
                    style: text.bodySmall?.copyWith(color: colors.textMuted),
                  ),
                ],
              ),
            ),
            if (pending != null && pending > 0)
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm, vertical: 2,),
                decoration: BoxDecoration(
                  color: colors.danger,
                  borderRadius: AppRadii.rPill,
                ),
                child: Text('$pending',
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w700,),),
              ),
            Icon(Icons.chevron_right_rounded, color: colors.textMuted),
          ],
        ),
      ),
    );
  }
}

class _EmptyTeaching extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    return Container(
      padding: const EdgeInsets.all(AppSpacing.xl),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: AppRadii.rLg,
        border: Border.all(color: colors.border),
      ),
      child: Column(
        children: [
          Icon(Icons.school_rounded, size: 40, color: colors.forestLight),
          const SizedBox(height: AppSpacing.md),
          Text('No courses assigned yet', style: text.titleMedium),
          const SizedBox(height: AppSpacing.xs),
          Text(
            'Courses you create or that are assigned to you will appear here.',
            textAlign: TextAlign.center,
            style: text.bodySmall?.copyWith(color: colors.textSecondary),
          ),
        ],
      ),
    );
  }
}

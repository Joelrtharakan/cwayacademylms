import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/localization/localized_text.dart';
import '../../../core/router/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/app_shimmer.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/error_banner.dart';
import '../../../shared/widgets/status_badge.dart';
import '../../auth/application/auth_controller.dart';
import '../data/course_dto.dart';
import '../data/courses_repository.dart';

/// Courses the signed-in user owns/manages. Instructors see only their own
/// courses; admins see all — enforced by the backend `/instructor/courses`
/// endpoint (this screen never filters by role itself). Used as the "Courses"
/// tab for INSTRUCTOR and ADMIN roles.
class MyCoursesScreen extends ConsumerWidget {
  const MyCoursesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = context.colors;
    final user = ref.watch(currentUserProvider);
    final async = ref.watch(myCoursesProvider);
    final isAdmin = user?.isAdmin ?? false;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: colors.forestDeep,
        foregroundColor: Colors.white,
        systemOverlayStyle: SystemUiOverlayStyle.light,
        flexibleSpace: DecoratedBox(
          decoration: BoxDecoration(gradient: colors.forestGradient),
        ),
        title: Text(
          isAdmin ? 'All courses' : 'My courses',
          style: Theme.of(context)
              .textTheme
              .titleLarge
              ?.copyWith(color: Colors.white),
        ),
      ),
      body: RefreshIndicator(
        color: colors.goldPrimary,
        onRefresh: () => ref.refresh(myCoursesProvider.future),
        child: async.when(
          skipLoadingOnRefresh: true,
          loading: () => const _LoadingList(),
          error: (_, __) => ListView(
            children: [
              SizedBox(height: MediaQuery.sizeOf(context).height * 0.1),
              Padding(
                padding: const EdgeInsets.all(AppSpacing.xl),
                child: ErrorBanner(
                  message: "Couldn't load your courses. Pull to retry.",
                  onRetry: () => ref.invalidate(myCoursesProvider),
                ),
              ),
            ],
          ),
          data: (courses) {
            if (courses.isEmpty) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: [
                  SizedBox(height: MediaQuery.sizeOf(context).height * 0.12),
                  EmptyState(
                    icon: Icons.menu_book_rounded,
                    title: isAdmin ? 'No courses yet' : 'No courses yet',
                    message: isAdmin
                        ? 'No courses have been created on the platform yet.'
                        : 'Courses you create or that are assigned to you will appear here.',
                  ),
                ],
              );
            }
            return ListView.separated(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.only(
                left: AppSpacing.lg,
                right: AppSpacing.lg,
                top: AppSpacing.lg,
                bottom: 140,
              ),
              itemCount: courses.length + 1,
              separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.md),
              itemBuilder: (context, i) {
                if (i == 0) return _Summary(courses: courses, isAdmin: isAdmin);
                final course = courses[i - 1];
                return RepaintBoundary(
                  child: _ManagedCourseRow(
                    course: course,
                    onTap: () => context.push(
                      AppRoutes.instructorCoursePath(course.id),
                      extra: course.title.resolveFor(context),
                    ),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }
}

class _Summary extends StatelessWidget {
  const _Summary({required this.courses, required this.isAdmin});
  final List<CourseListItemDto> courses;
  final bool isAdmin;

  @override
  Widget build(BuildContext context) {
    final published = courses.where((c) => c.isPublished).length;
    final students = courses.fold<int>(0, (s, c) => s + c.enrollmentCount);

    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Row(
        children: [
          Expanded(child: _Metric(label: 'Courses', value: '${courses.length}')),
          const SizedBox(width: AppSpacing.md),
          Expanded(child: _Metric(label: 'Published', value: '$published')),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: _Metric(
              label: 'Students',
              value: Formatters.compact(students),
            ),
          ),
        ],
      ),
    );
  }
}

class _Metric extends StatelessWidget {
  const _Metric({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
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
          Text(value, style: text.headlineMedium),
          const SizedBox(height: AppSpacing.xxs),
          Text(label,
              style: text.bodySmall?.copyWith(color: colors.textMuted),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,),
        ],
      ),
    );
  }
}

class _ManagedCourseRow extends StatelessWidget {
  const _ManagedCourseRow({required this.course, required this.onTap});
  final CourseListItemDto course;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final title = course.title.resolveFor(context);
    final hasImage =
        course.thumbnail != null && course.thumbnail!.startsWith('http');

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: AppRadii.rLg,
        child: Ink(
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: colors.surface,
            borderRadius: AppRadii.rLg,
            border: Border.all(color: colors.border),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: AppRadii.rMd,
                child: SizedBox(
                  width: 72,
                  height: 72,
                  child: hasImage
                      ? Image.network(course.thumbnail!, fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => _fallback(colors, title),)
                      : _fallback(colors, title),
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title,
                        style: text.titleMedium,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,),
                    const SizedBox(height: AppSpacing.xs),
                    Row(
                      children: [
                        StatusBadge.courseStatus(course.status),
                        const SizedBox(width: AppSpacing.sm),
                        Icon(Icons.people_alt_rounded,
                            size: 14, color: colors.textMuted,),
                        const SizedBox(width: 2),
                        Text(Formatters.compact(course.enrollmentCount),
                            style: text.labelSmall
                                ?.copyWith(color: colors.textMuted),),
                      ],
                    ),
                    if (course.enrollmentCount > 0) ...[
                      const SizedBox(height: AppSpacing.sm),
                      ClipRRect(
                        borderRadius: AppRadii.rPill,
                        child: LinearProgressIndicator(
                          value: (course.avgProgress / 100).clamp(0, 1),
                          minHeight: 6,
                          backgroundColor: colors.surfaceMuted,
                          valueColor:
                              AlwaysStoppedAnimation(colors.goldPrimary),
                        ),
                      ),
                      const SizedBox(height: AppSpacing.xxs),
                      Text('${course.avgProgress.round()}% avg. completion',
                          style: text.labelSmall
                              ?.copyWith(color: colors.textMuted),),
                    ],
                  ],
                ),
              ),
              Icon(Icons.chevron_right_rounded, color: colors.textMuted),
            ],
          ),
        ),
      ),
    );
  }

  Widget _fallback(AppColors colors, String title) => DecoratedBox(
        decoration: BoxDecoration(gradient: colors.forestGradient),
        child: Center(
          child: Text(
            title.isNotEmpty ? title.characters.first.toUpperCase() : '•',
            style: TextStyle(
                color: colors.goldLight,
                fontSize: 24,
                fontWeight: FontWeight.w800,),
          ),
        ),
      );
}

class _LoadingList extends StatelessWidget {
  const _LoadingList();

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.all(AppSpacing.lg),
      itemCount: 6,
      separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.md),
      itemBuilder: (_, __) =>
          const AppShimmer(height: 96, borderRadius: AppRadii.rLg),
    );
  }
}

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/i18n/i18n_extension.dart';
import '../../../core/localization/localized_text.dart';
import '../../../core/router/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';
import '../../../shared/widgets/app_shimmer.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/error_banner.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../dashboard/application/dashboard_controller.dart';
import '../../dashboard/data/dashboard_dto.dart';

/// Screen displayed when a student taps the "Courses" tab.
/// Displays Enrolled Programs with their Program Name separately from Standalone Courses.
class StudentCoursesScreen extends ConsumerWidget {
  const StudentCoursesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = context.colors;
    final async = ref.watch(dashboardControllerProvider);

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        backgroundColor: colors.forestDeep,
        foregroundColor: Colors.white,
        elevation: 0,
        flexibleSpace: DecoratedBox(
          decoration: BoxDecoration(gradient: colors.forestGradient),
        ),
        title: Text(
          context.tr('student.courses.title'),
          style: Theme.of(context)
              .textTheme
              .titleLarge
              ?.copyWith(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ),
      body: RefreshIndicator(
        color: colors.goldPrimary,
        onRefresh: () => ref.read(dashboardControllerProvider.notifier).refresh(),
        child: async.when(
          loading: () => const _LoadingSkeleton(),
          error: (_, __) => ListView(
            children: [
              const SizedBox(height: AppSpacing.xxl),
              Padding(
                padding: const EdgeInsets.all(AppSpacing.xl),
                child: ErrorBanner(
                  message: context.tr('mobile.courses.loadError'),
                  onRetry: () => ref.invalidate(dashboardControllerProvider),
                ),
              ),
            ],
          ),
          data: (dashboard) {
            final programEnrollments = dashboard.programEnrollments
                .where((pe) => pe.program != null)
                .toList();

            // Program course IDs to separate standalone courses cleanly
            final programCourseIds = <String>{};
            for (final pe in programEnrollments) {
              if (pe.program?.courses != null) {
                for (final c in pe.program!.courses) {
                  programCourseIds.add(c.id);
                }
              }
            }

            final standaloneEnrollments = dashboard.enrollments
                .where((e) => !programCourseIds.contains(e.courseId) && e.course.program == null)
                .toList();

            if (programEnrollments.isEmpty && standaloneEnrollments.isEmpty && dashboard.enrollments.isEmpty) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: [
                  const SizedBox(height: AppSpacing.xxxl),
                  EmptyState(
                    icon: Icons.menu_book_rounded,
                    title: context.tr('student.courses.empty.title'),
                    message: context.tr('student.courses.empty.description'),
                  ),
                  const SizedBox(height: AppSpacing.xl),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xxl),
                    child: PrimaryButton(
                      label: context.tr('student.courses.empty.button'),
                      icon: Icons.explore_rounded,
                      variant: ButtonVariant.gold,
                      onPressed: () => context.push(AppRoutes.coursesBrowse),
                    ),
                  ),
                ],
              );
            }

            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                AppSpacing.lg,
                AppSpacing.lg,
                140,
              ),
              children: [
                // 1. Program Enrolled Section
                for (final pe in programEnrollments) ...[
                  _ProgramSection(
                    programTitle: pe.program!.title.resolveFor(context),
                    courses: pe.program!.courses,
                    enrollments: dashboard.enrollments,
                  ),
                  const SizedBox(height: AppSpacing.xl),
                ],

                // 2. Standalone Courses Section
                if (standaloneEnrollments.isNotEmpty || (programEnrollments.isEmpty && dashboard.enrollments.isNotEmpty)) ...[
                  _StandaloneSection(
                    enrollments: standaloneEnrollments.isNotEmpty
                        ? standaloneEnrollments
                        : dashboard.enrollments,
                  ),
                ],
              ],
            );
          },
        ),
      ),
    );
  }
}

class _ProgramSection extends StatelessWidget {
  const _ProgramSection({
    required this.programTitle,
    required this.courses,
    required this.enrollments,
  });

  final String programTitle;
  final List<CourseSummaryDto> courses;
  final List<EnrollmentDto> enrollments;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: colors.forestDeep,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            gradient: colors.forestGradient,
          ),
          child: Row(
            children: [
              Icon(Icons.school_rounded, color: colors.goldLight, size: 22),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Text(
                  programTitle.isNotEmpty ? programTitle : context.tr('mobile.courses.academicProgram'),
                  style: text.titleMedium?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
        Container(
          decoration: BoxDecoration(
            color: colors.surfaceElevated,
            borderRadius: const BorderRadius.vertical(bottom: Radius.circular(16)),
            border: Border.all(color: colors.border),
          ),
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Column(
            children: [
              if (courses.isEmpty)
                Text(
                  context.tr('mobile.courses.noProgramCourses'),
                  style: text.bodySmall?.copyWith(color: colors.textMuted),
                )
              else
                for (final course in courses) ...[
                  _CourseItemCard(
                    course: course,
                    enrollment: enrollments.firstWhere(
                      (e) => e.courseId == course.id,
                      orElse: () => EnrollmentDto(
                        id: '',
                        courseId: course.id,
                        course: course,
                      ),
                    ),
                  ),
                  if (course != courses.last) const Divider(height: AppSpacing.lg),
                ],
            ],
          ),
        ),
      ],
    );
  }
}

class _StandaloneSection extends StatelessWidget {
  const _StandaloneSection({required this.enrollments});
  final List<EnrollmentDto> enrollments;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: colors.forestMid,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
          ),
          child: Row(
            children: [
              Icon(Icons.menu_book_rounded, color: colors.goldLight, size: 22),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Text(
                  context.tr('mobile.courses.standalone'),
                  style: text.titleMedium?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
        Container(
          decoration: BoxDecoration(
            color: colors.surfaceElevated,
            borderRadius: const BorderRadius.vertical(bottom: Radius.circular(16)),
            border: Border.all(color: colors.border),
          ),
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Column(
            children: [
              for (final enrollment in enrollments) ...[
                _CourseItemCard(
                  course: enrollment.course,
                  enrollment: enrollment,
                ),
                if (enrollment != enrollments.last) const Divider(height: AppSpacing.lg),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class _CourseItemCard extends StatelessWidget {
  const _CourseItemCard({
    required this.course,
    required this.enrollment,
  });

  final CourseSummaryDto course;
  final EnrollmentDto enrollment;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final title = course.title.resolveFor(context);
    final progress = enrollment.progress;

    return InkWell(
      onTap: () => context.push(AppRoutes.courseDetailPath(course.id)),
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: SizedBox(
                width: 64,
                height: 64,
                child: course.thumbnail != null && course.thumbnail!.startsWith('http')
                    ? CachedNetworkImage(
                        imageUrl: course.thumbnail!,
                        fit: BoxFit.cover,
                        memCacheWidth: 300,
                        memCacheHeight: 300,
                        fadeInDuration: 150.ms,
                        placeholder: (context, url) => AppShimmer(
                          width: 64,
                          height: 64,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        errorWidget: (context, url, error) => Container(
                          color: colors.forestMid,
                          child: const Icon(Icons.menu_book_rounded, color: Colors.white70),
                        ),
                      )
                    : Container(
                        color: colors.forestMid,
                        child: const Icon(Icons.menu_book_rounded, color: Colors.white70),
                      ),
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: text.titleSmall?.copyWith(fontWeight: FontWeight.bold),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Row(
                    children: [
                      Expanded(
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: enrollment.progressFraction,
                            backgroundColor: colors.border,
                            valueColor: AlwaysStoppedAnimation<Color>(
                              enrollment.isCompleted ? Colors.green : colors.goldDark,
                            ),
                            minHeight: 6,
                          ),
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Text(
                        '${progress.toInt()}%',
                        style: text.labelSmall?.copyWith(color: colors.textSecondary),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            Icon(Icons.chevron_right_rounded, color: colors.textMuted),
          ],
        ),
      ),
    );
  }
}

class _LoadingSkeleton extends StatelessWidget {
  const _LoadingSkeleton();

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.all(AppSpacing.lg),
      child: Column(
        children: [
          AppShimmer(height: 140, borderRadius: AppRadii.rLg),
          SizedBox(height: AppSpacing.lg),
          AppShimmer(height: 140, borderRadius: AppRadii.rLg),
        ],
      ),
    );
  }
}

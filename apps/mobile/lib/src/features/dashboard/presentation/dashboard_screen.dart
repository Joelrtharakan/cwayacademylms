import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/error_banner.dart';
import '../../../shared/widgets/progress_ring.dart';
import '../../../shared/widgets/section_header.dart';
import '../../auth/application/auth_controller.dart';
import '../application/dashboard_controller.dart';
import '../data/dashboard_dto.dart';
import 'widgets/continue_learning_card.dart';
import 'widgets/dashboard_skeleton.dart';
import 'widgets/enrolled_course_tile.dart';

/// The authenticated home surface. Revalidates on app resume (part of the sync
/// strategy) and supports pull-to-refresh.
class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen>
    with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      ref.read(dashboardControllerProvider.notifier).refresh();
    }
  }

  void _openCourse(String courseId) {
    context.push(AppRoutes.courseDetailPath(courseId));
  }

  void _resume(String courseId) {
    context.push(AppRoutes.courseLearnPath(courseId));
  }

  String get _greeting {
    final h = DateTime.now().hour;
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final user = ref.watch(currentUserProvider);
    final async = ref.watch(dashboardControllerProvider);
    final firstName = (user?.name.trim().split(' ').first) ?? 'there';

    return Scaffold(
      body: RefreshIndicator(
        color: colors.goldPrimary,
        onRefresh: () => ref.read(dashboardControllerProvider.notifier).refresh(),
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            SliverAppBar(
              expandedHeight: 160,
              pinned: true,
              stretch: true,
              backgroundColor: colors.forestDeep,
              flexibleSpace: FlexibleSpaceBar(
                stretchModes: const [StretchMode.zoomBackground],
                background: Stack(
                  fit: StackFit.expand,
                  children: [
                    Image.asset(
                      'assets/images/hero-bg.png',
                      fit: BoxFit.cover,
                      alignment: Alignment.topCenter,
                    ),
                    DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            colors.forestDeep.withValues(alpha: 0.65),
                            colors.forestDeep.withValues(alpha: 0.95),
                          ],
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                        ),
                      ),
                    ),
                  ],
                ),
                titlePadding: const EdgeInsets.only(left: AppSpacing.lg, bottom: 16),
                title: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(_greeting,
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
                    child: Semantics(
                      button: true,
                      label: 'Account and settings',
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
                ),
              ],
            ),
            SliverPadding(
              padding: const EdgeInsets.only(left: AppSpacing.lg, right: AppSpacing.lg, top: AppSpacing.lg, bottom: 140),
              sliver: async.when(
                skipLoadingOnRefresh: true,
                skipLoadingOnReload: true,
                loading: () => const SliverToBoxAdapter(child: DashboardSkeleton()),
                error: (err, _) => SliverToBoxAdapter(
                  child: _ErrorView(
                    onRetry: () => ref.invalidate(dashboardControllerProvider),
                  ),
                ),
                data: (data) => _DashboardBodySliver(
                  data: data,
                  onOpenCourse: _openCourse,
                  onResumeCourse: _resume,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DashboardBodySliver extends StatelessWidget {
  const _DashboardBodySliver({
    required this.data,
    required this.onOpenCourse,
    required this.onResumeCourse,
  });

  final DashboardDto data;
  final void Function(String courseId) onOpenCourse;
  final void Function(String courseId) onResumeCourse;

  @override
  Widget build(BuildContext context) {
    if (data.isEmpty) {
      return SliverToBoxAdapter(
        child: Column(
          children: [
            SizedBox(height: MediaQuery.sizeOf(context).height * 0.12),
            const EmptyState(
              icon: Icons.school_outlined,
              title: 'No courses yet',
              message:
                  'Explore the catalog and enroll to start your learning journey.',
            ),
          ],
        ),
      );
    }

    final active = data.activeEnrollment;

    final overall = data.enrollments.isEmpty
        ? 0.0
        : data.enrollments.map((e) => e.progress).reduce((a, b) => a + b) /
            data.enrollments.length /
            100;

    return SliverList(
      delegate: SliverChildListDelegate([
        _StatsHero(
          progress: overall,
          inProgress: data.inProgressCount,
          certificates: data.certificatesCount,
          pending: data.pendingAssignmentsCount,
          onCertificates: () => context.push(AppRoutes.certificates),
          onPending: () => context.push(AppRoutes.assignments),
        ),
        if (active != null) ...[
          const SizedBox(height: AppSpacing.xl),
          ContinueLearningCard(
            enrollment: active,
            onResume: () => onResumeCourse(active.courseId),
          ),
        ],
        const SizedBox(height: AppSpacing.xl),
        const SectionHeader(title: 'My courses'),
        const SizedBox(height: AppSpacing.md),
        for (final e in data.enrollments) ...[
          RepaintBoundary(
            child: EnrolledCourseTile(
              enrollment: e,
              onTap: () => onOpenCourse(e.courseId),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
        ],
      ]),
    );
  }
}

class _ErrorView extends StatelessWidget {
  const _ErrorView({required this.onRetry});

  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(height: MediaQuery.sizeOf(context).height * 0.1),
        Padding(
          padding: const EdgeInsets.all(AppSpacing.xl),
          child: ErrorBanner(
            message: 'We couldn\'t load your dashboard. Pull to retry or tap below.',
            onRetry: onRetry,
          ),
        ),
      ],
    );
  }
}

/// Vibrant gradient snapshot: overall completion as a big ring plus tappable
/// metric chips. The energetic hero anchoring the student dashboard.
class _StatsHero extends StatelessWidget {
  const _StatsHero({
    required this.progress,
    required this.inProgress,
    required this.certificates,
    required this.pending,
    required this.onCertificates,
    required this.onPending,
  });

  final double progress;
  final int inProgress;
  final int certificates;
  final int pending;
  final VoidCallback onCertificates;
  final VoidCallback onPending;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [colors.forestMid, colors.forestDeep],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: AppRadii.rXl,
        boxShadow: AppShadows.card(colors.forestDeep),
      ),
      child: Row(
        children: [
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ProgressRing(
                value: progress,
                size: 74,
                stroke: 8,
                color: colors.goldLight,
                trackColor: Colors.white.withValues(alpha: 0.16),
                center: Text(
                  '${(progress * 100).round()}%',
                  style: text.titleMedium?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              Text('Overall',
                  style: text.labelSmall
                      ?.copyWith(color: Colors.white.withValues(alpha: 0.7)),),
            ],
          ),
          const SizedBox(width: AppSpacing.lg),
          Expanded(
            child: Column(
              children: [
                _MetricRow(
                  icon: Icons.menu_book_rounded,
                  label: 'In progress',
                  value: inProgress,
                ),
                Divider(
                    height: AppSpacing.lg,
                    color: Colors.white.withValues(alpha: 0.12),),
                _MetricRow(
                  icon: Icons.workspace_premium_rounded,
                  label: 'Certificates',
                  value: certificates,
                  onTap: onCertificates,
                ),
                Divider(
                    height: AppSpacing.lg,
                    color: Colors.white.withValues(alpha: 0.12),),
                _MetricRow(
                  icon: Icons.assignment_late_rounded,
                  label: 'Pending tasks',
                  value: pending,
                  onTap: onPending,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MetricRow extends StatelessWidget {
  const _MetricRow({
    required this.icon,
    required this.label,
    required this.value,
    this.onTap,
  });

  final IconData icon;
  final String label;
  final int value;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    return InkWell(
      onTap: onTap,
      borderRadius: AppRadii.rSm,
      child: Row(
        children: [
          Icon(icon, size: 18, color: colors.goldLight),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Text(label,
                style: text.bodyMedium
                    ?.copyWith(color: Colors.white.withValues(alpha: 0.85)),),
          ),
          Text('$value',
              style:
                  text.titleMedium?.copyWith(color: Colors.white, fontWeight: FontWeight.w800),),
          if (onTap != null) ...[
            const SizedBox(width: 2),
            Icon(Icons.chevron_right_rounded,
                size: 18, color: Colors.white.withValues(alpha: 0.5),),
          ],
        ],
      ),
    );
  }
}

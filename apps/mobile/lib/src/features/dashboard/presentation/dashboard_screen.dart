import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/i18n/app_translations.dart';
import '../../../core/i18n/i18n_extension.dart';
import '../../../core/localization/localized_text.dart';
import '../../../core/router/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/animated_press.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/error_banner.dart';
import '../../../shared/widgets/section_header.dart';
import '../../auth/application/auth_controller.dart';
import '../../certificates/data/certificate_dto.dart';
import '../../certificates/data/certificates_repository.dart';
import '../../notifications/application/notifications_controller.dart';
import '../application/dashboard_controller.dart';
import '../data/dashboard_dto.dart';
import 'widgets/dashboard_skeleton.dart';
import 'widgets/enrolled_course_tile.dart';

/// Resolves [key], falling back to [fallback] if the catalog hasn't loaded it
/// (e.g. a stale asset bundle) so a raw key is never shown to the user.
String _trOr(BuildContext context, String key, String fallback) {
  final v = context.tr(key);
  return v == key ? fallback : v;
}

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
    if (h < 12) return AppTranslations.tg('mobile.dashboard.greetingMorning');
    if (h < 17) return AppTranslations.tg('mobile.dashboard.greetingAfternoon');
    return AppTranslations.tg('mobile.dashboard.greetingEvening');
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final user = ref.watch(currentUserProvider);
    final async = ref.watch(dashboardControllerProvider);

    return Scaffold(
      backgroundColor: colors.background,
      body: RefreshIndicator(
        color: colors.goldPrimary,
        onRefresh: () => ref.read(dashboardControllerProvider.notifier).refresh(),
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            SliverToBoxAdapter(
              child: SafeArea(
                bottom: false,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(
                      AppSpacing.lg, AppSpacing.md, AppSpacing.lg, AppSpacing.xs,),
                  child: _GreetingHeader(
                    greeting: _greeting,
                    firstName: (user?.name.trim().split(' ').first) ??
                        context.tr('mobile.dashboard.friend'),
                    initials: user?.initials ?? '?',
                    unread: ref.watch(unreadCountProvider),
                    onProfile: () => context.go(AppRoutes.profile),
                    onNotifications: () => context.go(AppRoutes.notifications),
                  ),
                ),
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(
                  AppSpacing.lg, AppSpacing.md, AppSpacing.lg, 140,),
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

/// The home greeting row: avatar + greeting/name on the left, a notification
/// bell on the right — matching the reference home header.
class _GreetingHeader extends StatelessWidget {
  const _GreetingHeader({
    required this.greeting,
    required this.firstName,
    required this.initials,
    required this.unread,
    required this.onProfile,
    required this.onNotifications,
  });

  final String greeting;
  final String firstName;
  final String initials;
  final int unread;
  final VoidCallback onProfile;
  final VoidCallback onNotifications;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;

    return Row(
      children: [
        GestureDetector(
          onTap: onProfile,
          child: Container(
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: colors.goldPrimary, width: 2),
            ),
            child: CircleAvatar(
              radius: 22,
              backgroundColor: colors.goldPrimary.withValues(alpha: 0.15),
              child: Text(initials,
                  style: text.titleMedium?.copyWith(
                      color: colors.goldDark, fontWeight: FontWeight.w700,),),
            ),
          ),
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('$greeting, $firstName',
                  style: text.titleLarge, maxLines: 1, overflow: TextOverflow.ellipsis,),
              const SizedBox(height: 2),
              Text(context.tr('mobile.dashboard.greetingSubtitle'),
                  style: text.bodySmall?.copyWith(color: colors.textMuted),
                  maxLines: 1, overflow: TextOverflow.ellipsis,),
            ],
          ),
        ),
        AnimatedPress(
          onTap: onNotifications,
          child: Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: colors.surface,
              shape: BoxShape.circle,
              boxShadow: AppShadows.sm(colors.forestDeep),
            ),
            child: Stack(
              alignment: Alignment.center,
              children: [
                Icon(Icons.notifications_none_rounded,
                    color: colors.textSecondary, size: 22,),
                if (unread > 0)
                  Positioned(
                    top: 11,
                    right: 12,
                    child: Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: colors.danger,
                        shape: BoxShape.circle,
                        border: Border.all(color: colors.surface, width: 1.5),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ],
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
            EmptyState(
              icon: Icons.school_outlined,
              title: context.tr('mobile.dashboard.emptyTitle'),
              message: context.tr('mobile.dashboard.emptyMessage'),
            ),
          ],
        ),
      );
    }

    // Count learning units: standalone courses + programs (a program counts as
    // ONE unit, not its member courses). A program is complete when all its
    // member courses are complete.
    final standalone =
        data.enrollments.where((e) => e.course.program == null).toList();
    final programs =
        data.programEnrollments.where((pe) => pe.program != null).toList();

    bool programComplete(ProgramEnrollmentDto pe) {
      final courseIds = pe.program!.courses.map((c) => c.id).toSet();
      if (courseIds.isEmpty) return false;
      return courseIds.every((cid) {
        for (final e in data.enrollments) {
          if (e.courseId == cid) return e.isCompleted;
        }
        return false;
      });
    }

    final totalUnits = standalone.length + programs.length;
    final completedUnits =
        standalone.where((e) => e.isCompleted).length +
            programs.where(programComplete).length;
    final inProgressUnits = totalUnits - completedUnits;

    // "Continue Learning" spotlights an in-progress course only — never a
    // finished one. Prefer the server's active enrollment when unfinished,
    // else the first course still in progress; otherwise hide the section.
    EnrollmentDto? pickActive() {
      final a = data.activeEnrollment;
      if (a != null && !a.isCompleted) return a;
      for (final e in data.enrollments) {
        if (!e.isCompleted) return e;
      }
      return null;
    }

    final active = pickActive();
    // The rest list below shows every other course (completed ones included).
    final rest = data.enrollments.where((e) => e.courseId != active?.courseId);

    return SliverList(
      delegate: SliverChildListDelegate([
        const _VerseCard(),
        const SizedBox(height: AppSpacing.lg),
        Row(
          children: [
            Expanded(
              child: _StatCard(
                icon: Icons.menu_book_rounded,
                tint: context.colors.goldPrimary,
                value: '$totalUnits',
                label: context.tr('mobile.dashboard.statCourses'),
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: _StatCard(
                icon: Icons.play_circle_fill_rounded,
                tint: context.colors.forestMid,
                value: '$inProgressUnits',
                label: context.tr('mobile.dashboard.statInProgress'),
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: _StatCard(
                icon: Icons.workspace_premium_rounded,
                tint: context.colors.success,
                value: '$completedUnits',
                label: context.tr('mobile.dashboard.statCompleted'),
              ),
            ),
          ],
        ),
        if (active != null) ...[
          const SizedBox(height: AppSpacing.xl),
          SectionHeader(
            title: context.tr('mobile.dashboard.continueLearning'),
            actionLabel: context.tr('mobile.dashboard.viewAll'),
            onAction: () => context.go(AppRoutes.courses),
          ),
          const SizedBox(height: AppSpacing.md),
          EnrolledCourseTile(
            enrollment: active,
            onTap: () => onResumeCourse(active.courseId),
          ),
        ],
        const _CertificatesSection(),
        if (rest.isNotEmpty) ...[
          const SizedBox(height: AppSpacing.xl),
          SectionHeader(title: context.tr('student.courses.title')),
          const SizedBox(height: AppSpacing.md),
          for (final e in rest) ...[
            RepaintBoundary(
              child: EnrolledCourseTile(
                enrollment: e,
                onTap: () => onOpenCourse(e.courseId),
              ),
            ),
            const SizedBox(height: AppSpacing.md),
          ],
        ],
      ]),
    );
  }
}

/// A daily-scripture card — navy/midnight gradient with the verse and its
/// reference, mirroring the reference home screen.
class _VerseCard extends StatelessWidget {
  const _VerseCard();

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.xl),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [colors.forestLight, colors.forestMid, colors.forestDeep],
          stops: const [0.0, 0.45, 1.0],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: AppRadii.rXl,
        border: Border.all(color: colors.goldPrimary.withValues(alpha: 0.15)),
        boxShadow: AppShadows.card(colors.forestDeep),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 4,
            height: 44,
            margin: const EdgeInsets.only(right: AppSpacing.md, top: 2),
            decoration: BoxDecoration(
              gradient: colors.goldGradient,
              borderRadius: AppRadii.rPill,
            ),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  context.tr('mobile.dashboard.verseText'),
                  style: text.titleMedium?.copyWith(
                    color: Colors.white,
                    height: 1.45,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  context.tr('mobile.dashboard.verseRef'),
                  style: text.labelMedium?.copyWith(
                    color: colors.goldLight,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.3,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              gradient: colors.goldGradient,
              borderRadius: AppRadii.rMd,
              boxShadow: AppShadows.glow(colors.goldDark.withValues(alpha: 0.4)),
            ),
            child: const Icon(Icons.auto_stories_rounded, color: Colors.white, size: 26),
          ),
        ],
      ),
    );
  }
}

/// A compact home statistic card: tinted icon, big value, muted label.
class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.icon,
    required this.tint,
    required this.value,
    required this.label,
  });

  final IconData icon;
  final Color tint;
  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;

    return Container(
      padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.sm, vertical: AppSpacing.md,),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: AppRadii.rLg,
        boxShadow: AppShadows.card(colors.forestDeep),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: tint.withValues(alpha: 0.16),
              borderRadius: AppRadii.rMd,
            ),
            child: Icon(icon, color: tint, size: 24),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(value,
              style: text.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w800, color: colors.textPrimary,),),
          const SizedBox(height: 1),
          Text(
            label,
            textAlign: TextAlign.center,
            style: text.labelSmall?.copyWith(
                color: colors.textSecondary, fontWeight: FontWeight.w500,),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
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
            message: context.tr('mobile.dashboard.loadError'),
            onRetry: onRetry,
          ),
        ),
      ],
    );
  }
}

/// Home "Certificates" section — shows the student's earned certificates with a
/// link to the full list. Hidden entirely when none have been earned.
class _CertificatesSection extends ConsumerWidget {
  const _CertificatesSection();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final certs = ref.watch(myCertificatesProvider).valueOrNull ?? const [];
    if (certs.isEmpty) return const SizedBox.shrink();

    final shown = certs.take(3).toList();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SizedBox(height: AppSpacing.xl),
        SectionHeader(
          title: _trOr(context, 'mobile.certificates.title', 'Certificates'),
          actionLabel: certs.length > shown.length
              ? context.tr('mobile.dashboard.viewAll')
              : null,
          onAction: certs.length > shown.length
              ? () => context.push(AppRoutes.certificates)
              : null,
        ),
        const SizedBox(height: AppSpacing.md),
        for (final c in shown) ...[
          _CertificateTile(certificate: c),
          const SizedBox(height: AppSpacing.md),
        ],
      ],
    );
  }
}

class _CertificateTile extends StatelessWidget {
  const _CertificateTile({required this.certificate});

  final CertificateDto certificate;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final title = certificate.titleText.resolveFor(context);

    return AnimatedPress(
      onTap: () => context.push(
        AppRoutes.certificatePath(certificate.id),
        extra: certificate,
      ),
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: colors.surface,
          borderRadius: AppRadii.rLg,
          boxShadow: AppShadows.card(colors.forestDeep),
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                gradient: colors.goldGradient,
                borderRadius: AppRadii.rMd,
                boxShadow: AppShadows.glow(colors.goldDark.withValues(alpha: 0.35)),
              ),
              child: const Icon(Icons.workspace_premium_rounded,
                  color: Colors.white, size: 26,),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    title.isEmpty ? _trOr(context, 'mobile.certificates.title', 'Certificates') : title,
                    style: text.titleSmall,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (certificate.issuedAt != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      '${context.tr('mobile.certificates.issued')} · ${Formatters.date(certificate.issuedAt!)}',
                      style: text.bodySmall?.copyWith(color: colors.textMuted),
                    ),
                  ],
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

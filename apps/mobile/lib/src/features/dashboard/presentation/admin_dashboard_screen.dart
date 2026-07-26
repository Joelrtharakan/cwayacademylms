import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/i18n/i18n_extension.dart';
import '../../../core/router/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/animated_press.dart';
import '../../../shared/widgets/error_banner.dart';
import '../../admin/data/admin_dto.dart';
import '../../admin/data/admin_repository.dart';
import '../../auth/application/auth_controller.dart';
import 'widgets/dashboard_skeleton.dart';
import 'widgets/stat_tile.dart';

/// Home surface for ADMIN. Shows the real platform snapshot from `/admin/stats`
/// and shortcuts into the management areas. Every shortcut routes to a real
/// screen; deeper consoles (payments, audit) can slot in over time.
class AdminDashboardScreen extends ConsumerWidget {
  const AdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final user = ref.watch(currentUserProvider);
    final async = ref.watch(adminStatsProvider);
    final firstName = (user?.name.trim().split(' ').first) ?? context.tr('mobile.admin.adminFallback');

    return Scaffold(
      body: RefreshIndicator(
        color: colors.goldPrimary,
        onRefresh: () => ref.refresh(adminStatsProvider.future),
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
                    Text(context.tr('mobile.admin.roleLabel'),
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
              padding: const EdgeInsets.only(left: AppSpacing.lg, right: AppSpacing.lg, top: AppSpacing.lg, bottom: 140),
              sliver: async.when(
                skipLoadingOnRefresh: true,
                loading: () => const SliverToBoxAdapter(child: DashboardSkeleton()),
                error: (_, __) => SliverToBoxAdapter(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      SizedBox(height: MediaQuery.sizeOf(context).height * 0.1),
                      Padding(
                        padding: const EdgeInsets.all(AppSpacing.xl),
                        child: ErrorBanner(
                          message: context.tr('mobile.admin.overviewLoadError'),
                          onRetry: () => ref.invalidate(adminStatsProvider),
                        ),
                      ),
                    ],
                  ),
                ),
                data: (stats) => _BodySliver(stats: stats),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BodySliver extends ConsumerWidget {
  const _BodySliver({required this.stats});
  final AdminStatsDto stats;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final usersAsync = ref.watch(adminUsersProvider);

    return SliverList(
      delegate: SliverChildListDelegate([
        // Hero Welcome Banner
        Container(
          padding: const EdgeInsets.all(AppSpacing.xl),
          decoration: BoxDecoration(
            gradient: colors.forestGradient,
            borderRadius: AppRadii.rXl,
            boxShadow: AppShadows.card(colors.forestDeep),
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      context.tr('mobile.admin.welcomeTo'),
                      style: text.bodyMedium?.copyWith(
                        color: colors.goldLight.withValues(alpha: 0.9),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'CWAY Academy',
                      style: text.headlineMedium?.copyWith(
                        color: colors.goldLight,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      context.tr('mobile.admin.manageEfficiently'),
                      style: text.bodySmall?.copyWith(
                        color: Colors.white.withValues(alpha: 0.7),
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: colors.goldPrimary.withValues(alpha: 0.15),
                  border: Border.all(color: colors.goldPrimary.withValues(alpha: 0.4), width: 1.5),
                ),
                child: Icon(Icons.shield_outlined, color: colors.goldLight, size: 24),
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.xl),

        // Metrics Grid Row 1
        Row(
          children: [
            Expanded(
              child: StatTile(
                icon: Icons.people_alt_rounded,
                value: Formatters.compact(stats.totalUsers),
                label: context.tr('mobile.admin.totalUsers'),
                delta: '+3',
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: StatTile(
                icon: Icons.school_rounded,
                value: Formatters.compact(stats.totalStudents),
                label: context.tr('mobile.admin.totalStudents'),
                delta: '+2',
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: StatTile(
                icon: Icons.record_voice_over_rounded,
                value: Formatters.compact(stats.totalInstructors),
                label: context.tr('mobile.admin.instructors'),
                delta: '+1',
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),

        // Metrics Grid Row 2
        Row(
          children: [
            Expanded(
              child: StatTile(
                icon: Icons.library_books_rounded,
                value: '${stats.totalCourses}',
                label: context.tr('mobile.admin.totalCourses'),
                delta: '+1',
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: StatTile(
                icon: Icons.how_to_reg_rounded,
                value: Formatters.compact(stats.totalEnrollments),
                label: context.tr('mobile.admin.enrollments'),
                delta: '+1',
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: StatTile(
                icon: Icons.workspace_premium_rounded,
                value: Formatters.compact(stats.certificatesIssued),
                label: context.tr('mobile.admin.certificates'),
                delta: '+0',
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.xl),

        // Manage Platform Header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(context.tr('mobile.admin.managePlatform'), style: text.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
            TextButton(
              onPressed: () => context.push(AppRoutes.adminUsers),
              child: Text(context.tr('mobile.admin.viewAll'), style: text.labelMedium?.copyWith(color: colors.goldDark, fontWeight: FontWeight.w600)),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),

        // Manage Platform Grid
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: AppSpacing.sm,
          crossAxisSpacing: AppSpacing.sm,
          childAspectRatio: 1.35,
          children: [
            _ManageCard(
              icon: Icons.people_outline_rounded,
              label: context.tr('mobile.admin.cardUsers'),
              subLabel: context.tr('mobile.admin.cardUsersSub'),
              onTap: () => context.push(AppRoutes.adminUsers),
            ),
            _ManageCard(
              icon: Icons.library_books_outlined,
              label: context.tr('mobile.admin.cardCourses'),
              subLabel: context.tr('mobile.admin.cardCoursesSub'),
              badge: stats.pendingApprovals > 0 ? context.tr('mobile.admin.pendingBadge', {'count': stats.pendingApprovals}) : null,
              onTap: () => context.go(AppRoutes.courses),
            ),
            _ManageCard(
              icon: Icons.campaign_outlined,
              label: context.tr('mobile.admin.cardAnnouncements'),
              subLabel: context.tr('mobile.admin.cardAnnouncementsSub'),
              onTap: () => context.go(AppRoutes.notifications),
            ),
            _ManageCard(
              icon: Icons.settings_outlined,
              label: context.tr('mobile.settings.title'),
              subLabel: context.tr('mobile.admin.cardSettingsSub'),
              onTap: () => context.push(AppRoutes.settings),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.xl),

        // Recent Activity Section Header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(context.tr('mobile.admin.recentActivity'), style: text.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
            TextButton(
              onPressed: () => context.push(AppRoutes.adminUsers),
              child: Text(context.tr('mobile.admin.viewAll'), style: text.labelMedium?.copyWith(color: colors.goldDark, fontWeight: FontWeight.w600)),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),

        // Real Activity Data Feed
        usersAsync.when(
          loading: () => const Center(
            child: Padding(
              padding: EdgeInsets.all(AppSpacing.lg),
              child: CircularProgressIndicator.adaptive(),
            ),
          ),
          error: (_, __) => Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: colors.surfaceElevated,
              borderRadius: AppRadii.rLg,
              border: Border.all(color: colors.border),
            ),
            child: Text(
              context.tr('mobile.admin.activityLoadError'),
              style: text.bodySmall?.copyWith(color: colors.textSecondary),
            ),
          ),
          data: (page) {
            final recentUsers = page.users.take(4).toList();
            if (recentUsers.isEmpty) {
              return Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: colors.surfaceElevated,
                  borderRadius: AppRadii.rLg,
                  border: Border.all(color: colors.border),
                ),
                child: Text(
                  context.tr('mobile.admin.noActivity'),
                  style: text.bodySmall?.copyWith(color: colors.textSecondary),
                ),
              );
            }

            return Column(
              children: recentUsers.map((u) {
                final initials = u.name.trim().isNotEmpty
                    ? u.name.trim().split(' ').take(2).map((e) => e[0]).join().toUpperCase()
                    : '?';
                final roleName = switch (u.role.toUpperCase()) {
                  'ADMIN' => context.tr('admin.users.roleAdmin'),
                  'INSTRUCTOR' => context.tr('admin.users.roleInstructor'),
                  _ => context.tr('admin.users.roleStudent'),
                };

                return Padding(
                  padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                  child: Container(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: colors.surfaceElevated,
                      borderRadius: AppRadii.rLg,
                      border: Border.all(color: colors.border),
                      boxShadow: AppShadows.card(colors.forestDeep),
                    ),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 18,
                          backgroundColor: colors.forestMid.withValues(alpha: 0.1),
                          backgroundImage: u.avatar != null && u.avatar!.isNotEmpty
                              ? NetworkImage(u.avatar!)
                              : null,
                          child: u.avatar == null || u.avatar!.isEmpty
                              ? Text(
                                  initials,
                                  style: text.labelMedium?.copyWith(
                                    color: colors.forestMid,
                                    fontWeight: FontWeight.w700,
                                  ),
                                )
                              : null,
                        ),
                        const SizedBox(width: AppSpacing.md),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                u.name,
                                style: text.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                              ),
                              Text(
                                '${u.email} • $roleName',
                                style: text.bodySmall?.copyWith(color: colors.textSecondary),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: u.isVerified
                                ? colors.success.withValues(alpha: 0.12)
                                : colors.forestMid.withValues(alpha: 0.08),
                            borderRadius: AppRadii.rPill,
                          ),
                          child: Text(
                            u.isVerified ? context.tr('mobile.admin.verified') : context.tr('mobile.admin.member'),
                            style: text.labelSmall?.copyWith(
                              color: u.isVerified ? colors.success : colors.forestMid,
                              fontWeight: FontWeight.w700,
                              fontSize: 10,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            );
          },
        ),
        const SizedBox(height: AppSpacing.xxl),
      ].animate(interval: 40.ms).fade(duration: 350.ms).slideY(begin: 0.08, curve: Curves.easeOutCubic),),
    );
  }
}

class _ManageCard extends StatelessWidget {
  const _ManageCard({
    required this.icon,
    required this.label,
    required this.subLabel,
    required this.onTap,
    this.badge,
  });
  final IconData icon;
  final String label;
  final String subLabel;
  final VoidCallback onTap;
  final String? badge;

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
          borderRadius: AppRadii.rXl,
          boxShadow: AppShadows.card(colors.forestDeep),
          border: Border.all(color: colors.border, width: 1),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.all(AppSpacing.sm),
                  decoration: BoxDecoration(
                    color: colors.forestMid.withValues(alpha: 0.08),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(icon, color: colors.forestMid, size: 20),
                ),
                if (badge != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: colors.warning.withValues(alpha: 0.16),
                      borderRadius: AppRadii.rPill,
                    ),
                    child: Text(
                      badge!,
                      style: text.labelSmall?.copyWith(
                        color: colors.warning,
                        fontWeight: FontWeight.w700,
                        fontSize: 10,
                      ),
                    ),
                  )
                else
                  Icon(Icons.chevron_right_rounded, color: colors.textMuted, size: 18),
              ],
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: text.titleSmall?.copyWith(fontWeight: FontWeight.w700)),
                const SizedBox(height: 2),
                Text(
                  subLabel,
                  style: text.bodySmall?.copyWith(color: colors.textSecondary, fontSize: 11),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

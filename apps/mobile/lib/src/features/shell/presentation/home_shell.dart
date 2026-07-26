
import 'package:cway_academy/l10n/app_localizations.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/offline/connectivity.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';
import '../../../shared/widgets/animated_press.dart';
import '../../auth/application/auth_controller.dart';
import '../../notifications/application/notifications_controller.dart';

/// Persistent bottom-navigation shell wrapping the primary tabs. Each tab keeps
/// its own navigation stack and scroll state via [StatefulShellRoute].
class HomeShell extends ConsumerWidget {
  const HomeShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  void _onTap(int index) {
    navigationShell.goBranch(
      index,
      // Re-tapping the active tab pops it to its root.
      initialLocation: index == navigationShell.currentIndex,
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = context.colors;
    final unread = ref.watch(unreadCountProvider);
    final online = ref.watch(isOnlineProvider);
    final l = AppLocalizations.of(context);
    final user = ref.watch(currentUserProvider);
    final manages = (user?.isAdmin ?? false) || (user?.isInstructor ?? false);

    // Tab 0 (Home) and tab 1 (Courses) adapt to role. Students browse the
    // catalog and see their enrolled courses on Home; instructors/admins get a
    // teaching/management overview on Home and manage owned courses on tab 1.
    final homeLabel = manages ? 'Home' : l.navLearn;
    final coursesLabel = (user?.isAdmin ?? false)
        ? 'Courses'
        : (user?.isInstructor ?? false)
            ? 'My Courses'
            : l.navCourses;
    final coursesIcon =
        manages ? Icons.library_books_outlined : Icons.explore_outlined;
    final coursesSelectedIcon =
        manages ? Icons.library_books_rounded : Icons.explore_rounded;

    return Scaffold(
      backgroundColor: colors.background,
      body: Stack(
        children: [
          Column(
            children: [
              if (!online) _OfflineBanner(colors: colors),
              Expanded(child: navigationShell),
            ],
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Stack(
              children: [
                IgnorePointer(
                  child: Container(
                    height: 120,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.bottomCenter,
                        end: Alignment.topCenter,
                        colors: [
                          colors.background,
                          colors.background.withValues(alpha: 0.8),
                          colors.background.withValues(alpha: 0.0),
                        ],
                      ),
                    ),
                  ),
                ),
                Padding(
                  padding: EdgeInsets.only(
                    bottom: MediaQuery.paddingOf(context).bottom,
                    top: AppSpacing.md,
                  ),
                  child: SafeArea(
                    top: false,
                    bottom: false,
                    child: Center(
                      child: ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 400),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                          child: ClipRRect(
                            borderRadius: AppRadii.rPill,
                            child: Container(
                              margin: const EdgeInsets.only(bottom: AppSpacing.md),
                              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: 8),
                              decoration: BoxDecoration(
                                color: Theme.of(context).brightness == Brightness.light
                                    ? colors.surface.withValues(alpha: 0.96)
                                    : colors.surfaceGlass,
                                borderRadius: AppRadii.rPill,
                                boxShadow: AppShadows.glass(colors.forestDeep),
                                border: Border.all(
                                  color: Theme.of(context).brightness == Brightness.light
                                      ? colors.border.withValues(alpha: 0.3)
                                      : colors.border.withValues(alpha: 0.5),
                                ),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceAround,
                                children: [
                                  _NavItem(
                                    icon: Icons.home_outlined,
                                    activeIcon: Icons.home_rounded,
                                    label: homeLabel,
                                    isActive: navigationShell.currentIndex == 0,
                                    onTap: () => _onTap(0),
                                  ),
                                  _NavItem(
                                    icon: coursesIcon,
                                    activeIcon: coursesSelectedIcon,
                                    label: coursesLabel,
                                    isActive: navigationShell.currentIndex == 1,
                                    onTap: () => _onTap(1),
                                  ),
                                  _NavItem(
                                    icon: Icons.notifications_none_rounded,
                                    activeIcon: Icons.notifications_rounded,
                                    label: l.navAlerts,
                                    badge: unread,
                                    isActive: navigationShell.currentIndex == 2,
                                    onTap: () => _onTap(2),
                                  ),
                                  _NavItem(
                                    icon: Icons.person_outline_rounded,
                                    activeIcon: Icons.person_rounded,
                                    label: l.navProfile,
                                    isActive: navigationShell.currentIndex == 3,
                                    onTap: () => _onTap(3),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.isActive,
    required this.onTap,
    this.badge = 0,
  });

  final IconData icon;
  final IconData activeIcon;
  final String label;
  final bool isActive;
  final VoidCallback onTap;
  final int badge;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;

    Widget iconWidget = Icon(
      isActive ? activeIcon : icon,
      color: isActive ? colors.goldPrimary : colors.textMuted,
      size: 24,
    );

    if (badge > 0) {
      iconWidget = Badge(
        label: Text(badge > 99 ? '99+' : '$badge'),
        child: iconWidget,
      );
    }

    return Semantics(
      button: true,
      selected: isActive,
      label: label,
      child: AnimatedPress(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 8),
          decoration: BoxDecoration(
            color: isActive ? colors.goldPrimary.withValues(alpha: 0.1) : Colors.transparent,
            borderRadius: AppRadii.rPill,
          ),
          child: AnimatedSize(
            duration: AppMotion.fast,
            curve: Curves.easeInOut,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                iconWidget,
                if (isActive) ...[
                  const SizedBox(width: AppSpacing.xs),
                  Text(
                    label,
                    style: text.labelSmall?.copyWith(
                      color: colors.goldPrimary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _OfflineBanner extends StatelessWidget {
  const _OfflineBanner({required this.colors});
  final AppColors colors;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: colors.forestDeep,
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.lg, vertical: AppSpacing.sm,),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.cloud_off_rounded, size: 16, color: colors.goldLight),
              const SizedBox(width: AppSpacing.sm),
              Text(
                "You're offline — showing saved content",
                style: Theme.of(context)
                    .textTheme
                    .labelMedium
                    ?.copyWith(color: Colors.white),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

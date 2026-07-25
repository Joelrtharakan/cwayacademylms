import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';

/// Shared branded shell for all auth screens: a forest-gradient hero carrying
/// the CWAY mark, then a rounded cream sheet with the form. Keeps login/
/// register/reset visually consistent with the website's auth pages.
class AuthScaffold extends StatelessWidget {
  const AuthScaffold({
    super.key,
    required this.title,
    required this.subtitle,
    required this.children,
    this.onBack,
  });

  final String title;
  final String subtitle;
  final List<Widget> children;
  final VoidCallback? onBack;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: colors.forestDeep,
      body: Stack(
        children: [
          // Forest hero backdrop with a soft gold glow behind the mark.
          _HeroBackdrop(colors: colors),
          SafeArea(
            child: LayoutBuilder(
              builder: (context, constraints) {
                return SingleChildScrollView(
                  keyboardDismissBehavior:
                      ScrollViewKeyboardDismissBehavior.onDrag,
                  child: ConstrainedBox(
                    constraints:
                        BoxConstraints(minHeight: constraints.maxHeight),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        if (onBack != null)
                          Align(
                            alignment: Alignment.centerLeft,
                            child: Padding(
                              padding: const EdgeInsets.only(
                                left: AppSpacing.md,
                                top: AppSpacing.sm,
                              ),
                              child: IconButton(
                                onPressed: onBack,
                                icon: const Icon(Icons.arrow_back_rounded),
                                color: colors.goldLight,
                                tooltip: 'Back',
                              ),
                            ),
                          )
                        else
                          const SizedBox(height: AppSpacing.xxl),
                        const SizedBox(height: AppSpacing.lg),
                        _Logo(colors: colors),
                        const SizedBox(height: AppSpacing.lg),
                        Text(
                          'CWAY ACADEMY',
                          textAlign: TextAlign.center,
                          style: text.labelMedium?.copyWith(
                            color: colors.goldLight,
                            letterSpacing: 3,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.xl),
                        // The cream sheet that holds the actual form.
                        _Sheet(
                          colors: colors,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(title, style: text.displaySmall),
                              const SizedBox(height: AppSpacing.sm),
                              Text(
                                subtitle,
                                style: text.bodyLarge
                                    ?.copyWith(color: colors.textSecondary),
                              ),
                              const SizedBox(height: AppSpacing.xxl),
                              ...children,
                            ].animate(interval: 50.ms).fade(duration: 400.ms).slideY(begin: 0.1, curve: Curves.easeOutQuad),
                          ),
                        ).animate().fade(duration: 500.ms, delay: 200.ms).slideY(begin: 0.2, curve: Curves.easeOutCubic),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _HeroBackdrop extends StatelessWidget {
  const _HeroBackdrop({required this.colors});
  final AppColors colors;

  @override
  Widget build(BuildContext context) {
    return Positioned.fill(
      child: DecoratedBox(
        decoration: BoxDecoration(gradient: colors.forestGradient),
        child: Align(
          alignment: const Alignment(0, -0.75),
          child: Container(
            width: 320,
            height: 320,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  colors.goldPrimary.withValues(alpha: 0.28),
                  colors.goldPrimary.withValues(alpha: 0.0),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _Sheet extends StatelessWidget {
  const _Sheet({required this.colors, required this.child});
  final AppColors colors;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: colors.surfaceElevated,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
        boxShadow: [
          BoxShadow(
            color: colors.forestDeep.withValues(alpha: 0.25),
            blurRadius: 40,
            offset: const Offset(0, -12),
          ),
          BoxShadow(
            color: colors.goldDark.withValues(alpha: 0.1),
            blurRadius: 20,
            spreadRadius: 2,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.xl,
        AppSpacing.xxl,
        AppSpacing.xl,
        AppSpacing.xxl,
      ),
      child: child,
    );
  }
}

class _Logo extends StatelessWidget {
  const _Logo({required this.colors});
  final AppColors colors;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        width: 96,
        height: 96,
        padding: const EdgeInsets.all(6),
        decoration: BoxDecoration(
          color: Colors.white,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: colors.goldPrimary.withValues(alpha: 0.35),
              blurRadius: 28,
              spreadRadius: 2,
            ),
          ],
        ),
        child: ClipOval(
          child: Image.asset(
            'assets/images/logo.png',
            fit: BoxFit.cover,
          ),
        ),
      ),
    );
  }
}

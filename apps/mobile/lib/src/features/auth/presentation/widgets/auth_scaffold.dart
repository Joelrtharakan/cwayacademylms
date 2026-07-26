import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';

/// Shared branded shell for all auth screens: a forest-gradient hero carrying
/// the CWAY mark, then a rounded surface sheet extending seamlessly to the screen bottom.
class AuthScaffold extends StatelessWidget {
  const AuthScaffold({
    super.key,
    required this.title,
    required this.subtitle,
    required this.children,
    this.badgeText,
    this.onBack,
  });

  final String title;
  final String subtitle;
  final List<Widget> children;
  final String? badgeText;
  final VoidCallback? onBack;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: colors.forestDeep,
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: BoxDecoration(gradient: colors.forestGradient),
        child: Column(
          children: [
            SafeArea(
              bottom: false,
              child: Column(
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
                    const SizedBox(height: AppSpacing.md),
                  _Logo(colors: colors),
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    'CWAY ACADEMY',
                    textAlign: TextAlign.center,
                    style: text.labelMedium?.copyWith(
                      color: colors.goldLight,
                      letterSpacing: 3,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.lg),
                ],
              ),
            ),
            Expanded(
              child: Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: colors.surfaceElevated,
                  borderRadius:
                      const BorderRadius.vertical(top: Radius.circular(32)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.25),
                      blurRadius: 30,
                      offset: const Offset(0, -10),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius:
                      const BorderRadius.vertical(top: Radius.circular(32)),
                  child: SingleChildScrollView(
                    keyboardDismissBehavior:
                        ScrollViewKeyboardDismissBehavior.onDrag,
                    padding: const EdgeInsets.fromLTRB(
                      AppSpacing.xl,
                      AppSpacing.lg,
                      AppSpacing.xl,
                      AppSpacing.xxl,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Center(
                          child: Container(
                            width: 38,
                            height: 4,
                            decoration: BoxDecoration(
                              color: colors.border.withValues(alpha: 0.6),
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                        ),
                        const SizedBox(height: AppSpacing.lg),
                        if (badgeText != null) ...[
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: AppSpacing.md,
                              vertical: AppSpacing.xs,
                            ),
                            decoration: BoxDecoration(
                              color: colors.goldPrimary.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: colors.goldPrimary.withValues(alpha: 0.3),
                              ),
                            ),
                            child: Text(
                              badgeText!.toUpperCase(),
                              style: text.labelSmall?.copyWith(
                                color: colors.goldDark,
                                letterSpacing: 1.5,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          const SizedBox(height: AppSpacing.sm),
                        ],
                        Text(
                          title,
                          style: text.displaySmall?.copyWith(
                            fontWeight: FontWeight.bold,
                            letterSpacing: -0.5,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.xs),
                        Text(
                          subtitle,
                          style: text.bodyLarge?.copyWith(
                            color: colors.textSecondary,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.xl),
                        ...children,
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Logo extends StatelessWidget {
  const _Logo({required this.colors});
  final AppColors colors;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 80,
      height: 80,
      decoration: BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.2),
            blurRadius: 20,
            spreadRadius: 2,
          ),
        ],
      ),
      child: ClipOval(
        child: Container(
          color: Colors.white,
          child: Image.asset('assets/images/logo.png', fit: BoxFit.cover),
        ),
      ),
    );
  }
}

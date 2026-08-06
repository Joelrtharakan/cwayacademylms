import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/i18n/i18n_extension.dart';
import '../../../core/router/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';
import '../../../shared/widgets/primary_button.dart';

/// Public entry point shown on launch for prospective students. Lets them
/// browse programs and standalone courses, apply for admission, or sign in.
class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  void _browsePrograms(BuildContext context) => context.push(AppRoutes.programsBrowse);
  void _browseCourses(BuildContext context) => context.push(AppRoutes.coursesBrowse);
  void _signIn(BuildContext context) => context.push(AppRoutes.login);

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;

    return Scaffold(
      backgroundColor: colors.forestDeep,
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: BoxDecoration(gradient: colors.forestGradient),
        child: SafeArea(
          child: Column(
            children: [
              const SizedBox(height: AppSpacing.xl),
              _Brand(colors: colors),
              const SizedBox(height: AppSpacing.lg),
              Expanded(
                child: _Sheet(
                  colors: colors,
                  child: SingleChildScrollView(
                    child: Center(
                      child: ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 480),
                        child: _Actions(
                          onBrowsePrograms: () => _browsePrograms(context),
                          onBrowseCourses: () => _browseCourses(context),
                          onSignIn: () => _signIn(context),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Brand extends StatelessWidget {
  const _Brand({required this.colors});
  final AppColors colors;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 96,
          height: 96,
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
              child: Image.asset(
                'assets/images/logo.png',
                fit: BoxFit.cover,
              ),
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        Text(
          'CWAY ACADEMY',
          style: text.labelMedium?.copyWith(
            color: colors.goldLight,
            letterSpacing: 3,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
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
        color: colors.background,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.18),
            blurRadius: 40,
            offset: const Offset(0, -12),
          ),
        ],
      ),
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.xl,
        AppSpacing.xxl,
        AppSpacing.xl,
        AppSpacing.xl,
      ),
      child: child,
    );
  }
}

class _Actions extends StatelessWidget {
  const _Actions({
    required this.onBrowsePrograms,
    required this.onBrowseCourses,
    required this.onSignIn,
  });

  final VoidCallback onBrowsePrograms;
  final VoidCallback onBrowseCourses;
  final VoidCallback onSignIn;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          context.tr('mobile.welcome.title'),
          textAlign: TextAlign.center,
          style: text.displaySmall,
        ),
        const SizedBox(height: AppSpacing.sm),
        Text(
          context.tr('mobile.welcome.subtitle'),
          textAlign: TextAlign.center,
          style: text.bodyLarge?.copyWith(color: colors.textSecondary),
        ),
        const SizedBox(height: AppSpacing.xl),
        PrimaryButton(
          label: context.tr('mobile.welcome.browsePrograms'),
          icon: Icons.explore_rounded,
          variant: ButtonVariant.gold,
          onPressed: onBrowsePrograms,
        ),
        const SizedBox(height: AppSpacing.md),
        PrimaryButton(
          label: context.tr('mobile.welcome.browseCourses'),
          icon: Icons.menu_book_rounded,
          variant: ButtonVariant.outline,
          onPressed: onBrowseCourses,
        ),
        const SizedBox(height: AppSpacing.xl),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              context.tr('mobile.welcome.alreadyStudent'),
              style: text.bodyMedium?.copyWith(color: colors.textSecondary),
            ),
            TextButton(
              onPressed: onSignIn,
              child: Text(context.tr('auth.login.sign_in')),
            ),
          ],
        ),
      ],
    );
  }
}

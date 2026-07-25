import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';
import '../../../shared/widgets/primary_button.dart';
import 'widgets/auth_scaffold.dart';

/// Shown after registration. The backend sends a verification email; the user
/// must verify before they can sign in (login returns 403 until then).
class VerifyEmailScreen extends StatelessWidget {
  const VerifyEmailScreen({super.key, this.email});

  final String? email;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final target = (email == null || email!.isEmpty) ? 'your inbox' : email!;

    return AuthScaffold(
      title: 'Verify your email',
      subtitle: 'One quick step before you sign in.',
      children: [
        Center(
          child: Container(
            width: 96,
            height: 96,
            decoration: BoxDecoration(
              color: colors.goldPrimary.withValues(alpha: 0.12),
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.mark_email_unread_outlined,
                size: 44, color: colors.goldPrimary,),
          ),
        ),
        const SizedBox(height: AppSpacing.xxl),
        Text.rich(
          TextSpan(
            style: text.bodyLarge?.copyWith(color: colors.textSecondary),
            children: [
              const TextSpan(text: 'We sent a verification link to '),
              TextSpan(
                text: target,
                style: TextStyle(
                    color: colors.textPrimary, fontWeight: FontWeight.w700,),
              ),
              const TextSpan(
                  text: '. Open it to activate your account, then sign in.',),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.xxl),
        PrimaryButton(
          label: 'Back to sign in',
          variant: ButtonVariant.gold,
          onPressed: () => context.go(AppRoutes.login),
        ),
      ],
    );
  }
}

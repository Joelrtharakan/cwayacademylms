import 'package:flutter/material.dart';

import '../../core/i18n/app_translations.dart';
import '../../core/theme/app_colors.dart';

/// Friendly replacement for the default red error screen in release builds.
/// Kept dependency-light and self-contained (wraps its own Directionality) so
/// it renders even if the failure happened high in the tree.
class AppErrorWidget extends StatelessWidget {
  const AppErrorWidget({super.key, this.details});

  final FlutterErrorDetails? details;

  @override
  Widget build(BuildContext context) {
    const bg = AppColors.light; // safe defaults; theme may be unavailable here
    return Directionality(
      textDirection: TextDirection.ltr,
      child: Container(
        color: bg.background,
        alignment: Alignment.center,
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.sentiment_dissatisfied_rounded,
                size: 56, color: bg.textMuted,),
            const SizedBox(height: 16),
            Text(
              AppTranslations.tg('mobile.common.somethingWrong'),
              style: TextStyle(
                color: bg.textPrimary,
                fontSize: 18,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              AppTranslations.tg('mobile.errors.restartApp'),
              textAlign: TextAlign.center,
              style: TextStyle(color: bg.textSecondary, fontSize: 14),
            ),
          ],
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';

import '../../../../core/i18n/i18n_extension.dart';
import '../../../../core/localization/localized_text.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/formatters.dart';
import '../../data/certificate_dto.dart';

/// A framed, branded certificate visual. Used both as a gallery tile (compact)
/// and as the full preview on the detail screen.
class CertificateCard extends StatelessWidget {
  const CertificateCard({
    super.key,
    required this.certificate,
    required this.recipientName,
    this.compact = false,
  });

  final CertificateDto certificate;
  final String recipientName;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final title = certificate.titleText.resolveFor(context);
    final pad = compact ? AppSpacing.lg : AppSpacing.xl;

    return AspectRatio(
      aspectRatio: compact ? 1.6 : 1.42,
      child: Container(
        padding: EdgeInsets.all(pad),
        decoration: BoxDecoration(
          gradient: colors.forestGradient,
          borderRadius: AppRadii.rLg,
          border: Border.all(color: colors.goldPrimary, width: 2),
          boxShadow: AppShadows.md(colors.forestDeep),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              children: [
                Icon(Icons.workspace_premium_rounded,
                    color: colors.goldLight, size: compact ? 26 : 40,),
                SizedBox(height: compact ? 4 : AppSpacing.sm),
                Text(
                  certificate.isProgram
                      ? context.tr('mobile.certificates.ofAchievement')
                      : context.tr('mobile.certificates.ofCompletion'),
                  style: TextStyle(
                    color: colors.goldLight,
                    fontSize: compact ? 9 : 11,
                    letterSpacing: 2,
                    fontWeight: FontWeight.w700,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
            Column(
              children: [
                if (!compact) ...[
                  Text(context.tr('mobile.certificates.certifiesThat'),
                      style: const TextStyle(color: Colors.white70, fontSize: 12),),
                  const SizedBox(height: AppSpacing.xs),
                ],
                Text(
                  recipientName,
                  style: AppTypography.serif(TextStyle(
                    color: Colors.white,
                    fontSize: compact ? 18 : 26,
                    fontWeight: FontWeight.w700,
                  ),),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                SizedBox(height: compact ? 2 : AppSpacing.sm),
                if (!compact)
                  Text(context.tr('mobile.certificates.hasCompleted'),
                      style: const TextStyle(color: Colors.white70, fontSize: 12),),
                SizedBox(height: compact ? 2 : AppSpacing.xs),
                Text(
                  title,
                  style: AppTypography.serif(TextStyle(
                    color: colors.goldLight,
                    fontSize: compact ? 13 : 18,
                    fontWeight: FontWeight.w600,
                  ),),
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(Formatters.date(certificate.issuedAt),
                    style: const TextStyle(color: Colors.white70, fontSize: 11),),
                if (certificate.certificateNumber != null)
                  Text(context.tr('mobile.certificates.noPrefix', {'number': certificate.certificateNumber}),
                      style: const TextStyle(color: Colors.white70, fontSize: 11),),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';

import '../../../../shared/widgets/animated_press.dart';

/// Compact metric tile (value + label + icon + delta) for dashboard stats rows.
class StatTile extends StatelessWidget {
  const StatTile({
    super.key,
    required this.icon,
    required this.value,
    required this.label,
    this.delta,
    this.accent = false,
  });

  final IconData icon;
  final String value;
  final String label;
  final String? delta;
  final bool accent;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;

    return AnimatedPress(
      onTap: () {},
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          color: accent ? colors.forestDeep : colors.surfaceElevated,
          borderRadius: AppRadii.rXl,
          boxShadow: AppShadows.card(colors.forestDeep),
          border: Border.all(
            color: accent 
                ? colors.forestDeep 
                : Theme.of(context).brightness == Brightness.light
                    ? colors.border
                    : colors.border,
            width: 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.all(AppSpacing.sm),
                  decoration: BoxDecoration(
                    color: accent
                        ? colors.goldPrimary.withValues(alpha: 0.2)
                        : colors.forestMid.withValues(alpha: 0.08),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    icon,
                    size: 18,
                    color: accent ? colors.goldLight : colors.forestMid,
                  ),
                ),
                if (delta != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: colors.success.withValues(alpha: 0.12),
                      borderRadius: AppRadii.rPill,
                    ),
                    child: Text(
                      delta!,
                      style: text.labelSmall?.copyWith(
                        color: colors.success,
                        fontWeight: FontWeight.w700,
                        fontSize: 10,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            Row(
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              children: [
                Text(
                  value,
                  style: text.headlineSmall?.copyWith(
                    height: 1.1,
                    color: accent ? Colors.white : colors.textPrimary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.xxs),
            Text(
              label,
              style: text.labelSmall?.copyWith(
                color: accent ? colors.goldLight : colors.textSecondary,
                fontWeight: FontWeight.w500,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}

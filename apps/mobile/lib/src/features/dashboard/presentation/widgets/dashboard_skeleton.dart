import 'package:flutter/material.dart';

import '../../../../core/theme/app_dimens.dart';
import '../../../../shared/widgets/app_shimmer.dart';

/// Content-shaped skeleton shown during the initial dashboard load.
class DashboardSkeleton extends StatelessWidget {
  const DashboardSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        const Row(
          children: [
            AppShimmer(width: 52, height: 52, borderRadius: AppRadii.rPill),
            SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  AppShimmer(width: 100, height: 12),
                  SizedBox(height: AppSpacing.sm),
                  AppShimmer(width: 180, height: 18),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.xl),
        const Row(
          children: [
            Expanded(child: AppShimmer(height: 96, borderRadius: AppRadii.rLg)),
            SizedBox(width: AppSpacing.md),
            Expanded(child: AppShimmer(height: 96, borderRadius: AppRadii.rLg)),
            SizedBox(width: AppSpacing.md),
            Expanded(child: AppShimmer(height: 96, borderRadius: AppRadii.rLg)),
          ],
        ),
        const SizedBox(height: AppSpacing.xl),
        const AppShimmer(height: 180, borderRadius: AppRadii.rXl),
        const SizedBox(height: AppSpacing.xl),
        const AppShimmer(width: 140, height: 18),
        const SizedBox(height: AppSpacing.md),
        for (var i = 0; i < 3; i++) ...[
          const AppShimmer(height: 92, borderRadius: AppRadii.rLg),
          const SizedBox(height: AppSpacing.md),
        ],
      ],
    );
  }
}

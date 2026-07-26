import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';
import '../../../shared/widgets/app_shimmer.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/error_banner.dart';
import '../application/programs_controller.dart';
import 'widgets/program_card.dart';

/// Public list of academic programs. No authentication required — reuses the
/// public `GET /programs` endpoint via [publicProgramsProvider]. Tapping a
/// program opens its public details page.
class ProgramsBrowseScreen extends ConsumerWidget {
  const ProgramsBrowseScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = context.colors;
    final async = ref.watch(publicProgramsProvider);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: colors.forestDeep,
        foregroundColor: Colors.white,
        systemOverlayStyle: SystemUiOverlayStyle.light,
        flexibleSpace: DecoratedBox(
          decoration: BoxDecoration(gradient: colors.forestGradient),
        ),
        title: Text(
          'Programs',
          style: Theme.of(context)
              .textTheme
              .titleLarge
              ?.copyWith(color: Colors.white),
        ),
      ),
      body: RefreshIndicator(
        color: colors.goldPrimary,
        onRefresh: () => ref.refresh(publicProgramsProvider.future),
        child: async.when(
          loading: () => ListView(
            padding: const EdgeInsets.all(AppSpacing.lg),
            children: List.generate(
              4,
              (_) => const Padding(
                padding: EdgeInsets.only(bottom: AppSpacing.lg),
                child: AppShimmer(height: 180, borderRadius: AppRadii.rLg),
              ),
            ),
          ),
          error: (_, __) => ListView(
            children: [
              SizedBox(height: MediaQuery.sizeOf(context).height * 0.1),
              Padding(
                padding: const EdgeInsets.all(AppSpacing.xl),
                child: ErrorBanner(
                  message: "Couldn't load programs. Pull to retry.",
                  onRetry: () => ref.invalidate(publicProgramsProvider),
                ),
              ),
            ],
          ),
          data: (programs) {
            if (programs.isEmpty) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: [
                  SizedBox(height: MediaQuery.sizeOf(context).height * 0.12),
                  const EmptyState(
                    icon: Icons.school_outlined,
                    title: 'No programs yet',
                    message: 'Please check back soon for new programs.',
                  ),
                ],
              );
            }
            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                AppSpacing.lg,
                AppSpacing.lg,
                AppSpacing.xxl,
              ),
              children: [
                for (final p in programs)
                  GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTap: () => context.push(AppRoutes.programDetailPath(p.id)),
                    child: ProgramCard(program: p),
                  ),
              ],
            );
          },
        ),
      ),
    );
  }
}

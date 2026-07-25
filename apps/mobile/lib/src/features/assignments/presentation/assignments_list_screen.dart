import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/localization/localized_text.dart';
import '../../../core/router/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/error_banner.dart';
import '../assignment_args.dart';
import '../data/assignment_dto.dart';
import '../data/assignments_repository.dart';

class AssignmentsListScreen extends ConsumerWidget {
  const AssignmentsListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = context.colors;
    final async = ref.watch(myAssignmentsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Assignments')),
      body: RefreshIndicator(
        color: colors.goldPrimary,
        onRefresh: () async => ref.invalidate(myAssignmentsProvider),
        child: async.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (_, __) => ListView(
            children: [
              const SizedBox(height: 80),
              Padding(
                padding: const EdgeInsets.all(AppSpacing.xl),
                child: ErrorBanner(
                  message: "We couldn't load your assignments.",
                  onRetry: () => ref.invalidate(myAssignmentsProvider),
                ),
              ),
            ],
          ),
          data: (items) {
            if (items.isEmpty) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: const [
                  SizedBox(height: 120),
                  EmptyState(
                    icon: Icons.assignment_outlined,
                    title: 'No assignments',
                    message: 'Assignments from your courses will appear here.',
                  ),
                ],
              );
            }
            return ListView.separated(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(AppSpacing.lg),
              itemCount: items.length,
              separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.md),
              itemBuilder: (context, i) => _AssignmentTile(item: items[i]),
            );
          },
        ),
      ),
    );
  }
}

class _AssignmentTile extends StatelessWidget {
  const _AssignmentTile({required this.item});
  final AssignmentDto item;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;

    final (label, color) = _status(context);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: AppRadii.rLg,
        onTap: () => context.push(
          AppRoutes.assignmentPath(item.id),
          extra: AssignmentArgs(
            title: item.title,
            courseId: item.courseId,
            lessonId: item.lessonId,
          ),
        ),
        child: Ink(
          decoration: BoxDecoration(
            color: colors.surface,
            borderRadius: AppRadii.rLg,
            border: Border.all(color: colors.border),
          ),
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color: colors.surfaceMuted,
                  borderRadius: AppRadii.rSm,
                ),
                child: Icon(Icons.assignment_outlined, color: colors.forestLight),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(item.title.resolveFor(context),
                        style: text.titleSmall,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,),
                    const SizedBox(height: 2),
                    Text(item.courseName.resolveFor(context),
                        style: text.bodySmall?.copyWith(color: colors.textMuted),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,),
                    const SizedBox(height: AppSpacing.sm),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.sm, vertical: 3,),
                      decoration: BoxDecoration(
                        color: color.withValues(alpha: 0.12),
                        borderRadius: AppRadii.rPill,
                      ),
                      child: Text(label,
                          style: text.labelSmall?.copyWith(
                              color: color, fontWeight: FontWeight.w600,),),
                    ),
                  ],
                ),
              ),
              Icon(Icons.chevron_right_rounded, color: colors.textMuted),
            ],
          ),
        ),
      ),
    );
  }

  (String, Color) _status(BuildContext context) {
    final colors = context.colors;
    final s = item.submission;
    if (s == null) return ('Not submitted', colors.warning);
    if (s.isGraded) {
      return ('Graded · ${s.grade?.round() ?? 0}/${item.totalPoints}', colors.success);
    }
    return ('Submitted', colors.forestLight);
  }
}

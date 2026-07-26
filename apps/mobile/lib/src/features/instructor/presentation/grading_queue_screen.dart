import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/i18n/i18n_extension.dart';
import '../../../core/localization/localized_text.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/app_shimmer.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/error_banner.dart';
import '../data/grading_dto.dart';
import '../data/grading_repository.dart';
import 'widgets/grade_sheet.dart';

/// Instructor grading queue: submissions across all owned courses awaiting a
/// grade. Tapping a submission opens the grader; a successful grade removes it
/// from the queue.
class GradingQueueScreen extends ConsumerWidget {
  const GradingQueueScreen({super.key});

  Future<void> _grade(
    BuildContext context,
    WidgetRef ref,
    SubmissionDto submission,
  ) async {
    final graded = await GradeSheet.show(context, submission);
    if (graded == true) ref.invalidate(pendingGradingProvider);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = context.colors;
    final async = ref.watch(pendingGradingProvider);

    return Scaffold(
      appBar: AppBar(
        foregroundColor: Colors.white,
        systemOverlayStyle: SystemUiOverlayStyle.light,
        flexibleSpace: DecoratedBox(
          decoration: BoxDecoration(gradient: colors.forestGradient),
        ),
        title: Text(
          context.tr('mobile.instructor.gradingTitle'),
          style: Theme.of(context)
              .textTheme
              .titleLarge
              ?.copyWith(color: Colors.white),
        ),
      ),
      body: RefreshIndicator(
        color: colors.goldPrimary,
        onRefresh: () => ref.refresh(pendingGradingProvider.future),
        child: async.when(
          skipLoadingOnRefresh: true,
          loading: () => ListView.separated(
            padding: const EdgeInsets.all(AppSpacing.lg),
            itemCount: 6,
            separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.md),
            itemBuilder: (_, __) =>
                const AppShimmer(height: 88, borderRadius: AppRadii.rLg),
          ),
          error: (_, __) => ListView(
            children: [
              SizedBox(height: MediaQuery.sizeOf(context).height * 0.1),
              Padding(
                padding: const EdgeInsets.all(AppSpacing.xl),
                child: ErrorBanner(
                  message: context.tr('mobile.instructor.submissionsLoadError'),
                  onRetry: () => ref.invalidate(pendingGradingProvider),
                ),
              ),
            ],
          ),
          data: (subs) {
            if (subs.isEmpty) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: [
                  SizedBox(height: MediaQuery.sizeOf(context).height * 0.12),
                  EmptyState(
                    icon: Icons.task_alt_rounded,
                    title: context.tr('mobile.instructor.gradingCaughtUpTitle'),
                    message: context.tr('mobile.instructor.gradingCaughtUpDesc'),
                  ),
                ],
              );
            }
            return ListView.separated(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(AppSpacing.lg),
              itemCount: subs.length,
              separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.md),
              itemBuilder: (context, i) => _SubmissionRow(
                submission: subs[i],
                onTap: () => _grade(context, ref, subs[i]),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _SubmissionRow extends StatelessWidget {
  const _SubmissionRow({required this.submission, required this.onTap});
  final SubmissionDto submission;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final s = submission;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: AppRadii.rLg,
        child: Ink(
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: colors.surface,
            borderRadius: AppRadii.rLg,
            border: Border.all(color: colors.border),
          ),
          child: Row(
            children: [
              CircleAvatar(
                radius: 22,
                backgroundColor: colors.forestMid,
                backgroundImage: (s.studentAvatar?.startsWith('http') ?? false)
                    ? NetworkImage(s.studentAvatar!)
                    : null,
                child: (s.studentAvatar?.startsWith('http') ?? false)
                    ? null
                    : Text(
                        s.studentName.isNotEmpty
                            ? s.studentName.characters.first.toUpperCase()
                            : '?',
                        style: const TextStyle(color: Colors.white),
                      ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(s.studentName,
                        style: text.titleSmall,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,),
                    const SizedBox(height: 2),
                    Text(s.assignmentTitle.resolveFor(context),
                        style: text.bodySmall
                            ?.copyWith(color: colors.textSecondary),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            s.courseTitle.resolveFor(context),
                            style: text.labelSmall
                                ?.copyWith(color: colors.textMuted),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (s.submittedAt != null)
                          Text(Formatters.timeAgo(s.submittedAt),
                              style: text.labelSmall
                                  ?.copyWith(color: colors.textMuted),),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              if (s.hasAttachment)
                Icon(Icons.attach_file_rounded,
                    size: 16, color: colors.textMuted,),
              Icon(Icons.chevron_right_rounded, color: colors.textMuted),
            ],
          ),
        ),
      ),
    );
  }
}

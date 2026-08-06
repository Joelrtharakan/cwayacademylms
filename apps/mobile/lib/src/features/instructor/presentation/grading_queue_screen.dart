import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/i18n/i18n_extension.dart';
import '../../../core/localization/localized_text.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/app_shimmer.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/error_banner.dart';
import '../../../shared/widgets/primary_button.dart';
import '../data/grading_dto.dart';
import '../data/grading_repository.dart';
import 'widgets/grade_sheet.dart';

String _trOr(BuildContext context, String key, String fallback) {
  final v = context.tr(key);
  return v == key ? fallback : v;
}

/// Instructor grading queue: assignment submissions AND forum discussions across
/// all owned courses awaiting a grade, split into two tabs.
class GradingQueueScreen extends ConsumerWidget {
  const GradingQueueScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = context.colors;

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: colors.background,
        appBar: AppBar(
          backgroundColor: colors.forestDeep,
          foregroundColor: Colors.white,
          iconTheme: const IconThemeData(color: Colors.white),
          systemOverlayStyle: SystemUiOverlayStyle.light,
          flexibleSpace: Container(
            decoration: BoxDecoration(gradient: colors.forestGradient),
          ),
          title: Text(
            context.tr('mobile.instructor.gradingTitle'),
            style: Theme.of(context)
                .textTheme
                .titleLarge
                ?.copyWith(color: Colors.white),
          ),
          bottom: TabBar(
            indicatorColor: colors.goldLight,
            labelColor: Colors.white,
            unselectedLabelColor: Colors.white70,
            tabs: [
              Tab(text: _trOr(context, 'mobile.instructor.tabAssignments',
                  'Assignments',),),
              Tab(text: _trOr(context, 'mobile.instructor.tabDiscussions',
                  'Discussions',),),
            ],
          ),
        ),
        body: const TabBarView(
          children: [_AssignmentsTab(), _DiscussionsTab()],
        ),
      ),
    );
  }
}

class _AssignmentsTab extends ConsumerWidget {
  const _AssignmentsTab();

  Future<void> _grade(
      BuildContext context, WidgetRef ref, SubmissionDto submission,) async {
    final graded = await GradeSheet.show(context, submission);
    if (graded == true) ref.invalidate(pendingGradingProvider);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(pendingGradingProvider);
    return RefreshIndicator(
      color: context.colors.goldPrimary,
      onRefresh: () => ref.refresh(pendingGradingProvider.future),
      child: async.when(
        skipLoadingOnRefresh: true,
        loading: () => const _LoadingList(),
        error: (_, __) => _ErrorList(
          message: context.tr('mobile.instructor.submissionsLoadError'),
          onRetry: () => ref.invalidate(pendingGradingProvider),
        ),
        data: (subs) {
          if (subs.isEmpty) return const _CaughtUp();
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
    );
  }
}

class _DiscussionsTab extends ConsumerWidget {
  const _DiscussionsTab();

  Future<void> _grade(
      BuildContext context, WidgetRef ref, InstructorDiscussionDto d,) async {
    final graded = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      builder: (_) => _DiscussionGradeSheet(discussion: d),
    );
    if (graded == true) ref.invalidate(pendingDiscussionsProvider);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(pendingDiscussionsProvider);
    return RefreshIndicator(
      color: context.colors.goldPrimary,
      onRefresh: () => ref.refresh(pendingDiscussionsProvider.future),
      child: async.when(
        skipLoadingOnRefresh: true,
        loading: () => const _LoadingList(),
        error: (_, __) => _ErrorList(
          message: context.tr('mobile.instructor.submissionsLoadError'),
          onRetry: () => ref.invalidate(pendingDiscussionsProvider),
        ),
        data: (items) {
          if (items.isEmpty) return const _CaughtUp();
          return ListView.separated(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(AppSpacing.lg),
            itemCount: items.length,
            separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.md),
            itemBuilder: (context, i) => _DiscussionRow(
              discussion: items[i],
              onTap: () => _grade(context, ref, items[i]),
            ),
          );
        },
      ),
    );
  }
}

class _LoadingList extends StatelessWidget {
  const _LoadingList();
  @override
  Widget build(BuildContext context) => ListView.separated(
        padding: const EdgeInsets.all(AppSpacing.lg),
        itemCount: 6,
        separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.md),
        itemBuilder: (_, __) =>
            const AppShimmer(height: 88, borderRadius: AppRadii.rLg),
      );
}

class _ErrorList extends StatelessWidget {
  const _ErrorList({required this.message, required this.onRetry});
  final String message;
  final VoidCallback onRetry;
  @override
  Widget build(BuildContext context) => ListView(
        children: [
          SizedBox(height: MediaQuery.sizeOf(context).height * 0.1),
          Padding(
            padding: const EdgeInsets.all(AppSpacing.xl),
            child: ErrorBanner(message: message, onRetry: onRetry),
          ),
        ],
      );
}

class _CaughtUp extends StatelessWidget {
  const _CaughtUp();
  @override
  Widget build(BuildContext context) => ListView(
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

class _SubmissionRow extends StatelessWidget {
  const _SubmissionRow({required this.submission, required this.onTap});
  final SubmissionDto submission;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final s = submission;

    return _Card(
      onTap: onTap,
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
                : Text(_initial(s.studentName),
                    style: const TextStyle(color: Colors.white),),
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
                    style:
                        text.bodySmall?.copyWith(color: colors.textSecondary),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,),
                const SizedBox(height: 2),
                Row(
                  children: [
                    Expanded(
                      child: Text(s.courseTitle.resolveFor(context),
                          style:
                              text.labelSmall?.copyWith(color: colors.textMuted),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,),
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
            Icon(Icons.attach_file_rounded, size: 16, color: colors.textMuted),
          Icon(Icons.chevron_right_rounded, color: colors.textMuted),
        ],
      ),
    );
  }
}

class _DiscussionRow extends StatelessWidget {
  const _DiscussionRow({required this.discussion, required this.onTap});
  final InstructorDiscussionDto discussion;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final d = discussion;

    return _Card(
      onTap: onTap,
      child: Row(
        children: [
          CircleAvatar(
            radius: 22,
            backgroundColor: colors.forestMid,
            child: Icon(Icons.forum_rounded, size: 20, color: colors.goldLight),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(d.authorName,
                    style: text.titleSmall,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,),
                const SizedBox(height: 2),
                Text(d.lessonTitle.resolveFor(context),
                    style:
                        text.bodySmall?.copyWith(color: colors.textSecondary),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,),
                const SizedBox(height: 2),
                Row(
                  children: [
                    Expanded(
                      child: Text(d.courseTitle.resolveFor(context),
                          style:
                              text.labelSmall?.copyWith(color: colors.textMuted),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,),
                    ),
                    if (d.createdAt != null)
                      Text(Formatters.timeAgo(d.createdAt),
                          style: text.labelSmall
                              ?.copyWith(color: colors.textMuted),),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
          Icon(Icons.chevron_right_rounded, color: colors.textMuted),
        ],
      ),
    );
  }
}

class _Card extends StatelessWidget {
  const _Card({required this.child, required this.onTap});
  final Widget child;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
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
          child: child,
        ),
      ),
    );
  }
}

String _initial(String name) =>
    name.trim().isNotEmpty ? name.trim().substring(0, 1).toUpperCase() : '?';

/// Grades a forum discussion: shows the student's response, a score (out of the
/// lesson's forum marks) and optional feedback.
class _DiscussionGradeSheet extends ConsumerStatefulWidget {
  const _DiscussionGradeSheet({required this.discussion});
  final InstructorDiscussionDto discussion;

  @override
  ConsumerState<_DiscussionGradeSheet> createState() =>
      _DiscussionGradeSheetState();
}

class _DiscussionGradeSheetState extends ConsumerState<_DiscussionGradeSheet> {
  late final TextEditingController _score =
      TextEditingController(text: widget.discussion.score?.toStringAsFixed(0) ?? '');
  late final TextEditingController _feedback =
      TextEditingController(text: widget.discussion.feedback ?? '');
  bool _saving = false;
  String? _error;

  @override
  void dispose() {
    _score.dispose();
    _feedback.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final max = widget.discussion.maxScore;
    final value = double.tryParse(_score.text.trim());
    if (value == null || value < 0 || value > max) {
      setState(() => _error = context.tr(
          'mobile.grade.scoreRange', {'max': max},),);
      return;
    }
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      await ref.read(gradingRepositoryProvider).gradeDiscussion(
            discussionId: widget.discussion.id,
            score: value,
            feedback: _feedback.text.trim(),
          );
      if (mounted) Navigator.of(context).pop(true);
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final d = widget.discussion;

    return Padding(
      padding: EdgeInsets.only(
        left: AppSpacing.lg,
        right: AppSpacing.lg,
        top: AppSpacing.lg,
        bottom: MediaQuery.viewInsetsOf(context).bottom + AppSpacing.lg,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundColor: colors.forestMid,
                child: Icon(Icons.forum_rounded, size: 18, color: colors.goldLight),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(d.authorName, style: text.titleMedium),
                    Text(d.lessonTitle.resolveFor(context),
                        style: text.bodySmall?.copyWith(color: colors.textMuted),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: colors.surfaceMuted,
              borderRadius: AppRadii.rMd,
            ),
            child: Text(d.content, style: text.bodyMedium?.copyWith(height: 1.5)),
          ),
          const SizedBox(height: AppSpacing.lg),
          if (_error != null) ...[
            Text(_error!, style: text.bodySmall?.copyWith(color: colors.danger)),
            const SizedBox(height: AppSpacing.sm),
          ],
          Text(context.tr('mobile.grade.scoreLabel', {'max': d.maxScore}),
              style: text.titleSmall,),
          const SizedBox(height: AppSpacing.sm),
          TextField(
            controller: _score,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: InputDecoration(
              hintText: context.tr('mobile.grade.scoreHint', {'max': d.maxScore}),
              prefixIcon: const Icon(Icons.star_rounded),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Text(context.tr('mobile.grade.feedbackLabel'), style: text.titleSmall),
          const SizedBox(height: AppSpacing.sm),
          TextField(
            controller: _feedback,
            minLines: 2,
            maxLines: 5,
            decoration: InputDecoration(
              hintText: context.tr('mobile.grade.feedbackHint'),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          PrimaryButton(
            label: d.isGraded
                ? context.tr('mobile.grade.update')
                : context.tr('mobile.grade.submit'),
            icon: Icons.check_rounded,
            variant: ButtonVariant.gold,
            isLoading: _saving,
            onPressed: _saving ? null : _submit,
          ),
        ],
      ),
    );
  }
}

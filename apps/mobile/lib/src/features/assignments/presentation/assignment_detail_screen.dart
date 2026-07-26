import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/i18n/app_translations.dart';
import '../../../core/i18n/i18n_extension.dart';
import '../../../core/localization/localized_text.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/error_banner.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../dashboard/application/dashboard_controller.dart';
import '../../learn/data/learn_repository.dart';
import '../assignment_args.dart';
import '../data/assignment_dto.dart';
import '../data/assignments_repository.dart';

class AssignmentDetailScreen extends ConsumerStatefulWidget {
  const AssignmentDetailScreen({super.key, required this.assignmentId, this.args});

  final String assignmentId;
  final AssignmentArgs? args;

  @override
  ConsumerState<AssignmentDetailScreen> createState() =>
      _AssignmentDetailScreenState();
}

class _AssignmentDetailScreenState
    extends ConsumerState<AssignmentDetailScreen> {
  final _content = TextEditingController();
  String? _filePath;
  String? _fileName;
  bool _busy = false;
  bool _showForm = false;
  String? _error;

  AssignmentsRepository get _repo => ref.read(assignmentsRepositoryProvider);

  @override
  void dispose() {
    _content.dispose();
    super.dispose();
  }

  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles(withReadStream: false);
    if (result == null || result.files.isEmpty) return;
    final file = result.files.first;
    if (file.path != null) {
      setState(() {
        _filePath = file.path;
        _fileName = file.name;
      });
    }
  }

  Future<void> _submit(DateTime? dueDate) async {
    if (Formatters.isOverdue(dueDate)) {
      _snack(context.tr('mobile.assignments.dueDatePassed'));
      return;
    }
    if (_content.text.trim().isEmpty && _filePath == null) {
      setState(() => _error = context.tr('mobile.assignments.addResponse'));
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await _repo.submit(
        assignmentId: widget.assignmentId,
        content: _content.text,
        filePath: _filePath,
        fileName: _fileName,
      );
      await _syncCompletion();
      _refresh();
      setState(() {
        _showForm = false;
        _filePath = null;
        _fileName = null;
      });
      _snack(AppTranslations.tg('mobile.assignments.submittedToast'));
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _unsubmit() async {
    setState(() => _busy = true);
    try {
      await _repo.unsubmit(widget.assignmentId);
      _refresh();
      _snack(AppTranslations.tg('mobile.assignments.submissionRemoved'));
    } on ApiException catch (e) {
      _snack(e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _syncCompletion() async {
    final args = widget.args;
    if (args == null || !args.canCompleteLesson) return;
    try {
      await ref.read(learnRepositoryProvider).completeLesson(
            enrollmentId: args.enrollmentId!,
            lessonId: args.lessonId!,
          );
      ref.invalidate(learnEnrollmentProvider(args.courseId!));
    } on Object {
      // Non-fatal.
    }
  }

  void _refresh() {
    ref.invalidate(mySubmissionProvider(widget.assignmentId));
    ref.invalidate(myAssignmentsProvider);
    ref.invalidate(dashboardControllerProvider);
  }

  Future<void> _open(String url) async {
    final uri = Uri.tryParse(url);
    if (uri != null) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  void _snack(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(msg)));
  }

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(mySubmissionProvider(widget.assignmentId));

    return Scaffold(
      appBar: AppBar(title: Text(context.tr('mobile.assignments.detailTitle'))),
      body: async.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => Padding(
          padding: const EdgeInsets.all(AppSpacing.xl),
          child: Center(
            child: ErrorBanner(
              message: context.tr('mobile.assignments.detailLoadError'),
              onRetry: () =>
                  ref.invalidate(mySubmissionProvider(widget.assignmentId)),
            ),
          ),
        ),
        data: (submission) => _content0(submission),
      ),
    );
  }

  Widget _content0(SubmissionDto? submission) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final args = widget.args;
    final info = submission?.assignment;

    final title = (info?.title ?? args?.title ?? LocalizedText.empty).resolveFor(context);
    final description =
        (info?.description ?? args?.description ?? LocalizedText.empty).resolveFor(context);
    final dueDate = info?.dueDate ?? args?.dueDate;
    final maxScore = info?.maxScore ?? args?.maxScore ?? 100;
    final attachmentUrl = info?.attachmentUrl ?? args?.attachmentUrl;
    final overdue = Formatters.isOverdue(dueDate);

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        Text(title.isEmpty ? context.tr('mobile.assignments.detailTitle') : title, style: text.headlineSmall),
        const SizedBox(height: AppSpacing.sm),
        Row(
          children: [
            Icon(Icons.event_rounded,
                size: 16, color: overdue ? colors.danger : colors.textMuted,),
            const SizedBox(width: 4),
            Text(
              Formatters.due(dueDate),
              style: text.bodySmall?.copyWith(
                  color: overdue ? colors.danger : colors.textSecondary,),
            ),
            const Spacer(),
            Text(context.tr('mobile.assignments.points', {'count': maxScore}),
                style: text.labelMedium?.copyWith(color: colors.goldDark),),
          ],
        ),
        if (attachmentUrl != null && attachmentUrl.isNotEmpty) ...[
          const SizedBox(height: AppSpacing.md),
          OutlinedButton.icon(
            onPressed: () => _open(attachmentUrl),
            icon: const Icon(Icons.attach_file_rounded, size: 18),
            label: Text(context.tr('mobile.assignments.openAttachment')),
          ),
        ],
        if (description.isNotEmpty) ...[
          const SizedBox(height: AppSpacing.xl),
          Text(context.tr('mobile.assignments.instructions'), style: text.titleMedium),
          const SizedBox(height: AppSpacing.sm),
          Text(description,
              style: text.bodyMedium?.copyWith(color: colors.textSecondary, height: 1.6),),
        ],
        const SizedBox(height: AppSpacing.xl),
        const Divider(),
        const SizedBox(height: AppSpacing.md),
        if (_error != null) ...[
          ErrorBanner(message: _error!),
          const SizedBox(height: AppSpacing.lg),
        ],
        if (submission != null && !_showForm)
          _submissionView(submission, maxScore)
        else
          _submitForm(dueDate, overdue, canCancel: submission != null),
      ],
    );
  }

  Widget _submissionView(SubmissionDto s, int maxScore) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (s.isGraded)
          Container(
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: colors.success.withValues(alpha: 0.08),
              borderRadius: AppRadii.rLg,
              border: Border.all(color: colors.success.withValues(alpha: 0.4)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(context.tr('student.assignments.status.graded'), style: text.labelMedium?.copyWith(color: colors.success)),
                const SizedBox(height: AppSpacing.xs),
                Text('${s.grade?.round() ?? 0} / $maxScore',
                    style: text.headlineMedium?.copyWith(color: colors.success),),
                if (s.feedback != null && s.feedback!.isNotEmpty) ...[
                  const SizedBox(height: AppSpacing.md),
                  Text(context.tr('mobile.assignments.feedback'), style: text.titleSmall),
                  const SizedBox(height: AppSpacing.xs),
                  Text(s.feedback!, style: text.bodyMedium),
                ],
              ],
            ),
          )
        else
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: colors.surfaceMuted,
              borderRadius: AppRadii.rLg,
            ),
            child: Row(
              children: [
                Icon(Icons.check_circle_rounded, color: colors.success),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(context.tr('mobile.assignments.submitted'), style: text.titleSmall),
                      Text(context.tr('mobile.assignments.awaitingGradingAt', {'date': Formatters.dateTime(s.submittedAt)}),
                          style: text.bodySmall?.copyWith(color: colors.textMuted),),
                    ],
                  ),
                ),
              ],
            ),
          ),
        if (s.content != null && s.content!.isNotEmpty) ...[
          const SizedBox(height: AppSpacing.md),
          Text(context.tr('mobile.assignments.yourResponse'), style: text.titleSmall),
          const SizedBox(height: AppSpacing.xs),
          Text(s.content!, style: text.bodyMedium),
        ],
        if (s.hasFile) ...[
          const SizedBox(height: AppSpacing.md),
          OutlinedButton.icon(
            onPressed: () => _open(s.fileUrl!),
            icon: const Icon(Icons.description_rounded, size: 18),
            label: Text(context.tr('mobile.assignments.viewFile')),
          ),
        ],
        if (!s.isGraded) ...[
          const SizedBox(height: AppSpacing.xl),
          PrimaryButton(
            label: context.tr('mobile.assignments.replace'),
            icon: Icons.edit_rounded,
            variant: ButtonVariant.gold,
            onPressed: () => setState(() => _showForm = true),
          ),
          const SizedBox(height: AppSpacing.sm),
          OutlinedButton.icon(
            onPressed: _busy ? null : _unsubmit,
            icon: const Icon(Icons.undo_rounded, size: 18),
            label: Text(context.tr('mobile.assignments.unsubmit')),
          ),
        ],
      ],
    );
  }

  Widget _submitForm(DateTime? dueDate, bool overdue, {required bool canCancel}) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;

    if (overdue && !canCancel) {
      return Container(
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          color: colors.danger.withValues(alpha: 0.06),
          borderRadius: AppRadii.rLg,
          border: Border.all(color: colors.danger.withValues(alpha: 0.3)),
        ),
        child: Row(
          children: [
            Icon(Icons.lock_clock_rounded, color: colors.danger),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: Text(context.tr('mobile.assignments.closed'),
                  style: text.bodyMedium?.copyWith(color: colors.danger),),
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(context.tr('mobile.assignments.yourSubmission'), style: text.titleMedium),
        const SizedBox(height: AppSpacing.sm),
        TextField(
          controller: _content,
          minLines: 3,
          maxLines: 8,
          decoration: InputDecoration(
            hintText: context.tr('mobile.assignments.responseHint'),
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        OutlinedButton.icon(
          onPressed: _pickFile,
          icon: const Icon(Icons.upload_file_rounded, size: 18),
          label: Text(_fileName ?? context.tr('mobile.assignments.attachFile')),
        ),
        const SizedBox(height: AppSpacing.lg),
        PrimaryButton(
          label: context.tr('mobile.assignments.submitAssignment'),
          icon: Icons.send_rounded,
          variant: ButtonVariant.gold,
          isLoading: _busy,
          onPressed: _busy ? null : () => _submit(dueDate),
        ),
        if (canCancel) ...[
          const SizedBox(height: AppSpacing.sm),
          TextButton(
            onPressed: () => setState(() => _showForm = false),
            child: Text(context.tr('mobile.common.cancel')),
          ),
        ],
      ],
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/i18n/i18n_extension.dart';
import '../../../../core/localization/localized_text.dart';
import '../../../../core/network/api_exception.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../data/grading_dto.dart';
import '../../data/grading_repository.dart';

/// Editor for grading a single submission. Validates the score against the
/// assignment's max (the backend also enforces this) and posts grade + feedback.
class GradeSheet extends ConsumerStatefulWidget {
  const GradeSheet({super.key, required this.submission});

  final SubmissionDto submission;

  static Future<bool?> show(BuildContext context, SubmissionDto submission) {
    return showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      builder: (_) => GradeSheet(submission: submission),
    );
  }

  @override
  ConsumerState<GradeSheet> createState() => _GradeSheetState();
}

class _GradeSheetState extends ConsumerState<GradeSheet> {
  late final TextEditingController _grade =
      TextEditingController(text: widget.submission.grade?.toStringAsFixed(0) ?? '');
  late final TextEditingController _feedback =
      TextEditingController(text: widget.submission.feedback ?? '');
  bool _saving = false;
  String? _error;

  @override
  void dispose() {
    _grade.dispose();
    _feedback.dispose();
    super.dispose();
  }

  Future<void> _openAttachment() async {
    final url = widget.submission.fileUrl;
    if (url == null) return;
    final uri = Uri.tryParse(url);
    if (uri != null) await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  Future<void> _submit() async {
    final max = widget.submission.maxScore;
    final value = double.tryParse(_grade.text.trim());
    if (value == null || value < 0 || value > max) {
      setState(() => _error = context.tr('mobile.grade.scoreRange', {'max': max}));
      return;
    }
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      await ref.read(gradingRepositoryProvider).grade(
            submissionId: widget.submission.id,
            grade: value,
            feedback: _feedback.text.trim(),
          );
      if (mounted) Navigator.of(context).pop(true);
    } on ApiException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final s = widget.submission;
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;

    return Padding(
      padding: EdgeInsets.only(bottom: bottomInset),
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.xl,
            AppSpacing.lg,
            AppSpacing.xl,
            AppSpacing.xl,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
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
                        Text(s.studentName, style: text.titleMedium),
                        Text(
                          s.assignmentTitle.resolveFor(context),
                          style: text.bodySmall?.copyWith(color: colors.textMuted),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),
              if (s.content != null && s.content!.trim().isNotEmpty) ...[
                Text(context.tr('mobile.grade.submission'), style: text.labelLarge),
                const SizedBox(height: AppSpacing.xs),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    color: colors.surfaceMuted,
                    borderRadius: AppRadii.rMd,
                  ),
                  child: Text(s.content!, style: text.bodyMedium),
                ),
                const SizedBox(height: AppSpacing.md),
              ],
              if (s.hasAttachment) ...[
                OutlinedButton.icon(
                  onPressed: _openAttachment,
                  icon: const Icon(Icons.attach_file_rounded),
                  label: Text(context.tr('mobile.assignments.openAttachment')),
                ),
                const SizedBox(height: AppSpacing.md),
              ],
              Text(context.tr('mobile.grade.scoreLabel', {'max': s.maxScore}), style: text.labelLarge),
              const SizedBox(height: AppSpacing.xs),
              TextField(
                controller: _grade,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                inputFormatters: [
                  FilteringTextInputFormatter.allow(RegExp(r'[0-9.]')),
                ],
                decoration: InputDecoration(
                  hintText: context.tr('mobile.grade.scoreHint', {'max': s.maxScore}),
                  prefixIcon: const Icon(Icons.grade_rounded),
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              Text(context.tr('mobile.grade.feedbackLabel'), style: text.labelLarge),
              const SizedBox(height: AppSpacing.xs),
              TextField(
                controller: _feedback,
                minLines: 2,
                maxLines: 5,
                textCapitalization: TextCapitalization.sentences,
                decoration: InputDecoration(
                  hintText: context.tr('mobile.grade.feedbackHint'),
                ),
              ),
              if (_error != null) ...[
                const SizedBox(height: AppSpacing.md),
                Text(_error!,
                    style: text.bodySmall?.copyWith(color: colors.danger),),
              ],
              const SizedBox(height: AppSpacing.lg),
              SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                  onPressed: _saving ? null : _submit,
                  icon: _saving
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white,),
                        )
                      : const Icon(Icons.check_rounded),
                  label: Text(s.isGraded ? context.tr('mobile.grade.update') : context.tr('mobile.grade.submit')),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

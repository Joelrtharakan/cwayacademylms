import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/i18n/i18n_extension.dart';
import '../../../../core/network/api_exception.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../data/note_dto.dart';
import '../../data/notes_repository.dart';

/// A bottom-sheet editor for the student's personal note on a lesson. Loads any
/// existing note, saves via create-or-update (backend allows one per lesson),
/// and can anchor the note to the current video position.
class NotesSheet extends ConsumerStatefulWidget {
  const NotesSheet({
    super.key,
    required this.lessonId,
    required this.lessonTitle,
    this.currentSeconds,
  });

  final String lessonId;
  final String lessonTitle;

  /// Current playback position, offered as a timestamp anchor for new notes.
  final int? currentSeconds;

  static Future<void> show(
    BuildContext context, {
    required String lessonId,
    required String lessonTitle,
    int? currentSeconds,
  }) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (_) => NotesSheet(
        lessonId: lessonId,
        lessonTitle: lessonTitle,
        currentSeconds: currentSeconds,
      ),
    );
  }

  @override
  ConsumerState<NotesSheet> createState() => _NotesSheetState();
}

class _NotesSheetState extends ConsumerState<NotesSheet> {
  final _controller = TextEditingController();
  NoteDto? _note;
  bool _loaded = false;
  bool _saving = false;
  bool _deleting = false;
  String? _error;
  bool _attachTimestamp = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final content = _controller.text.trim();
    if (content.isEmpty) return;
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      final repo = ref.read(notesRepositoryProvider);
      if (_note != null) {
        await repo.update(id: _note!.id, content: content);
      } else {
        await repo.create(
          lessonId: widget.lessonId,
          content: content,
          timestamp: _attachTimestamp ? widget.currentSeconds : null,
        );
      }
      ref.invalidate(lessonNoteProvider(widget.lessonId));
      if (mounted) Navigator.of(context).pop();
    } on ApiException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _delete() async {
    if (_note == null) return;
    setState(() {
      _deleting = true;
      _error = null;
    });
    try {
      await ref.read(notesRepositoryProvider).delete(_note!.id);
      ref.invalidate(lessonNoteProvider(widget.lessonId));
      if (mounted) Navigator.of(context).pop();
    } on ApiException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _deleting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final async = ref.watch(lessonNoteProvider(widget.lessonId));

    // Seed the editor once the existing note (if any) resolves.
    async.whenData((note) {
      if (!_loaded) {
        _loaded = true;
        _note = note;
        _controller.text = note?.content ?? '';
      }
    });

    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;

    return Padding(
      padding: EdgeInsets.only(bottom: bottomInset),
      child: Container(
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
                Icon(Icons.sticky_note_2_rounded, color: colors.goldDark),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Text(context.tr('student.player.myNotes'), style: text.titleLarge),
                ),
                if (_note != null)
                  IconButton(
                    onPressed: _deleting ? null : _delete,
                    icon: _deleting
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : Icon(Icons.delete_outline_rounded, color: colors.danger),
                    tooltip: context.tr('mobile.notes.delete'),
                  ),
              ],
            ),
            Text(
              widget.lessonTitle,
              style: text.bodySmall?.copyWith(color: colors.textMuted),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: AppSpacing.lg),
            if (!_loaded && async.isLoading)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: AppSpacing.xxl),
                child: Center(child: CircularProgressIndicator()),
              )
            else ...[
              TextField(
                controller: _controller,
                autofocus: true,
                minLines: 4,
                maxLines: 8,
                textCapitalization: TextCapitalization.sentences,
                decoration: InputDecoration(
                  hintText: context.tr('student.player.typeNote'),
                  alignLabelWithHint: true,
                ),
              ),
              if (_note == null && widget.currentSeconds != null) ...[
                const SizedBox(height: AppSpacing.sm),
                FilterChip(
                  selected: _attachTimestamp,
                  onSelected: (v) => setState(() => _attachTimestamp = v),
                  avatar: Icon(Icons.schedule_rounded,
                      size: 16,
                      color: _attachTimestamp ? colors.goldDark : colors.textMuted,),
                  label: Text(context.tr('mobile.notes.anchorAt', {'time': _fmt(widget.currentSeconds!)})),
                ),
              ],
              if (_note?.timestamp != null) ...[
                const SizedBox(height: AppSpacing.sm),
                Row(
                  children: [
                    Icon(Icons.schedule_rounded, size: 14, color: colors.textMuted),
                    const SizedBox(width: 4),
                    Text(context.tr('mobile.notes.anchoredAt', {'time': _fmt(_note!.timestamp!)}),
                        style:
                            text.labelSmall?.copyWith(color: colors.textMuted),),
                  ],
                ),
              ],
              if (_error != null) ...[
                const SizedBox(height: AppSpacing.md),
                Text(_error!, style: text.bodySmall?.copyWith(color: colors.danger)),
              ],
              const SizedBox(height: AppSpacing.lg),
              SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                  onPressed: _saving ? null : _save,
                  icon: _saving
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white,),
                        )
                      : const Icon(Icons.check_rounded),
                  label: Text(_note != null ? context.tr('mobile.notes.update') : context.tr('student.player.saveNote')),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  static String _fmt(int seconds) {
    final m = (seconds ~/ 60).toString().padLeft(2, '0');
    final s = (seconds % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }
}

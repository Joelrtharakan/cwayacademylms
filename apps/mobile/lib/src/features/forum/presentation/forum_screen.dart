import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/i18n/i18n_extension.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/router/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/error_banner.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../dashboard/application/dashboard_controller.dart';
import '../../learn/data/learn_repository.dart';
import '../data/forum_dto.dart';
import '../data/forum_repository.dart';

/// The per-lesson discussion forum: read threads, start a discussion, reply.
class ForumScreen extends ConsumerStatefulWidget {
  const ForumScreen({
    super.key,
    required this.lessonId,
    this.lessonTitle,
    this.prompt,
    this.courseId,
    this.enrollmentId,
  });

  final String lessonId;
  final String? lessonTitle;

  /// The instructor's discussion question/prompt shown pinned at the top.
  final String? prompt;

  /// Present when opened from the lesson player: enables marking the lesson
  /// complete on post and continuing to the next lesson.
  final String? courseId;
  final String? enrollmentId;

  @override
  ConsumerState<ForumScreen> createState() => _ForumScreenState();
}

class _ForumScreenState extends ConsumerState<ForumScreen> {
  bool _posting = false;

  String _tr(String key, String fallback) {
    final v = context.tr(key);
    return v == key ? fallback : v;
  }

  void _snack(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(msg)));
  }

  void _refresh() => ref.invalidate(lessonForumProvider(widget.lessonId));

  Future<void> _startDiscussion() async {
    final content = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      backgroundColor: context.colors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadii.xl)),
      ),
      builder: (ctx) => _ComposeSheet(
        title: _tr('mobile.forum.startTitle', 'Start a discussion'),
        hint: _tr('mobile.forum.postHint', 'Share your thoughts…'),
        postLabel: _tr('mobile.forum.post', 'Post'),
      ),
    );
    if (content == null || content.trim().isEmpty) return;
    setState(() => _posting = true);
    try {
      await ref.read(forumRepositoryProvider).createPost(
            lessonId: widget.lessonId,
            content: content,
          );
      _refresh();
      // Posting a response completes the forum lesson; offer to continue.
      if (widget.courseId != null && widget.enrollmentId != null) {
        await _completeAndOfferNext();
      } else {
        _snack(_tr('mobile.forum.posted', 'Your response was posted.'));
      }
    } on ApiException catch (e) {
      _snack(e.message);
    } finally {
      if (mounted) setState(() => _posting = false);
    }
  }

  /// Marks the forum lesson complete, then offers to continue to the next one.
  Future<void> _completeAndOfferNext() async {
    // Resolve the next lesson id up front (before any navigation/teardown).
    String? nextLessonId;
    try {
      await ref.read(learnRepositoryProvider).completeLesson(
            enrollmentId: widget.enrollmentId!,
            lessonId: widget.lessonId,
          );
      ref.invalidate(dashboardControllerProvider);
      final data = await ref.read(learnEnrollmentProvider(widget.courseId!).future);
      final lessons = data.orderedLessons;
      final idx = lessons.indexWhere((l) => l.id == widget.lessonId);
      if (idx >= 0 && idx < lessons.length - 1) {
        nextLessonId = lessons[idx + 1].id;
      }
    } on Object {
      // Non-fatal — the post still succeeded.
    }
    if (!mounted) return;

    final hasNext = nextLessonId != null;
    final go = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(_tr('mobile.forum.postedTitle', 'Response posted')),
        content: Text(_tr('mobile.forum.completedBody',
            'Your response was posted and this lesson is now complete.',),),
        actions: [
          if (hasNext)
            TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: Text(_tr('mobile.forum.stayHere', 'Stay here')),
            ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, hasNext),
            child: Text(hasNext
                ? _tr('mobile.forum.nextLesson', 'Next lesson')
                : _tr('mobile.forum.done', 'Done'),),
          ),
        ],
      ),
    );

    if (go != true || nextLessonId == null || !mounted) return;
    final courseId = widget.courseId!;
    final target = nextLessonId;
    // Defer navigation to the next frame so the current route/inherited widgets
    // finish settling before this screen is replaced (avoids teardown races).
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.pushReplacement(
        AppRoutes.courseLearnPath(courseId, lessonId: target),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final async = ref.watch(lessonForumProvider(widget.lessonId));

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        title: Text(_tr('mobile.forum.title', 'Discussion')),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _posting ? null : _startDiscussion,
        backgroundColor: colors.goldPrimary,
        foregroundColor: Colors.white,
        icon: _posting
            ? const SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(
                    strokeWidth: 2, color: Colors.white,),
              )
            : const Icon(Icons.forum_rounded),
        label: Text(_tr('mobile.forum.startTitle', 'Start a discussion')),
      ),
      body: Column(
        children: [
          if ((widget.prompt ?? '').trim().isNotEmpty)
            _QuestionCard(
              title: widget.lessonTitle,
              prompt: widget.prompt!.trim(),
              label: _tr('mobile.forum.prompt', 'Discussion prompt'),
            ),
          Expanded(
            child: RefreshIndicator(
              color: colors.goldPrimary,
              onRefresh: () async => _refresh(),
              child: async.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (_, __) => ListView(
            children: [
              const SizedBox(height: 80),
              Padding(
                padding: const EdgeInsets.all(AppSpacing.xl),
                child: ErrorBanner(
                  message: _tr('mobile.forum.loadError',
                      "We couldn't load this discussion.",),
                  onRetry: _refresh,
                ),
              ),
            ],
          ),
          data: (discussions) {
            if (discussions.isEmpty) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: [
                  const SizedBox(height: 100),
                  EmptyState(
                    icon: Icons.forum_outlined,
                    title: _tr('mobile.forum.emptyTitle', 'No responses yet'),
                    message: _tr('mobile.forum.emptyMessage',
                        'Be the first to start the conversation.',),
                  ),
                ],
              );
            }
            return ListView.separated(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(
                  AppSpacing.lg, AppSpacing.lg, AppSpacing.lg, 100,),
              itemCount: discussions.length,
              separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.md),
              itemBuilder: (_, i) => _DiscussionCard(
                discussion: discussions[i],
                onReplied: _refresh,
              ),
            );
          },
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// A pinned card showing the instructor's discussion question/prompt.
class _QuestionCard extends StatelessWidget {
  const _QuestionCard({required this.prompt, required this.label, this.title});

  final String prompt;
  final String label;
  final String? title;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;

    return Container(
      margin: const EdgeInsets.fromLTRB(
          AppSpacing.lg, AppSpacing.lg, AppSpacing.lg, AppSpacing.sm,),
      padding: const EdgeInsets.all(AppSpacing.xl),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [colors.forestMid, colors.forestDeep],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: AppRadii.rXl,
        boxShadow: AppShadows.card(colors.forestDeep),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.forum_rounded, size: 18, color: colors.goldLight),
              const SizedBox(width: AppSpacing.sm),
              Text(
                label.toUpperCase(),
                style: text.labelSmall?.copyWith(
                  color: colors.goldLight,
                  letterSpacing: 1,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            prompt,
            style: text.titleMedium?.copyWith(
              color: Colors.white,
              height: 1.4,
              fontWeight: FontWeight.w600,
            ),
          ),
          if ((title ?? '').trim().isNotEmpty) ...[
            const SizedBox(height: AppSpacing.sm),
            Text(
              title!.trim(),
              style: text.bodySmall?.copyWith(
                color: Colors.white.withValues(alpha: 0.7),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _DiscussionCard extends ConsumerStatefulWidget {
  const _DiscussionCard({required this.discussion, required this.onReplied});

  final ForumDiscussion discussion;
  final VoidCallback onReplied;

  @override
  ConsumerState<_DiscussionCard> createState() => _DiscussionCardState();
}

class _DiscussionCardState extends ConsumerState<_DiscussionCard> {
  final _reply = TextEditingController();
  bool _sending = false;
  bool _showReply = false;

  String _tr(String key, String fallback) {
    final v = context.tr(key);
    return v == key ? fallback : v;
  }

  @override
  void dispose() {
    _reply.dispose();
    super.dispose();
  }

  Future<void> _sendReply() async {
    if (_reply.text.trim().isEmpty) return;
    setState(() => _sending = true);
    try {
      await ref.read(forumRepositoryProvider).createReply(
            discussionId: widget.discussion.id,
            content: _reply.text,
          );
      _reply.clear();
      setState(() => _showReply = false);
      widget.onReplied();
    } on ApiException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
          ..hideCurrentSnackBar()
          ..showSnackBar(SnackBar(content: Text(e.message)));
      }
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final d = widget.discussion;

    return Container(
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: AppRadii.rLg,
        boxShadow: AppShadows.card(colors.forestDeep),
      ),
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _AuthorRow(author: d.author, createdAt: d.createdAt),
          const SizedBox(height: AppSpacing.sm),
          Text(d.content, style: text.bodyMedium?.copyWith(height: 1.5)),
          if (d.replies.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.md),
            Container(
              margin: const EdgeInsets.only(left: AppSpacing.sm),
              padding: const EdgeInsets.only(left: AppSpacing.md),
              decoration: BoxDecoration(
                border: Border(
                  left: BorderSide(color: colors.border, width: 2),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  for (final r in d.replies) ...[
                    _AuthorRow(author: r.author, createdAt: r.createdAt, dense: true),
                    const SizedBox(height: 2),
                    Text(r.content,
                        style: text.bodySmall?.copyWith(
                            color: colors.textSecondary, height: 1.5,),),
                    const SizedBox(height: AppSpacing.sm),
                  ],
                ],
              ),
            ),
          ],
          const SizedBox(height: AppSpacing.sm),
          if (!_showReply)
            Align(
              alignment: Alignment.centerLeft,
              child: TextButton.icon(
                onPressed: () => setState(() => _showReply = true),
                icon: const Icon(Icons.reply_rounded, size: 18),
                label: Text(_tr('mobile.forum.reply', 'Reply')),
              ),
            )
          else
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _reply,
                    autofocus: true,
                    minLines: 1,
                    maxLines: 4,
                    decoration: InputDecoration(
                      hintText: _tr('mobile.forum.replyHint', 'Write a reply…'),
                      isDense: true,
                    ),
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                IconButton(
                  onPressed: _sending ? null : _sendReply,
                  icon: _sending
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),)
                      : Icon(Icons.send_rounded, color: colors.goldDark),
                ),
              ],
            ),
        ],
      ),
    );
  }
}

class _AuthorRow extends StatelessWidget {
  const _AuthorRow({required this.author, this.createdAt, this.dense = false});

  final ForumAuthor? author;
  final DateTime? createdAt;
  final bool dense;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final a = author;
    final isStaff = a != null && (a.role == 'INSTRUCTOR' || a.role == 'ADMIN' || a.role == 'REGISTRAR');
    final size = dense ? 24.0 : 34.0;

    return Row(
      children: [
        CircleAvatar(
          radius: size / 2,
          backgroundColor: colors.goldPrimary.withValues(alpha: 0.15),
          child: Text(
            a?.initials ?? '?',
            style: text.labelSmall?.copyWith(
                color: colors.goldDark, fontWeight: FontWeight.w700,),
          ),
        ),
        const SizedBox(width: AppSpacing.sm),
        Expanded(
          child: Row(
            children: [
              Flexible(
                child: Text(
                  a?.name ?? 'Member',
                  style: (dense ? text.labelMedium : text.titleSmall)
                      ?.copyWith(fontWeight: FontWeight.w700),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (isStaff) ...[
                const SizedBox(width: 6),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                  decoration: BoxDecoration(
                    color: colors.goldPrimary.withValues(alpha: 0.16),
                    borderRadius: AppRadii.rPill,
                  ),
                  child: Text(
                    a.role == 'INSTRUCTOR' ? 'Instructor' : 'Staff',
                    style: text.labelSmall
                        ?.copyWith(color: colors.goldDark, fontSize: 10),
                  ),
                ),
              ],
            ],
          ),
        ),
        if (createdAt != null)
          Text(Formatters.timeAgo(createdAt!),
              style: text.labelSmall?.copyWith(color: colors.textMuted),),
      ],
    );
  }
}

/// Owns its own [TextEditingController] so it is disposed with the sheet
/// (avoids "used after disposed" when the sheet animates out). Returns the
/// entered text via `Navigator.pop`.
class _ComposeSheet extends StatefulWidget {
  const _ComposeSheet({
    required this.title,
    required this.hint,
    required this.postLabel,
  });

  final String title;
  final String hint;
  final String postLabel;

  @override
  State<_ComposeSheet> createState() => _ComposeSheetState();
}

class _ComposeSheetState extends State<_ComposeSheet> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
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
          Text(widget.title, style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: AppSpacing.md),
          TextField(
            controller: _controller,
            minLines: 3,
            maxLines: 8,
            autofocus: true,
            decoration: InputDecoration(hintText: widget.hint),
          ),
          const SizedBox(height: AppSpacing.lg),
          PrimaryButton(
            label: widget.postLabel,
            icon: Icons.send_rounded,
            variant: ButtonVariant.gold,
            onPressed: () {
              final text = _controller.text.trim();
              if (text.isNotEmpty) Navigator.pop(context, text);
            },
          ),
        ],
      ),
    );
  }
}

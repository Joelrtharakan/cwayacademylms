import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/error_banner.dart';
import '../application/notifications_controller.dart';
import '../data/notification_dto.dart';

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = context.colors;
    final async = ref.watch(notificationsControllerProvider);
    final controller = ref.read(notificationsControllerProvider.notifier);
    final unread = async.valueOrNull?.unreadCount ?? 0;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: colors.forestDeep,
        foregroundColor: Colors.white,
        flexibleSpace: DecoratedBox(
          decoration: BoxDecoration(gradient: colors.forestGradient),
        ),
        title: Text(
          'Notifications',
          style: Theme.of(context)
              .textTheme
              .titleLarge
              ?.copyWith(color: Colors.white),
        ),
        actions: [
          if (unread > 0)
            TextButton(
              onPressed: controller.markAllRead,
              child: Text(
                'Mark all read',
                style: TextStyle(color: colors.goldLight, fontWeight: FontWeight.w600),
              ),
            ),
        ],
      ),
      body: RefreshIndicator(
        color: colors.goldPrimary,
        onRefresh: controller.refresh,
        child: async.when(
          skipLoadingOnRefresh: true,
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (_, __) => ListView(
            children: [
              const SizedBox(height: 80),
              Padding(
                padding: const EdgeInsets.all(AppSpacing.xl),
                child: ErrorBanner(
                  message: "We couldn't load notifications.",
                  onRetry: () =>
                      ref.invalidate(notificationsControllerProvider),
                ),
              ),
            ],
          ),
          data: (data) {
            if (data.notifications.isEmpty) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: const [
                  SizedBox(height: 120),
                  EmptyState(
                    icon: Icons.notifications_none_rounded,
                    title: 'You are all caught up',
                    message: 'New notifications will appear here.',
                  ),
                ],
              );
            }
            return ListView.separated(
              padding: const EdgeInsets.only(bottom: 140),
              physics: const AlwaysScrollableScrollPhysics(),
              itemCount: data.notifications.length,
              separatorBuilder: (_, __) => Divider(height: 1, color: colors.border),
              itemBuilder: (context, i) => _NotificationTile(
                item: data.notifications[i],
                onTap: () => _onTap(context, controller, data.notifications[i]),
              ),
            );
          },
        ),
      ),
    );
  }

  Future<void> _onTap(
    BuildContext context,
    NotificationsController controller,
    NotificationDto n,
  ) async {
    if (!n.isRead) unawaited(controller.markRead(n.id));
    // External links open in the browser; in-app deep links are mapped as the
    // notification link scheme stabilizes.
    if (n.hasLink && n.link!.startsWith('http')) {
      final uri = Uri.tryParse(n.link!);
      if (uri != null) await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }
}

class _NotificationTile extends StatelessWidget {
  const _NotificationTile({required this.item, required this.onTap});
  final NotificationDto item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;

    return Material(
      color: item.isRead ? Colors.transparent : colors.goldPrimary.withValues(alpha: 0.05),
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color: colors.surfaceMuted,
                  shape: BoxShape.circle,
                ),
                child: Icon(_iconFor(item.type),
                    size: 18, color: colors.forestLight,),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            item.title,
                            style: text.titleSmall?.copyWith(
                              fontWeight:
                                  item.isRead ? FontWeight.w500 : FontWeight.w700,
                            ),
                          ),
                        ),
                        Text(Formatters.timeAgo(item.createdAt),
                            style: text.labelSmall?.copyWith(color: colors.textMuted),),
                      ],
                    ),
                    if (item.body.isNotEmpty) ...[
                      const SizedBox(height: 2),
                      Text(item.body,
                          style: text.bodySmall?.copyWith(color: colors.textSecondary),),
                    ],
                  ],
                ),
              ),
              if (!item.isRead) ...[
                const SizedBox(width: AppSpacing.sm),
                Container(
                  width: 8,
                  height: 8,
                  margin: const EdgeInsets.only(top: 6),
                  decoration: BoxDecoration(
                      color: colors.goldPrimary, shape: BoxShape.circle,),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  IconData _iconFor(String type) {
    final t = type.toUpperCase();
    if (t.contains('QUIZ')) return Icons.quiz_rounded;
    if (t.contains('ASSIGNMENT') || t.contains('GRADE')) {
      return Icons.assignment_turned_in_rounded;
    }
    if (t.contains('CERTIFICATE')) return Icons.workspace_premium_rounded;
    if (t.contains('ENROLL') || t.contains('COURSE')) return Icons.school_rounded;
    if (t.contains('ANNOUNCE')) return Icons.campaign_rounded;
    return Icons.notifications_rounded;
  }
}

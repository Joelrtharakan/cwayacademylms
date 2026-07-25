import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/notification_dto.dart';
import '../data/notifications_repository.dart';
import 'notification_sse_client.dart';

/// Owns the notification list + unread count. Combines a guaranteed REST poll
/// (every 30s + on-demand) with the live SSE stream for near-instant delivery,
/// and applies optimistic mark-read updates.
class NotificationsController extends AsyncNotifier<NotificationsData> {
  Timer? _poll;
  Timer? _reconnect;
  StreamSubscription<NotifSse>? _sse;
  bool _disposed = false;

  NotificationsRepository get _repo => ref.read(notificationsRepositoryProvider);

  @override
  Future<NotificationsData> build() async {
    ref.onDispose(() {
      _disposed = true;
      _poll?.cancel();
      _reconnect?.cancel();
      _sse?.cancel();
    });

    final data = await _repo.list();
    _startPolling();
    _connectSse();
    return data;
  }

  void _startPolling() {
    _poll?.cancel();
    _poll = Timer.periodic(const Duration(seconds: 30), (_) => refresh());
  }

  void _connectSse() {
    if (_disposed) return;
    _sse?.cancel();
    _sse = ref.read(notificationSseClientProvider).connect().listen(
          _onEvent,
          onError: (_) => _scheduleReconnect(),
          onDone: _scheduleReconnect,
          cancelOnError: true,
        );
  }

  void _scheduleReconnect() {
    if (_disposed) return;
    _reconnect?.cancel();
    _reconnect = Timer(const Duration(seconds: 5), _connectSse);
  }

  void _onEvent(NotifSse event) {
    final current = state.valueOrNull;
    if (current == null) return;
    switch (event) {
      case NotifNew(:final notification):
        if (current.notifications.any((n) => n.id == notification.id)) return;
        state = AsyncData(current.copyWith(
          notifications: [notification, ...current.notifications],
          unreadCount: current.unreadCount + (notification.isRead ? 0 : 1),
        ),);
      case NotifUnread(:final count):
        state = AsyncData(current.copyWith(unreadCount: count));
    }
  }

  Future<void> refresh() async {
    final next = await AsyncValue.guard(_repo.list);
    if (next.hasValue) state = next;
  }

  Future<void> markRead(String id) async {
    final current = state.valueOrNull;
    if (current == null) return;
    final wasUnread =
        current.notifications.any((n) => n.id == id && !n.isRead);
    state = AsyncData(current.copyWith(
      notifications: [
        for (final n in current.notifications)
          if (n.id == id) n.copyWith(isRead: true) else n,
      ],
      unreadCount: wasUnread ? current.unreadCount - 1 : current.unreadCount,
    ),);
    try {
      await _repo.markRead(id);
    } on Object {
      // Optimistic; a later poll reconciles on failure.
    }
  }

  Future<void> markAllRead() async {
    final current = state.valueOrNull;
    if (current == null) return;
    state = AsyncData(current.copyWith(
      notifications: [
        for (final n in current.notifications) n.copyWith(isRead: true),
      ],
      unreadCount: 0,
    ),);
    try {
      await _repo.markAllRead();
    } on Object {
      // Optimistic.
    }
  }
}

final notificationsControllerProvider =
    AsyncNotifierProvider<NotificationsController, NotificationsData>(
  NotificationsController.new,
);

/// Unread badge count for the bottom-nav destination.
final unreadCountProvider = Provider<int>((ref) {
  return ref.watch(notificationsControllerProvider).valueOrNull?.unreadCount ?? 0;
});

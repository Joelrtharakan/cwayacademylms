import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/dio_client.dart';
import '../data/notification_dto.dart';

/// One decoded message from the SSE stream.
sealed class NotifSse {}

class NotifNew extends NotifSse {
  NotifNew(this.notification);
  final NotificationDto notification;
}

class NotifUnread extends NotifSse {
  NotifUnread(this.count);
  final int count;
}

/// Consumes `GET /stream/notifications` (text/event-stream) and yields typed
/// events. The Authorization header is attached by the shared auth interceptor,
/// so a 401 near token expiry triggers a refresh + reconnect transparently.
///
/// This is the "live" layer; the controller always keeps REST polling as a
/// guaranteed fallback, so notifications work even if SSE is unavailable.
class NotificationSseClient {
  NotificationSseClient(this._dio);
  final Dio _dio;

  CancelToken? _cancel;

  Stream<NotifSse> connect() async* {
    _cancel = CancelToken();
    final res = await _dio.get<ResponseBody>(
      '/stream/notifications',
      options: Options(
        responseType: ResponseType.stream,
        headers: {'Accept': 'text/event-stream'},
        receiveTimeout: Duration.zero, // long-lived stream
      ),
      cancelToken: _cancel,
    );

    var buffer = '';
    String? event;
    final dataLines = <String>[];

    await for (final chunk in res.data!.stream) {
      buffer += utf8.decode(chunk, allowMalformed: true);
      int nl;
      while ((nl = buffer.indexOf('\n')) >= 0) {
        var line = buffer.substring(0, nl);
        buffer = buffer.substring(nl + 1);
        if (line.endsWith('\r')) line = line.substring(0, line.length - 1);

        if (line.isEmpty) {
          if (dataLines.isNotEmpty) {
            final msg = _decode(event ?? 'message', dataLines.join('\n'));
            if (msg != null) yield msg;
          }
          event = null;
          dataLines.clear();
          continue;
        }
        if (line.startsWith(':')) continue; // comment / keep-alive ping
        if (line.startsWith('event:')) {
          event = line.substring(6).trim();
        } else if (line.startsWith('data:')) {
          dataLines.add(line.substring(5).trim());
        }
      }
    }
  }

  NotifSse? _decode(String event, String data) {
    try {
      final json = jsonDecode(data);
      if (event == 'notification' && json is Map<String, dynamic>) {
        return NotifNew(NotificationDto.fromJson(json));
      }
      if (event == 'unread' && json is Map && json['unreadCount'] is int) {
        return NotifUnread(json['unreadCount'] as int);
      }
    } on Object {
      // Ignore malformed frames.
    }
    return null;
  }

  void close() => _cancel?.cancel();
}

final notificationSseClientProvider = Provider<NotificationSseClient>((ref) {
  return NotificationSseClient(ref.watch(dioProvider));
});

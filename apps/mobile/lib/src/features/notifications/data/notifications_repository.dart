import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/network/dio_client.dart';
import 'notification_dto.dart';

abstract interface class NotificationsRepository {
  Future<NotificationsData> list();
  Future<void> markRead(String id);
  Future<void> markAllRead();
}

class NotificationsRepositoryImpl implements NotificationsRepository {
  NotificationsRepositoryImpl(this._dio);
  final Dio _dio;

  @override
  Future<NotificationsData> list() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/student/notifications');
      final data = res.data?['data'];
      if (data is Map<String, dynamic>) return NotificationsData.fromJson(data);
      return const NotificationsData();
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  @override
  Future<void> markRead(String id) async {
    try {
      await _dio.put<Map<String, dynamic>>('/student/notifications/$id/read');
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  @override
  Future<void> markAllRead() async {
    try {
      await _dio.put<Map<String, dynamic>>('/student/notifications/read-all');
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }
}

final notificationsRepositoryProvider = Provider<NotificationsRepository>((ref) {
  return NotificationsRepositoryImpl(ref.watch(dioProvider));
});

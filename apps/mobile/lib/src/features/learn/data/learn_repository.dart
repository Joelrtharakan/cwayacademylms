import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/offline/json_cache.dart';
import 'learn_dto.dart';

abstract interface class LearnRepository {
  /// [pin] keeps the cached payload permanently (used by "Save for offline").
  Future<EnrollmentLearnDto> enrollment(String courseId, {bool pin = false});

  /// Persists the watched position (seconds). The backend auto-marks the lesson
  /// complete once this crosses 80% of the lesson duration.
  Future<void> saveProgress({
    required String enrollmentId,
    required String lessonId,
    required int watchedSeconds,
  });

  Future<void> completeLesson({
    required String enrollmentId,
    required String lessonId,
  });
}

class LearnRepositoryImpl implements LearnRepository {
  LearnRepositoryImpl(this._dio, this._cache);
  final Dio _dio;
  final JsonCache _cache;

  @override
  Future<EnrollmentLearnDto> enrollment(String courseId, {bool pin = false}) async {
    final key = 'learn:$courseId';
    try {
      final res = await _dio.get<Map<String, dynamic>>(
        '/student/courses/$courseId/learn',
      );
      final data = res.data?['data'];
      if (data is Map<String, dynamic>) {
        await _cache.put(key, data, pinned: pin);
        return EnrollmentLearnDto.fromJson(data);
      }
      throw const ApiException(message: 'Enrollment not found.', statusCode: 404);
    } on DioException catch (e) {
      final api = ApiException.fromDio(e);
      if (api.isNetwork || api.kind == ApiErrorKind.timeout) {
        final cached = await _cache.get(key);
        if (cached is Map<String, dynamic>) {
          if (pin) await _cache.setPinned(key, true);
          return EnrollmentLearnDto.fromJson(cached);
        }
      }
      throw api;
    }
  }

  @override
  Future<void> saveProgress({
    required String enrollmentId,
    required String lessonId,
    required int watchedSeconds,
  }) async {
    try {
      await _dio.post<Map<String, dynamic>>(
        '/student/enrollments/$enrollmentId/lessons/$lessonId/progress',
        data: {'watchedSeconds': watchedSeconds},
      );
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  @override
  Future<void> completeLesson({
    required String enrollmentId,
    required String lessonId,
  }) async {
    try {
      await _dio.post<Map<String, dynamic>>(
        '/student/enrollments/$enrollmentId/lessons/$lessonId/complete',
      );
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }
}

final learnRepositoryProvider = Provider<LearnRepository>((ref) {
  return LearnRepositoryImpl(
    ref.watch(dioProvider),
    ref.watch(jsonCacheProvider),
  );
});

/// Learn payload for a course, keyed by courseId.
final learnEnrollmentProvider =
    FutureProvider.family<EnrollmentLearnDto, String>((ref, courseId) {
  return ref.watch(learnRepositoryProvider).enrollment(courseId);
});

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/network/dio_client.dart';
import 'course_insights_dto.dart';

/// Per-course insights for the owning instructor (or an admin). The backend
/// verifies ownership before returning either payload.
abstract interface class CourseInsightsRepository {
  Future<List<EnrolledStudentDto>> students(String courseId);
  Future<CourseAnalyticsDto> analytics(String courseId);
}

class CourseInsightsRepositoryImpl implements CourseInsightsRepository {
  CourseInsightsRepositoryImpl(this._dio);
  final Dio _dio;

  @override
  Future<List<EnrolledStudentDto>> students(String courseId) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>(
        '/instructor/courses/$courseId/students',
      );
      final data = res.data?['data'];
      if (data is List) {
        return data
            .whereType<Map<String, dynamic>>()
            .map(EnrolledStudentDto.fromJson)
            .toList();
      }
      return const [];
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  @override
  Future<CourseAnalyticsDto> analytics(String courseId) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>(
        '/instructor/courses/$courseId/analytics',
      );
      final data = res.data?['data'];
      if (data is Map<String, dynamic>) return CourseAnalyticsDto.fromJson(data);
      throw const ApiException(message: 'No analytics available.', statusCode: 404);
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }
}

final courseInsightsRepositoryProvider =
    Provider<CourseInsightsRepository>((ref) {
  return CourseInsightsRepositoryImpl(ref.watch(dioProvider));
});

final courseStudentsProvider = FutureProvider.family
    .autoDispose<List<EnrolledStudentDto>, String>((ref, courseId) {
  return ref.watch(courseInsightsRepositoryProvider).students(courseId);
});

final courseAnalyticsProvider =
    FutureProvider.family.autoDispose<CourseAnalyticsDto, String>((ref, courseId) {
  return ref.watch(courseInsightsRepositoryProvider).analytics(courseId);
});

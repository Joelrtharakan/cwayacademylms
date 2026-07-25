import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/offline/json_cache.dart';
import '../application/course_query.dart';
import 'course_dto.dart';

abstract interface class CoursesRepository {
  Future<CoursesPageDto> list(CourseQuery query, {required int page});

  /// Courses the current user owns/manages — `GET /instructor/courses`.
  /// The backend scopes this by ownership: instructors get only their own
  /// courses; admins/registrars get all. Authorization is enforced server-side.
  Future<List<CourseListItemDto>> myCourses();

  Future<CourseDetailDto> getById(String idOrSlug);
  Future<List<CategoryDto>> categories();

  /// Enrolls the current student. Throws [ApiException]; a 400 typically means
  /// "already enrolled".
  Future<void> enroll(String courseId);
}

class CoursesRepositoryImpl implements CoursesRepository {
  CoursesRepositoryImpl(this._dio, this._cache);
  final Dio _dio;
  final JsonCache _cache;

  @override
  Future<CoursesPageDto> list(CourseQuery query, {required int page}) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>(
        '/courses',
        queryParameters: query.toParams(page: page),
      );
      final data = res.data?['data'];
      if (data is Map<String, dynamic>) return CoursesPageDto.fromJson(data);
      return const CoursesPageDto();
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  @override
  Future<List<CourseListItemDto>> myCourses() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/instructor/courses');
      final data = res.data?['data'];
      if (data is Map<String, dynamic>) return CoursesPageDto.fromJson(data).courses;
      return const [];
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  @override
  Future<CourseDetailDto> getById(String idOrSlug) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/courses/$idOrSlug');
      final data = res.data?['data'];
      if (data is Map<String, dynamic>) {
        await _cache.put('course:$idOrSlug', data);
        return CourseDetailDto.fromJson(data);
      }
      throw const ApiException(message: 'Course not found.', statusCode: 404);
    } on DioException catch (e) {
      final api = ApiException.fromDio(e);
      if (api.isNetwork || api.kind == ApiErrorKind.timeout) {
        final cached = await _cache.get('course:$idOrSlug');
        if (cached is Map<String, dynamic>) return CourseDetailDto.fromJson(cached);
      }
      throw api;
    }
  }

  @override
  Future<List<CategoryDto>> categories() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/categories');
      final data = res.data?['data'];
      if (data is List) {
        return data
            .whereType<Map<String, dynamic>>()
            .map(CategoryDto.fromJson)
            .toList();
      }
      return const [];
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  @override
  Future<void> enroll(String courseId) async {
    try {
      await _dio.post<Map<String, dynamic>>(
        '/student/enrollments',
        data: {'courseId': courseId},
      );
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }
}

final coursesRepositoryProvider = Provider<CoursesRepository>((ref) {
  return CoursesRepositoryImpl(
    ref.watch(dioProvider),
    ref.watch(jsonCacheProvider),
  );
});

final categoriesProvider = FutureProvider<List<CategoryDto>>((ref) {
  return ref.watch(coursesRepositoryProvider).categories();
});

/// Owned/managed courses for the signed-in instructor or admin.
final myCoursesProvider = FutureProvider<List<CourseListItemDto>>((ref) {
  return ref.watch(coursesRepositoryProvider).myCourses();
});

/// Course detail, keyed by id or slug.
final courseDetailProvider =
    FutureProvider.family<CourseDetailDto, String>((ref, idOrSlug) {
  return ref.watch(coursesRepositoryProvider).getById(idOrSlug);
});

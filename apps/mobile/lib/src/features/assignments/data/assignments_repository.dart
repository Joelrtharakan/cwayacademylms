import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/network/dio_client.dart';
import 'assignment_dto.dart';

abstract interface class AssignmentsRepository {
  Future<List<AssignmentDto>> list();
  Future<SubmissionDto?> mySubmission(String assignmentId);

  /// Submits (or resubmits) an assignment. At least one of [content]/[filePath]
  /// is required. Fails with a 403 if the due date has passed without extension.
  Future<void> submit({
    required String assignmentId,
    String? content,
    String? filePath,
    String? fileName,
  });

  Future<void> unsubmit(String assignmentId);
}

class AssignmentsRepositoryImpl implements AssignmentsRepository {
  AssignmentsRepositoryImpl(this._dio);
  final Dio _dio;

  @override
  Future<List<AssignmentDto>> list() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/student/assignments');
      final data = res.data?['data'];
      if (data is List) {
        return data
            .whereType<Map<String, dynamic>>()
            .map(AssignmentDto.fromJson)
            .toList();
      }
      return const [];
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  @override
  Future<SubmissionDto?> mySubmission(String assignmentId) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>(
        '/student/assignments/$assignmentId/my-submission',
      );
      final data = res.data?['data'];
      if (data is Map<String, dynamic>) return SubmissionDto.fromJson(data);
      return null; // no submission yet
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  @override
  Future<void> submit({
    required String assignmentId,
    String? content,
    String? filePath,
    String? fileName,
  }) async {
    try {
      final form = FormData.fromMap({
        if (content != null && content.trim().isNotEmpty) 'content': content.trim(),
        if (filePath != null)
          'file': await MultipartFile.fromFile(filePath, filename: fileName),
      });
      await _dio.post<Map<String, dynamic>>(
        '/student/assignments/$assignmentId/submit',
        data: form,
      );
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  @override
  Future<void> unsubmit(String assignmentId) async {
    try {
      await _dio.delete<Map<String, dynamic>>(
        '/student/assignments/$assignmentId/unsubmit',
      );
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }
}

final assignmentsRepositoryProvider = Provider<AssignmentsRepository>((ref) {
  return AssignmentsRepositoryImpl(ref.watch(dioProvider));
});

final myAssignmentsProvider = FutureProvider<List<AssignmentDto>>((ref) {
  return ref.watch(assignmentsRepositoryProvider).list();
});

final mySubmissionProvider =
    FutureProvider.family<SubmissionDto?, String>((ref, assignmentId) {
  return ref.watch(assignmentsRepositoryProvider).mySubmission(assignmentId);
});

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/network/dio_client.dart';
import 'grading_dto.dart';

/// Instructor grading. Every endpoint is authorized server-side: the backend
/// scopes submissions to the instructor's own courses and verifies ownership
/// before accepting a grade.
abstract interface class GradingRepository {
  /// Submissions across the instructor's courses. [graded] filters by state;
  /// null returns both.
  Future<List<SubmissionDto>> submissions({bool? graded});

  /// Records a grade (0..maxScore) and optional feedback for a submission.
  Future<void> grade({
    required String submissionId,
    required double grade,
    String? feedback,
  });
}

class GradingRepositoryImpl implements GradingRepository {
  GradingRepositoryImpl(this._dio);
  final Dio _dio;

  @override
  Future<List<SubmissionDto>> submissions({bool? graded}) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>(
        '/instructor/assignments',
        queryParameters: {
          if (graded != null) 'isGraded': graded.toString(),
          'limit': 100,
        },
      );
      final data = res.data?['data'];
      if (data is List) {
        return data
            .whereType<Map<String, dynamic>>()
            .map(SubmissionDto.fromJson)
            .toList();
      }
      return const [];
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  @override
  Future<void> grade({
    required String submissionId,
    required double grade,
    String? feedback,
  }) async {
    try {
      await _dio.put<Map<String, dynamic>>(
        '/submissions/$submissionId/grade',
        data: {
          'grade': grade,
          if (feedback != null && feedback.isNotEmpty) 'feedback': feedback,
        },
      );
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }
}

final gradingRepositoryProvider = Provider<GradingRepository>((ref) {
  return GradingRepositoryImpl(ref.watch(dioProvider));
});

/// Submissions still awaiting a grade, across the instructor's courses.
final pendingGradingProvider = FutureProvider<List<SubmissionDto>>((ref) {
  return ref.watch(gradingRepositoryProvider).submissions(graded: false);
});

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/i18n/app_translations.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/network/dio_client.dart';
import 'quiz_dto.dart';

abstract interface class QuizRepository {
  /// Creates a new attempt and returns the sanitized questions.
  Future<AttemptStartDto> start(String quizId);

  Future<QuizResultDto> submit({
    required String quizId,
    required String attemptId,
    required Map<String, Object?> answers,
    required int timeTaken,
  });

  Future<List<QuizAttemptDto>> myAttempts(String quizId);
}

class QuizRepositoryImpl implements QuizRepository {
  QuizRepositoryImpl(this._dio);
  final Dio _dio;

  @override
  Future<AttemptStartDto> start(String quizId) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>(
        '/student/quizzes/$quizId/attempt',
      );
      final data = res.data?['data'];
      if (data is Map<String, dynamic>) return AttemptStartDto.fromJson(data);
      throw ApiException(message: AppTranslations.tg('mobile.errors.startQuiz'));
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  @override
  Future<QuizResultDto> submit({
    required String quizId,
    required String attemptId,
    required Map<String, Object?> answers,
    required int timeTaken,
  }) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>(
        '/student/quizzes/$quizId/submit',
        data: {
          'attemptId': attemptId,
          'answers': answers,
          'timeTaken': timeTaken,
        },
      );
      final data = res.data?['data'];
      if (data is Map<String, dynamic>) return QuizResultDto.fromJson(data);
      throw ApiException(message: AppTranslations.tg('mobile.errors.submitQuiz'));
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  @override
  Future<List<QuizAttemptDto>> myAttempts(String quizId) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>(
        '/student/quizzes/$quizId/my-attempts',
      );
      final data = res.data?['data'];
      if (data is List) {
        return data
            .whereType<Map<String, dynamic>>()
            .map(QuizAttemptDto.fromJson)
            .toList();
      }
      return const [];
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }
}

final quizRepositoryProvider = Provider<QuizRepository>((ref) {
  return QuizRepositoryImpl(ref.watch(dioProvider));
});

final quizAttemptsProvider =
    FutureProvider.family<List<QuizAttemptDto>, String>((ref, quizId) {
  return ref.watch(quizRepositoryProvider).myAttempts(quizId);
});

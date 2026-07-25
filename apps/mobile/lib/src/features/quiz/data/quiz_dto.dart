import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../core/localization/localized_text.dart';

part 'quiz_dto.freezed.dart';
part 'quiz_dto.g.dart';

/// `POST /student/quizzes/:id/attempt` → `data`. Answers are sanitized
/// (no `isCorrect`) until submission.
@freezed
class AttemptStartDto with _$AttemptStartDto {
  const factory AttemptStartDto({
    required String attemptId,
    required QuizDto quiz,
    @Default(0) int attemptsUsed,
    @Default(0) int attemptsAllowed,
  }) = _AttemptStartDto;
  factory AttemptStartDto.fromJson(Map<String, dynamic> json) =>
      _$AttemptStartDtoFromJson(json);
}

@freezed
class QuizDto with _$QuizDto {
  const factory QuizDto({
    required String id,
    @LocalizedTextConverter() @Default(LocalizedText.empty) LocalizedText title,
    @Default(70) int passingScore,
    int? timeLimit, // seconds; null = untimed
    @Default(<QuizQuestionDto>[]) List<QuizQuestionDto> questions,
  }) = _QuizDto;
  factory QuizDto.fromJson(Map<String, dynamic> json) => _$QuizDtoFromJson(json);
}

@freezed
class QuizQuestionDto with _$QuizQuestionDto {
  const QuizQuestionDto._();
  const factory QuizQuestionDto({
    required String id,
    @LocalizedTextConverter() @Default(LocalizedText.empty) LocalizedText text,
    @Default('MCQ') String type,
    @Default(1) int points,
    String? scriptureRef,
    @Default(0) int order,
    @Default(<QuizAnswerDto>[]) List<QuizAnswerDto> answers,
  }) = _QuizQuestionDto;
  factory QuizQuestionDto.fromJson(Map<String, dynamic> json) =>
      _$QuizQuestionDtoFromJson(json);

  bool get isShortAnswer => type.toUpperCase() == 'SHORT_ANSWER';
}

@freezed
class QuizAnswerDto with _$QuizAnswerDto {
  const factory QuizAnswerDto({
    required String id,
    @LocalizedTextConverter() @Default(LocalizedText.empty) LocalizedText text,
  }) = _QuizAnswerDto;
  factory QuizAnswerDto.fromJson(Map<String, dynamic> json) =>
      _$QuizAnswerDtoFromJson(json);
}

/// `POST /student/quizzes/:id/submit` → `data`.
@freezed
class QuizResultDto with _$QuizResultDto {
  const QuizResultDto._();
  const factory QuizResultDto({
    @Default(0) double score,
    @Default(false) bool passed,
    @Default(70) int passingScore,
    @Default(0) int earnedPoints,
    @Default(0) int totalPoints,
    @Default(<QuizResultItemDto>[]) List<QuizResultItemDto> results,
    @Default(false) bool canRetake,
    Object? attemptsLeft, // int or the string "Unlimited"
  }) = _QuizResultDto;
  factory QuizResultDto.fromJson(Map<String, dynamic> json) =>
      _$QuizResultDtoFromJson(json);

  String get attemptsLeftLabel {
    final v = attemptsLeft;
    if (v is num) return '$v';
    return v?.toString() ?? '—';
  }
}

@freezed
class QuizResultItemDto with _$QuizResultItemDto {
  const factory QuizResultItemDto({
    required String questionId,
    Object? questionText,
    @Default('MCQ') String type,
    Object? yourAnswer,
    Object? correctAnswer,
    @Default(false) bool isCorrect,
    @Default(0) int points,
    @Default(0) int pointsEarned,
    String? scriptureRef,
  }) = _QuizResultItemDto;
  factory QuizResultItemDto.fromJson(Map<String, dynamic> json) =>
      _$QuizResultItemDtoFromJson(json);
}

/// A row of `GET /student/quizzes/:id/my-attempts`.
@freezed
class QuizAttemptDto with _$QuizAttemptDto {
  const factory QuizAttemptDto({
    required String id,
    @Default(0) double score,
    @Default(false) bool passed,
    DateTime? startedAt,
    DateTime? completedAt,
  }) = _QuizAttemptDto;
  factory QuizAttemptDto.fromJson(Map<String, dynamic> json) =>
      _$QuizAttemptDtoFromJson(json);
}

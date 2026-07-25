import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../core/localization/localized_text.dart';
import '../../../core/utils/youtube.dart';

part 'learn_dto.freezed.dart';
part 'learn_dto.g.dart';

/// The learner's enrollment + curriculum with per-lesson progress.
/// Mirrors `GET /student/courses/:courseId/learn` → `data`.
@freezed
class EnrollmentLearnDto with _$EnrollmentLearnDto {
  const EnrollmentLearnDto._();

  const factory EnrollmentLearnDto({
    required String id, // enrollmentId
    required String courseId,
    @Default(0) double progress,
    @Default('ACTIVE') String status,
    required LearnCourseDto course,
  }) = _EnrollmentLearnDto;

  factory EnrollmentLearnDto.fromJson(Map<String, dynamic> json) =>
      _$EnrollmentLearnDtoFromJson(json);

  /// All lessons across sections in curriculum order.
  List<LearnLessonDto> get orderedLessons =>
      [for (final s in course.sections) ...s.lessons];
}

@freezed
class LearnCourseDto with _$LearnCourseDto {
  const factory LearnCourseDto({
    required String id,
    @LocalizedTextConverter() @Default(LocalizedText.empty) LocalizedText title,
    @Default(<LearnSectionDto>[]) List<LearnSectionDto> sections,
  }) = _LearnCourseDto;
  factory LearnCourseDto.fromJson(Map<String, dynamic> json) =>
      _$LearnCourseDtoFromJson(json);
}

@freezed
class LearnSectionDto with _$LearnSectionDto {
  const factory LearnSectionDto({
    required String id,
    @LocalizedTextConverter() @Default(LocalizedText.empty) LocalizedText title,
    @Default(0) int order,
    @Default(<LearnLessonDto>[]) List<LearnLessonDto> lessons,
    @Default(<LearnReadingDto>[]) List<LearnReadingDto> readingMaterials,
  }) = _LearnSectionDto;
  factory LearnSectionDto.fromJson(Map<String, dynamic> json) =>
      _$LearnSectionDtoFromJson(json);
}

@freezed
class LearnLessonDto with _$LearnLessonDto {
  const LearnLessonDto._();

  const factory LearnLessonDto({
    required String id,
    @LocalizedTextConverter() @Default(LocalizedText.empty) LocalizedText title,
    @Default('VIDEO') String type,
    @Default(0) int duration,
    @Default(0) int order,
    @Default(false) bool isFree,
    @Default(false) bool isPreview,
    String? videoUrl,
    String? bunnyVideoId,
    Object? content,
    LearnQuizRef? quiz,
    LearnAssignmentRef? assignment,
    @Default(false) bool isCompleted,
    @Default(0) int watchedSeconds,
  }) = _LearnLessonDto;

  factory LearnLessonDto.fromJson(Map<String, dynamic> json) =>
      _$LearnLessonDtoFromJson(json);

  bool get isVideo => type.toUpperCase() == 'VIDEO';
  bool get isQuiz => type.toUpperCase() == 'QUIZ' || quiz != null;
  bool get isAssignment =>
      type.toUpperCase() == 'ASSIGNMENT' || assignment != null;
  String? get youTubeId => extractYouTubeId(videoUrl);
  bool get hasPlayableVideo => youTubeId != null;
}

@freezed
class LearnQuizRef with _$LearnQuizRef {
  const factory LearnQuizRef({
    required String id,
    int? passingScore,
    int? timeLimit,
    int? maxAttempts,
  }) = _LearnQuizRef;
  factory LearnQuizRef.fromJson(Map<String, dynamic> json) =>
      _$LearnQuizRefFromJson(json);
}

@freezed
class LearnAssignmentRef with _$LearnAssignmentRef {
  const factory LearnAssignmentRef({
    required String id,
    @LocalizedTextConverter() @Default(LocalizedText.empty) LocalizedText title,
    @LocalizedTextConverter() @Default(LocalizedText.empty) LocalizedText description,
    DateTime? dueDate,
    @Default(100) int maxScore,
    String? attachmentUrl,
  }) = _LearnAssignmentRef;
  factory LearnAssignmentRef.fromJson(Map<String, dynamic> json) =>
      _$LearnAssignmentRefFromJson(json);
}

@freezed
class LearnReadingDto with _$LearnReadingDto {
  const factory LearnReadingDto({
    required String id,
    @LocalizedTextConverter() @Default(LocalizedText.empty) LocalizedText title,
    String? fileUrl,
    @Default(false) bool isCompleted,
  }) = _LearnReadingDto;
  factory LearnReadingDto.fromJson(Map<String, dynamic> json) =>
      _$LearnReadingDtoFromJson(json);
}

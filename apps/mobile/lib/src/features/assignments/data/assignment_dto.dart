import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../core/localization/localized_text.dart';

part 'assignment_dto.freezed.dart';
part 'assignment_dto.g.dart';

/// A row of `GET /student/assignments`.
@freezed
class AssignmentDto with _$AssignmentDto {
  const AssignmentDto._();

  const factory AssignmentDto({
    required String id,
    @LocalizedTextConverter() @Default(LocalizedText.empty) LocalizedText title,
    @LocalizedTextConverter() @Default(LocalizedText.empty) LocalizedText courseName,
    String? courseId,
    String? lessonId,
    @Default(100) int totalPoints,
    SubmissionDto? submission,
  }) = _AssignmentDto;

  factory AssignmentDto.fromJson(Map<String, dynamic> json) =>
      _$AssignmentDtoFromJson(json);

  bool get isSubmitted => submission != null;
  bool get isGraded => submission?.isGraded ?? false;
}

/// A submission — embedded in the list, or returned by `.../my-submission`
/// (which also nests the full [assignment]).
@freezed
class SubmissionDto with _$SubmissionDto {
  const SubmissionDto._();

  const factory SubmissionDto({
    required String id,
    String? content,
    String? fileUrl,
    DateTime? submittedAt,
    double? grade,
    String? feedback,
    DateTime? gradedAt,
    @Default(false) bool isGraded,
    AssignmentInfoDto? assignment,
  }) = _SubmissionDto;

  factory SubmissionDto.fromJson(Map<String, dynamic> json) =>
      _$SubmissionDtoFromJson(json);

  bool get hasFile => fileUrl != null && fileUrl!.isNotEmpty;
}

/// Full assignment info (nested inside `.../my-submission`).
@freezed
class AssignmentInfoDto with _$AssignmentInfoDto {
  const factory AssignmentInfoDto({
    required String id,
    @LocalizedTextConverter() @Default(LocalizedText.empty) LocalizedText title,
    @LocalizedTextConverter() @Default(LocalizedText.empty) LocalizedText description,
    DateTime? dueDate,
    @Default(100) int maxScore,
    String? attachmentUrl,
  }) = _AssignmentInfoDto;

  factory AssignmentInfoDto.fromJson(Map<String, dynamic> json) =>
      _$AssignmentInfoDtoFromJson(json);
}

import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../core/localization/localized_text.dart';

part 'dashboard_dto.freezed.dart';
part 'dashboard_dto.g.dart';

/// Mirrors `GET /student/dashboard` → `data`. The backend recomputes `progress`
/// (0–100) and strips heavy nested sections before responding.
@freezed
class DashboardDto with _$DashboardDto {
  const DashboardDto._();

  const factory DashboardDto({
    @Default(<EnrollmentDto>[]) List<EnrollmentDto> enrollments,
    @Default(<ProgramEnrollmentDto>[]) List<ProgramEnrollmentDto> programEnrollments,
    EnrollmentDto? activeEnrollment,
    @Default(0) int certificatesCount,
    @Default(0) int pendingAssignmentsCount,
  }) = _DashboardDto;

  factory DashboardDto.fromJson(Map<String, dynamic> json) =>
      _$DashboardDtoFromJson(json);

  int get inProgressCount =>
      enrollments.where((e) => e.progress < 100).length;

  bool get isEmpty => enrollments.isEmpty && programEnrollments.isEmpty;
}

@freezed
class EnrollmentDto with _$EnrollmentDto {
  const EnrollmentDto._();

  const factory EnrollmentDto({
    required String id,
    required String courseId,
    @Default(0) double progress,
    @Default('ACTIVE') String status,
    DateTime? enrolledAt,
    DateTime? completedAt,
    required CourseSummaryDto course,
  }) = _EnrollmentDto;

  factory EnrollmentDto.fromJson(Map<String, dynamic> json) =>
      _$EnrollmentDtoFromJson(json);

  bool get isCompleted => progress >= 100 || completedAt != null;
  double get progressFraction => (progress / 100).clamp(0, 1).toDouble();
}

@freezed
class CourseSummaryDto with _$CourseSummaryDto {
  const CourseSummaryDto._();

  const factory CourseSummaryDto({
    required String id,
    @LocalizedTextConverter() required LocalizedText title,
    String? slug,
    String? thumbnail,
    int? moduleNumber,
    InstructorRef? instructor,
    ProgramRef? program,
    @JsonKey(name: '_count') CourseCountRef? count,
  }) = _CourseSummaryDto;

  factory CourseSummaryDto.fromJson(Map<String, dynamic> json) =>
      _$CourseSummaryDtoFromJson(json);

  String get instructorName => instructor?.name ?? '';
  int get sectionsCount => count?.sections ?? 0;
}

@freezed
class InstructorRef with _$InstructorRef {
  const factory InstructorRef({String? name}) = _InstructorRef;
  factory InstructorRef.fromJson(Map<String, dynamic> json) =>
      _$InstructorRefFromJson(json);
}

@freezed
class ProgramRef with _$ProgramRef {
  const factory ProgramRef({
    @LocalizedTextConverter() @Default(LocalizedText.empty) LocalizedText title,
  }) = _ProgramRef;
  factory ProgramRef.fromJson(Map<String, dynamic> json) =>
      _$ProgramRefFromJson(json);
}

@freezed
class CourseCountRef with _$CourseCountRef {
  const factory CourseCountRef({@Default(0) int sections}) = _CourseCountRef;
  factory CourseCountRef.fromJson(Map<String, dynamic> json) =>
      _$CourseCountRefFromJson(json);
}

@freezed
class ProgramEnrollmentDto with _$ProgramEnrollmentDto {
  const factory ProgramEnrollmentDto({
    required String id,
    ProgramSummaryDto? program,
  }) = _ProgramEnrollmentDto;
  factory ProgramEnrollmentDto.fromJson(Map<String, dynamic> json) =>
      _$ProgramEnrollmentDtoFromJson(json);
}

@freezed
class ProgramSummaryDto with _$ProgramSummaryDto {
  const factory ProgramSummaryDto({
    required String id,
    @LocalizedTextConverter() @Default(LocalizedText.empty) LocalizedText title,
    @Default(<CourseSummaryDto>[]) List<CourseSummaryDto> courses,
  }) = _ProgramSummaryDto;
  factory ProgramSummaryDto.fromJson(Map<String, dynamic> json) =>
      _$ProgramSummaryDtoFromJson(json);
}

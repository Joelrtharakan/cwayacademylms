import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../core/localization/localized_text.dart';

part 'certificate_dto.freezed.dart';
part 'certificate_dto.g.dart';

/// A certificate from `GET /student/certificates/my`.
@freezed
class CertificateDto with _$CertificateDto {
  const CertificateDto._();

  const factory CertificateDto({
    required String id,
    @Default('COURSE') String type,
    String? courseId,
    String? programId,
    DateTime? issuedAt,
    String? uniqueCode,
    String? certificateNumber,
    String? downloadUrl,
    CertCourseRef? course,
    CertProgramRef? program,
  }) = _CertificateDto;

  factory CertificateDto.fromJson(Map<String, dynamic> json) =>
      _$CertificateDtoFromJson(json);

  bool get isProgram => type.toUpperCase() == 'PROGRAM';

  LocalizedText get titleText =>
      course?.title ?? program?.title ?? LocalizedText.empty;

  String? get instructorName => course?.instructor?.name;
  String? get scriptureRef => course?.scriptureRef;
  String? get thumbnail => course?.thumbnail;
}

@freezed
class CertCourseRef with _$CertCourseRef {
  const factory CertCourseRef({
    @LocalizedTextConverter() @Default(LocalizedText.empty) LocalizedText title,
    int? moduleNumber,
    String? thumbnail,
    String? scriptureRef,
    String? slug,
    CertInstructorRef? instructor,
    CertProgramRef? program,
  }) = _CertCourseRef;
  factory CertCourseRef.fromJson(Map<String, dynamic> json) =>
      _$CertCourseRefFromJson(json);
}

@freezed
class CertProgramRef with _$CertProgramRef {
  const factory CertProgramRef({
    @LocalizedTextConverter() @Default(LocalizedText.empty) LocalizedText title,
  }) = _CertProgramRef;
  factory CertProgramRef.fromJson(Map<String, dynamic> json) =>
      _$CertProgramRefFromJson(json);
}

@freezed
class CertInstructorRef with _$CertInstructorRef {
  const factory CertInstructorRef({String? name}) = _CertInstructorRef;
  factory CertInstructorRef.fromJson(Map<String, dynamic> json) =>
      _$CertInstructorRefFromJson(json);
}

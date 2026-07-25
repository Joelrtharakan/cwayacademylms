import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../core/localization/localized_text.dart';

part 'course_dto.freezed.dart';
part 'course_dto.g.dart';

/// Catalog card — mirrors an item of `GET /courses` → `data.courses[]`.
@freezed
class CourseListItemDto with _$CourseListItemDto {
  const CourseListItemDto._();

  const factory CourseListItemDto({
    required String id,
    @LocalizedTextConverter() required LocalizedText title,
    String? slug,
    @LocalizedTextConverter() @Default(LocalizedText.empty) LocalizedText subtitle,
    String? thumbnail,
    @Default(0) double price,
    @Default('INR') String currency,
    @Default('BEGINNER') String level,
    @Default('ENGLISH') String language,
    int? moduleNumber,
    int? weeksDuration,
    int? totalLectures,
    @Default(false) bool isFree,
    @Default(false) bool isFeatured,
    String? programId,
    CourseInstructorDto? instructor,
    CourseCategoryRef? category,
    @JsonKey(name: '_count') CourseCountRef? count,
    @Default(0) double avgRating,
    @Default(0) int reviewCount,
    // Present on the instructor/admin `GET /instructor/courses` payload; the
    // public catalog only ever returns PUBLISHED items.
    @Default('PUBLISHED') String status,
    @Default(0) double avgProgress,
  }) = _CourseListItemDto;

  factory CourseListItemDto.fromJson(Map<String, dynamic> json) =>
      _$CourseListItemDtoFromJson(json);

  int get enrollmentCount => count?.enrollments ?? 0;
  int get sectionsCount => count?.sections ?? 0;

  bool get isPublished => status == 'PUBLISHED';
  bool get isDraft => status == 'DRAFT';
}

@freezed
class CoursesPageDto with _$CoursesPageDto {
  const CoursesPageDto._();

  const factory CoursesPageDto({
    @Default(<CourseListItemDto>[]) List<CourseListItemDto> courses,
    @Default(0) int total,
    @Default(1) int page,
    @Default(1) int pages,
  }) = _CoursesPageDto;

  factory CoursesPageDto.fromJson(Map<String, dynamic> json) =>
      _$CoursesPageDtoFromJson(json);

  bool get hasMore => page < pages;
}

@freezed
class CourseInstructorDto with _$CourseInstructorDto {
  const factory CourseInstructorDto({
    required String id,
    @Default('') String name,
    String? avatar,
    String? bio,
    String? church,
  }) = _CourseInstructorDto;
  factory CourseInstructorDto.fromJson(Map<String, dynamic> json) =>
      _$CourseInstructorDtoFromJson(json);
}

@freezed
class CourseCategoryRef with _$CourseCategoryRef {
  const factory CourseCategoryRef({
    @LocalizedTextConverter() @Default(LocalizedText.empty) LocalizedText name,
  }) = _CourseCategoryRef;
  factory CourseCategoryRef.fromJson(Map<String, dynamic> json) =>
      _$CourseCategoryRefFromJson(json);
}

@freezed
class CourseCountRef with _$CourseCountRef {
  const factory CourseCountRef({
    @Default(0) int enrollments,
    @Default(0) int sections,
  }) = _CourseCountRef;
  factory CourseCountRef.fromJson(Map<String, dynamic> json) =>
      _$CourseCountRefFromJson(json);
}

/// A category filter option — `GET /categories`.
@freezed
class CategoryDto with _$CategoryDto {
  const CategoryDto._();

  const factory CategoryDto({
    required String id,
    @LocalizedTextConverter() required LocalizedText name,
    String? slug,
    String? icon,
    @Default(0) int order,
  }) = _CategoryDto;

  factory CategoryDto.fromJson(Map<String, dynamic> json) =>
      _$CategoryDtoFromJson(json);
}

/// Full course detail — `GET /courses/:idOrSlug` → `data`.
@freezed
class CourseDetailDto with _$CourseDetailDto {
  const CourseDetailDto._();

  const factory CourseDetailDto({
    required String id,
    @LocalizedTextConverter() required LocalizedText title,
    String? slug,
    @LocalizedTextConverter() @Default(LocalizedText.empty) LocalizedText subtitle,
    @LocalizedTextConverter() @Default(LocalizedText.empty) LocalizedText description,
    String? thumbnail,
    String? promoVideoUrl,
    @Default(0) double price,
    @Default('INR') String currency,
    @Default('BEGINNER') String level,
    @Default('ENGLISH') String language,
    int? moduleNumber,
    int? weeksDuration,
    int? totalLectures,
    @Default(false) bool isFree,
    String? scriptureRef,
    CourseInstructorDto? instructor,
    @Default(<SectionDto>[]) List<SectionDto> sections,
    @Default(0) double avgRating,
    @Default(0) int reviewCount,
    @Default(0) int enrollmentCount,
    @Default(false) bool isEnrolled,
  }) = _CourseDetailDto;

  factory CourseDetailDto.fromJson(Map<String, dynamic> json) =>
      _$CourseDetailDtoFromJson(json);

  int get lessonCount =>
      sections.fold(0, (sum, s) => sum + s.lessons.length);

  /// Total duration across lessons, in seconds.
  int get totalDurationSeconds =>
      sections.fold(0, (sum, s) => sum + s.lessons.fold(0, (a, l) => a + l.duration));
}

@freezed
class SectionDto with _$SectionDto {
  const factory SectionDto({
    required String id,
    @LocalizedTextConverter() @Default(LocalizedText.empty) LocalizedText title,
    @Default(0) int order,
    @Default(<LessonDto>[]) List<LessonDto> lessons,
    @Default(<ReadingMaterialDto>[]) List<ReadingMaterialDto> readingMaterials,
  }) = _SectionDto;
  factory SectionDto.fromJson(Map<String, dynamic> json) =>
      _$SectionDtoFromJson(json);
}

@freezed
class LessonDto with _$LessonDto {
  const LessonDto._();

  const factory LessonDto({
    required String id,
    @LocalizedTextConverter() @Default(LocalizedText.empty) LocalizedText title,
    @Default('VIDEO') String type,
    @Default(0) int duration,
    @Default(0) int order,
    @Default(false) bool isFree,
    @Default(false) bool isPreview,
    String? bunnyVideoId,
    String? videoUrl,
    Object? content,
  }) = _LessonDto;

  factory LessonDto.fromJson(Map<String, dynamic> json) =>
      _$LessonDtoFromJson(json);

  /// Playable/openable without enrollment.
  bool get isAccessiblePreview => isFree || isPreview;
}

@freezed
class ReadingMaterialDto with _$ReadingMaterialDto {
  const factory ReadingMaterialDto({
    required String id,
    @LocalizedTextConverter() @Default(LocalizedText.empty) LocalizedText title,
    String? fileUrl,
    @Default(0) int order,
  }) = _ReadingMaterialDto;
  factory ReadingMaterialDto.fromJson(Map<String, dynamic> json) =>
      _$ReadingMaterialDtoFromJson(json);
}

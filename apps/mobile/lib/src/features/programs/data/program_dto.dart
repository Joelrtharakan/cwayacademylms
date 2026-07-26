class ProgramCourseDto {
  const ProgramCourseDto({
    required this.id,
    required this.title,
    this.description = '',
    this.courseCode,
    this.weeksDuration,
    this.level = 'BEGINNER',
    this.sectionsCount = 0,
  });

  final String id;
  final String title;
  final String description;
  final String? courseCode;
  final int? weeksDuration;
  final String level;
  final int sectionsCount;

  factory ProgramCourseDto.fromJson(Map<String, dynamic> json) {
    String parsedTitle = 'Course';
    final titleRaw = json['title'];
    if (titleRaw is String) {
      parsedTitle = titleRaw;
    } else if (titleRaw is Map<String, dynamic>) {
      parsedTitle = titleRaw['en'] as String? ?? titleRaw['title'] as String? ?? 'Course';
    }

    String parsedDesc = '';
    final descRaw = json['description'];
    if (descRaw is String) {
      parsedDesc = descRaw;
    } else if (descRaw is Map<String, dynamic>) {
      parsedDesc = descRaw['en'] as String? ?? '';
    }

    final countMap = json['_count'] as Map<String, dynamic>?;

    return ProgramCourseDto(
      id: json['id'] as String? ?? '',
      title: parsedTitle,
      description: parsedDesc,
      courseCode: json['courseCode'] as String?,
      weeksDuration: json['weeksDuration'] as int?,
      level: json['level'] as String? ?? 'BEGINNER',
      sectionsCount: countMap?['sections'] as int? ?? 0,
    );
  }
}

class ProgramDto {
  const ProgramDto({
    required this.id,
    required this.title,
    this.description = '',
    this.bannerImage,
    this.applicationsClosed = false,
    this.courseCount = 0,
    this.durationMonths = 0,
    this.courses = const [],
  });

  final String id;
  final String title;
  final String description;
  final String? bannerImage;
  final bool applicationsClosed;
  final int courseCount;
  final int durationMonths;
  final List<ProgramCourseDto> courses;

  factory ProgramDto.fromJson(Map<String, dynamic> json) {
    String parsedTitle = 'Academic Program';
    final titleRaw = json['title'];
    if (titleRaw is String) {
      parsedTitle = titleRaw;
    } else if (titleRaw is Map<String, dynamic>) {
      parsedTitle = titleRaw['en'] as String? ?? titleRaw['title'] as String? ?? 'Academic Program';
    }

    String parsedDesc = '';
    final descRaw = json['description'];
    if (descRaw is String) {
      parsedDesc = descRaw;
    } else if (descRaw is Map<String, dynamic>) {
      parsedDesc = descRaw['en'] as String? ?? '';
    }

    List<ProgramCourseDto> parsedCourses = [];
    if (json['courses'] is List) {
      parsedCourses = (json['courses'] as List)
          .whereType<Map<String, dynamic>>()
          .map(ProgramCourseDto.fromJson)
          .toList();
    }

    return ProgramDto(
      id: json['id'] as String? ?? '',
      title: parsedTitle,
      description: parsedDesc,
      bannerImage: json['bannerImage'] as String?,
      applicationsClosed: json['applicationsClosed'] as bool? ?? false,
      courseCount: (json['_count'] as Map<String, dynamic>?)?['courses'] as int? ??
          parsedCourses.length,
      durationMonths: json['durationMonths'] as int? ?? 0,
      courses: parsedCourses,
    );
  }
}

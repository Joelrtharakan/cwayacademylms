/// A student enrolled in one of the instructor's courses, with their progress.
/// Flattened from `GET /instructor/courses/:id/students`.
class EnrolledStudentDto {
  const EnrolledStudentDto({
    required this.enrollmentId,
    required this.studentName,
    required this.progress,
    required this.status,
    this.studentAvatar,
    this.studentEmail,
    this.enrolledAt,
    this.lastCompletedTitle,
  });

  final String enrollmentId;
  final String studentName;
  final double progress;
  final String status;
  final String? studentAvatar;
  final String? studentEmail;
  final DateTime? enrolledAt;
  final String? lastCompletedTitle;

  bool get isCompleted => status == 'COMPLETED';

  factory EnrolledStudentDto.fromJson(Map<String, dynamic> json) {
    final student = json['student'] as Map<String, dynamic>? ?? const {};
    final last = json['lastCompleted'] as Map<String, dynamic>?;
    return EnrolledStudentDto(
      enrollmentId: json['id'] as String,
      studentName: student['name'] as String? ?? 'Student',
      studentAvatar: student['avatar'] as String?,
      studentEmail: student['email'] as String?,
      progress: (json['progress'] as num?)?.toDouble() ?? 0,
      status: json['status'] as String? ?? 'ACTIVE',
      enrolledAt: json['enrolledAt'] != null
          ? DateTime.tryParse(json['enrolledAt'].toString())
          : null,
      lastCompletedTitle: last?['title']?.toString(),
    );
  }
}

/// Aggregate analytics for a course — `GET /instructor/courses/:id/analytics`.
class CourseAnalyticsDto {
  const CourseAnalyticsDto({
    required this.notStarted,
    required this.inProgress,
    required this.completed,
    required this.enrollmentsOverTime,
    required this.lessonCompletion,
  });

  final int notStarted;
  final int inProgress;
  final int completed;
  final List<MonthlyCount> enrollmentsOverTime;
  final List<LessonCompletion> lessonCompletion;

  int get totalStudents => notStarted + inProgress + completed;

  factory CourseAnalyticsDto.fromJson(Map<String, dynamic> json) {
    final progress = json['studentProgress'] as Map<String, dynamic>? ?? const {};
    final overTime = json['enrollmentsOverTime'] as List? ?? const [];
    final lessons = json['lessonCompletionRates'] as List? ?? const [];
    return CourseAnalyticsDto(
      notStarted: (progress['notStarted'] as num?)?.toInt() ?? 0,
      inProgress: (progress['inProgress'] as num?)?.toInt() ?? 0,
      completed: (progress['completed'] as num?)?.toInt() ?? 0,
      enrollmentsOverTime: overTime
          .whereType<Map<String, dynamic>>()
          .map(MonthlyCount.fromJson)
          .toList(),
      lessonCompletion: lessons
          .whereType<Map<String, dynamic>>()
          .map(LessonCompletion.fromJson)
          .toList(),
    );
  }
}

class MonthlyCount {
  const MonthlyCount({required this.month, required this.count});
  final String month;
  final int count;
  factory MonthlyCount.fromJson(Map<String, dynamic> json) => MonthlyCount(
        month: json['month']?.toString() ?? '',
        count: (json['count'] as num?)?.toInt() ?? 0,
      );
}

class LessonCompletion {
  const LessonCompletion({required this.title, required this.rate});
  final String title;
  final double rate;
  factory LessonCompletion.fromJson(Map<String, dynamic> json) {
    // lessonTitle is a localized JSON blob; take a readable string.
    final t = json['lessonTitle'];
    final title = t is Map
        ? (t['en'] ?? (t.values.isNotEmpty ? t.values.first : 'Lesson'))
            .toString()
        : (t?.toString() ?? 'Lesson');
    return LessonCompletion(
      title: title,
      rate: (json['completionRate'] as num?)?.toDouble() ?? 0,
    );
  }
}

import '../../../core/localization/localized_text.dart';

/// A student's assignment submission as seen by an instructor grading it.
/// Flattened from the backend's nested `submission → assignment → lesson →
/// section → course` include so the UI stays simple.
class SubmissionDto {
  const SubmissionDto({
    required this.id,
    required this.assignmentId,
    required this.maxScore,
    required this.assignmentTitle,
    required this.courseTitle,
    required this.studentName,
    required this.isGraded,
    this.studentAvatar,
    this.studentEmail,
    this.studentChurch,
    this.content,
    this.fileUrl,
    this.submittedAt,
    this.grade,
    this.feedback,
  });

  final String id;
  final String assignmentId;
  final int maxScore;
  final LocalizedText assignmentTitle;
  final LocalizedText courseTitle;
  final String studentName;
  final bool isGraded;
  final String? studentAvatar;
  final String? studentEmail;
  final String? studentChurch;
  final String? content;
  final String? fileUrl;
  final DateTime? submittedAt;
  final double? grade;
  final String? feedback;

  bool get hasAttachment => fileUrl != null && fileUrl!.startsWith('http');

  factory SubmissionDto.fromJson(Map<String, dynamic> json) {
    final student = json['student'] as Map<String, dynamic>? ?? const {};
    final assignment = json['assignment'] as Map<String, dynamic>? ?? const {};
    final course = ((assignment['lesson'] as Map<String, dynamic>?)?['section']
            as Map<String, dynamic>?)?['course'] as Map<String, dynamic>?;

    return SubmissionDto(
      id: json['id'] as String,
      assignmentId: json['assignmentId'] as String? ?? '',
      maxScore: (assignment['maxScore'] as num?)?.toInt() ?? 100,
      assignmentTitle: LocalizedText.fromJson(assignment['title']),
      courseTitle: LocalizedText.fromJson(course?['title']),
      studentName: student['name'] as String? ?? 'Student',
      studentAvatar: student['avatar'] as String?,
      studentEmail: student['email'] as String?,
      studentChurch: student['church'] as String?,
      isGraded: json['isGraded'] as bool? ?? false,
      content: json['content'] as String?,
      fileUrl: json['fileUrl'] as String?,
      submittedAt: json['submittedAt'] != null
          ? DateTime.tryParse(json['submittedAt'].toString())
          : null,
      grade: (json['grade'] as num?)?.toDouble(),
      feedback: json['feedback'] as String?,
    );
  }
}

/// A student's forum discussion response as seen by an instructor grading it
/// (`GET /forums/instructor/discussions`).
class InstructorDiscussionDto {
  const InstructorDiscussionDto({
    required this.id,
    required this.content,
    required this.authorName,
    required this.courseTitle,
    required this.lessonTitle,
    required this.maxScore,
    this.score,
    this.feedback,
    this.createdAt,
  });

  final String id;
  final String content;
  final String authorName;
  final LocalizedText courseTitle;
  final LocalizedText lessonTitle;
  final int maxScore;
  final double? score;
  final String? feedback;
  final DateTime? createdAt;

  bool get isGraded => score != null;

  factory InstructorDiscussionDto.fromJson(Map<String, dynamic> json) {
    final author = json['author'] as Map<String, dynamic>? ?? const {};
    final course = json['course'] as Map<String, dynamic>? ?? const {};
    final lesson = json['lesson'] as Map<String, dynamic>? ?? const {};

    return InstructorDiscussionDto(
      id: json['id'] as String,
      content: json['content'] as String? ?? '',
      authorName: author['name'] as String? ?? 'Student',
      courseTitle: LocalizedText.fromJson(course['title']),
      lessonTitle: LocalizedText.fromJson(lesson['title']),
      maxScore: (lesson['forumMarks'] as num?)?.toInt() ?? 100,
      score: (json['score'] as num?)?.toDouble(),
      feedback: json['feedback'] as String?,
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? ''),
    );
  }
}

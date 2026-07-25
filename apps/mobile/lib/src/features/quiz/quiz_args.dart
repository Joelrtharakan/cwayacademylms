import 'package:flutter/foundation.dart';

/// Navigation payload for the quiz screen. When [enrollmentId] + [lessonId] are
/// present, passing the quiz marks the owning lesson complete and refreshes the
/// dashboard/curriculum. Passed as GoRouter `extra`.
@immutable
class QuizArgs {
  const QuizArgs({this.courseId, this.lessonId, this.enrollmentId});

  final String? courseId;
  final String? lessonId;
  final String? enrollmentId;

  bool get canCompleteLesson =>
      enrollmentId != null && lessonId != null && courseId != null;
}

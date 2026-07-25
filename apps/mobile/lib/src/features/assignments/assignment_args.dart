import 'package:flutter/foundation.dart';

import '../../core/localization/localized_text.dart';

/// Navigation payload for the assignment detail. Carries the assignment display
/// info (so instructions render even before any submission exists) plus lesson
/// context used to sync completion. Passed as GoRouter `extra`.
@immutable
class AssignmentArgs {
  const AssignmentArgs({
    this.title,
    this.description,
    this.dueDate,
    this.maxScore,
    this.attachmentUrl,
    this.courseId,
    this.lessonId,
    this.enrollmentId,
  });

  final LocalizedText? title;
  final LocalizedText? description;
  final DateTime? dueDate;
  final int? maxScore;
  final String? attachmentUrl;
  final String? courseId;
  final String? lessonId;
  final String? enrollmentId;

  bool get canCompleteLesson =>
      enrollmentId != null && lessonId != null && courseId != null;
}

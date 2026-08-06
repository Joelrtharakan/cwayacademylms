/// Navigation arguments for the forum screen, passed via GoRouter `extra`.
class ForumArgs {
  const ForumArgs({
    this.title,
    this.prompt,
    this.courseId,
    this.enrollmentId,
  });

  final String? title;

  /// The instructor's discussion question/prompt (the lesson's content).
  final String? prompt;

  /// Course + enrollment context — present when opened from the lesson player,
  /// enabling "mark complete on post" and "continue to next lesson".
  final String? courseId;
  final String? enrollmentId;

  bool get canComplete =>
      (courseId?.isNotEmpty ?? false) && (enrollmentId?.isNotEmpty ?? false);
}

/// A student's personal note on a lesson. The backend enforces one note per
/// (student, lesson) pair, so this is effectively a single editable pad per
/// lesson, optionally anchored to a video timestamp.
class NoteDto {
  const NoteDto({
    required this.id,
    required this.lessonId,
    required this.content,
    this.timestamp,
    this.updatedAt,
  });

  final String id;
  final String lessonId;
  final String content;

  /// Video position in seconds this note was taken at, if any.
  final int? timestamp;
  final DateTime? updatedAt;

  factory NoteDto.fromJson(Map<String, dynamic> json) {
    return NoteDto(
      id: json['id'] as String,
      lessonId: json['lessonId'] as String? ?? '',
      content: json['content'] as String? ?? '',
      timestamp: (json['timestamp'] as num?)?.toInt(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'].toString())
          : null,
    );
  }
}

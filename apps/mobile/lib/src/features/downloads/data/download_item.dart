import 'package:flutter/foundation.dart';

import '../../../core/localization/localized_text.dart';

/// A course the user saved for offline access. Persisted as an entry in the
/// durable JSON cache (`downloads:index`).
@immutable
class DownloadItem {
  const DownloadItem({
    required this.courseId,
    required this.title,
    this.thumbnail,
    this.savedAt,
  });

  final String courseId;
  final LocalizedText title;
  final String? thumbnail;
  final DateTime? savedAt;

  Map<String, dynamic> toMap() => {
        'courseId': courseId,
        'title': title.values,
        'thumbnail': thumbnail,
        'savedAt': savedAt?.toIso8601String(),
      };

  factory DownloadItem.fromMap(Map<String, dynamic> map) => DownloadItem(
        courseId: map['courseId'] as String,
        title: LocalizedText.fromJson(map['title']),
        thumbnail: map['thumbnail'] as String?,
        savedAt: map['savedAt'] is String
            ? DateTime.tryParse(map['savedAt'] as String)
            : null,
      );
}

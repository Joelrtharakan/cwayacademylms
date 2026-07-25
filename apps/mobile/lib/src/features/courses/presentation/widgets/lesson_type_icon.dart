import 'package:flutter/material.dart';

/// Maps a backend lesson `type` string to a representative icon.
IconData lessonTypeIcon(String type) {
  switch (type.toUpperCase()) {
    case 'VIDEO':
      return Icons.play_circle_outline_rounded;
    case 'QUIZ':
      return Icons.quiz_outlined;
    case 'ASSIGNMENT':
      return Icons.assignment_outlined;
    case 'READING':
    case 'TEXT':
      return Icons.menu_book_rounded;
    case 'FORUM':
      return Icons.forum_outlined;
    case 'LIVE':
      return Icons.sensors_rounded;
    default:
      return Icons.article_outlined;
  }
}

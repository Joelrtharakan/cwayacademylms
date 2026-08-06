/// Plain DTOs for the per-lesson forum (`GET /forums/lessons/:lessonId`).
class ForumAuthor {
  const ForumAuthor({required this.id, required this.name, required this.role});

  final String id;
  final String name;
  final String role;

  factory ForumAuthor.fromJson(Map<String, dynamic> j) => ForumAuthor(
        id: j['id']?.toString() ?? '',
        name: (j['name']?.toString().trim().isNotEmpty ?? false)
            ? j['name'].toString()
            : 'Member',
        role: (j['role']?.toString() ?? 'STUDENT').toUpperCase(),
      );

  String get initials {
    final parts =
        name.trim().split(RegExp(r'\s+')).where((p) => p.isNotEmpty).toList();
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts.first.substring(0, 1).toUpperCase();
    return (parts.first.substring(0, 1) + parts.last.substring(0, 1))
        .toUpperCase();
  }
}

class ForumReply {
  const ForumReply({
    required this.id,
    required this.content,
    this.author,
    this.createdAt,
  });

  final String id;
  final String content;
  final ForumAuthor? author;
  final DateTime? createdAt;

  factory ForumReply.fromJson(Map<String, dynamic> j) => ForumReply(
        id: j['id']?.toString() ?? '',
        content: j['content']?.toString() ?? '',
        author: j['author'] is Map<String, dynamic>
            ? ForumAuthor.fromJson(j['author'] as Map<String, dynamic>)
            : null,
        createdAt: DateTime.tryParse(j['createdAt']?.toString() ?? ''),
      );
}

class ForumDiscussion {
  const ForumDiscussion({
    required this.id,
    required this.title,
    required this.content,
    required this.replies,
    this.author,
    this.createdAt,
  });

  final String id;
  final String title;
  final String content;
  final ForumAuthor? author;
  final DateTime? createdAt;
  final List<ForumReply> replies;

  factory ForumDiscussion.fromJson(Map<String, dynamic> j) => ForumDiscussion(
        id: j['id']?.toString() ?? '',
        title: j['title']?.toString() ?? '',
        content: j['content']?.toString() ?? '',
        author: j['author'] is Map<String, dynamic>
            ? ForumAuthor.fromJson(j['author'] as Map<String, dynamic>)
            : null,
        createdAt: DateTime.tryParse(j['createdAt']?.toString() ?? ''),
        replies: (j['replies'] is List)
            ? (j['replies'] as List)
                .whereType<Map<String, dynamic>>()
                .map(ForumReply.fromJson)
                .toList()
            : const [],
      );
}

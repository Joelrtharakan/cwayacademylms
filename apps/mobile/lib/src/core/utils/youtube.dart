/// Extracts a YouTube video id from the many URL shapes an instructor might
/// paste into `lesson.videoUrl`. Mirrors the regex used on the website so both
/// clients resolve the same id.
///
/// Handles: watch?v=, youtu.be/, /embed/, /shorts/, /v/, /u/x/ and bare ids.
String? extractYouTubeId(String? url) {
  if (url == null) return null;
  final input = url.trim();
  if (input.isEmpty) return null;

  final match = RegExp(
    r'(?:youtu\.be/|/v/|/u/\w/|/embed/|watch\?v=|&v=|/shorts/|/live/)([^#&?]+)',
  ).firstMatch(input);

  final id = match?.group(1);
  if (id != null && _looksLikeId(id)) return id;

  // A bare 11-character id.
  if (_looksLikeId(input)) return input;
  return null;
}

bool _looksLikeId(String s) => RegExp(r'^[A-Za-z0-9_-]{11}$').hasMatch(s);

/// True when the URL is a YouTube link (vs. some other embed/CDN URL).
bool isYouTubeUrl(String? url) {
  if (url == null) return false;
  final u = url.toLowerCase();
  return u.contains('youtu.be') || u.contains('youtube.com');
}

import 'package:cway_academy/src/core/utils/youtube.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('extractYouTubeId handles common URL shapes', () {
    expect(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
        'dQw4w9WgXcQ',);
    expect(extractYouTubeId('https://youtu.be/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
    expect(extractYouTubeId('dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
    expect(extractYouTubeId('not a video'), isNull);
  });
}

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:youtube_player_iframe/youtube_player_iframe.dart';

/// YouTube player widget for lessons. Displays a sleek video preview card initially.
/// Tapping Play Video lazy-initializes the embedded player and streams the video
/// directly in-place inside the 16:9 container on the lesson screen.
class YouTubeLessonPlayer extends StatefulWidget {
  const YouTubeLessonPlayer({
    super.key,
    required this.videoId,
    required this.startSeconds,
    required this.onPositionSecond,
  });

  final String videoId;
  final int startSeconds;
  final ValueChanged<int> onPositionSecond;

  @override
  State<YouTubeLessonPlayer> createState() => _YouTubeLessonPlayerState();
}

class _YouTubeLessonPlayerState extends State<YouTubeLessonPlayer> {
  YoutubePlayerController? _controller;
  Timer? _ticker;
  bool _isPlayingInline = false;

  void _onPlayTapped() {
    setState(() {
      _controller = YoutubePlayerController.fromVideoId(
        videoId: widget.videoId,
        autoPlay: true,
        startSeconds: widget.startSeconds > 0 ? widget.startSeconds.toDouble() : null,
        params: const YoutubePlayerParams(
          showControls: true,
          showFullscreenButton: true,
          enableCaption: true,
        ),
      );
      _isPlayingInline = true;
    });
    _ticker = Timer.periodic(const Duration(seconds: 5), (_) => _report());
  }

  Future<void> _report() async {
    final controller = _controller;
    if (controller == null) return;
    try {
      final seconds = await controller.currentTime;
      if (seconds > 0 && mounted) widget.onPositionSecond(seconds.floor());
    } on Object {
      // Player not ready yet / disposed — ignore this tick.
    }
  }

  @override
  void dispose() {
    _ticker?.cancel();
    _controller?.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!_isPlayingInline || _controller == null) {
      final thumbnailUrl =
          'https://img.youtube.com/vi/${widget.videoId}/hqdefault.jpg';
      return AspectRatio(
        aspectRatio: 16 / 9,
        child: Container(
          decoration: const BoxDecoration(color: Color(0xFF0F172A)),
          child: Stack(
            fit: StackFit.expand,
            children: [
              Image.network(
                thumbnailUrl,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  color: const Color(0xFF1E293B),
                  child: const Center(
                    child: Icon(
                      Icons.video_library_rounded,
                      size: 48,
                      color: Colors.white54,
                    ),
                  ),
                ),
              ),
              Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.black.withValues(alpha: 0.2),
                      Colors.black.withValues(alpha: 0.6),
                    ],
                  ),
                ),
              ),
              Center(
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: _onPlayTapped,
                    borderRadius: BorderRadius.circular(50),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 14,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFF0000),
                        borderRadius: BorderRadius.circular(50),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.red.withValues(alpha: 0.4),
                            blurRadius: 16,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.play_arrow_rounded,
                            color: Colors.white,
                            size: 32,
                          ),
                          SizedBox(width: 8),
                          Text(
                            'Play Video',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                              fontSize: 16,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return AspectRatio(
      aspectRatio: 16 / 9,
      child: Container(
        color: const Color(0xFF0F172A),
        child: YoutubePlayer(
          controller: _controller!,
          aspectRatio: 16 / 9,
        ),
      ),
    );
  }
}

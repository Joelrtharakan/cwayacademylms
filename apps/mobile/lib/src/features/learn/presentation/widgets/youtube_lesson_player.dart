import 'dart:async';

import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

/// 100% In-App YouTube lesson player with instant sub-second load performance.
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
  late final WebViewController _controller;
  bool _isPlaying = false;

  @override
  void initState() {
    super.initState();
    _initPlayer();
  }

  void _initPlayer() {
    final htmlContent = '''
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; background: #0F172A; overflow: hidden; display: flex; align-items: center; justify-content: center; }
    #player { width: 100%; height: 100%; border: 0; outline: none; opacity: 0; transition: opacity 0.4s ease-in-out; }
    #player.playing { opacity: 1 !important; }
  </style>
</head>
<body>
  <div id="player"></div>
  <script>
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    var player;
    function onYouTubeIframeAPIReady() {
      player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        videoId: '${widget.videoId}',
        playerVars: {
          'autoplay': 1,
          'mute': 1,
          'controls': 1,
          'playsinline': 1,
          'rel': 0,
          'enablejsapi': 1,
          'start': 0,
          'origin': 'https://www.youtube-nocookie.com'
        },
        events: {
          'onReady': function(e) {
            e.target.mute();
            e.target.playVideo();
          },
          'onStateChange': function(e) {
            if (e.data === 1 || e.data === YT.PlayerState.PLAYING) {
              document.getElementById('player').classList.add('playing');
              if (window.FlutterPlayerChannel) {
                window.FlutterPlayerChannel.postMessage('PLAYING');
              }
              setTimeout(function() { e.target.unMute(); }, 200);
            }
          }
        }
      });
    }
  </script>
</body>
</html>
''';

    late final PlatformWebViewControllerCreationParams params;
    if (WebViewPlatform.instance is AndroidWebViewPlatform) {
      params = AndroidWebViewControllerCreationParams();
    } else {
      params = const PlatformWebViewControllerCreationParams();
    }

    final webController = WebViewController.fromPlatformCreationParams(params);
    unawaited(webController.setJavaScriptMode(JavaScriptMode.unrestricted));
    unawaited(webController.setUserAgent(
      'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    ));
    unawaited(webController.setBackgroundColor(const Color(0xFF0F172A)));

    if (webController.platform is AndroidWebViewController) {
      unawaited((webController.platform as AndroidWebViewController)
          .setMediaPlaybackRequiresUserGesture(false));
    }

    unawaited(webController.addJavaScriptChannel(
      'FlutterPlayerChannel',
      onMessageReceived: (JavaScriptMessage message) {
        if (message.message == 'PLAYING' && mounted) {
          setState(() => _isPlaying = true);
        }
      },
    ));

    unawaited(webController.loadHtmlString(
      htmlContent,
      baseUrl: 'https://www.youtube-nocookie.com',
    ));

    _controller = webController;
  }

  @override
  Widget build(BuildContext context) {
    Widget playerWidget;
    if (WebViewPlatform.instance is AndroidWebViewPlatform) {
      playerWidget = WebViewWidget.fromPlatformCreationParams(
        params: AndroidWebViewWidgetCreationParams(
          controller: _controller.platform,
          displayWithHybridComposition: true,
        ),
      );
    } else {
      playerWidget = WebViewWidget(controller: _controller);
    }

    final thumbnailUrl = 'https://img.youtube.com/vi/${widget.videoId}/hqdefault.jpg';

    return AspectRatio(
      aspectRatio: 16 / 9,
      child: ColoredBox(
        color: const Color(0xFF0F172A),
        child: Stack(
          fit: StackFit.expand,
          children: [
            playerWidget,
            IgnorePointer(
              ignoring: _isPlaying,
              child: AnimatedOpacity(
                opacity: _isPlaying ? 0.0 : 1.0,
                duration: const Duration(milliseconds: 200),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Image.network(
                      thumbnailUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => const ColoredBox(color: Color(0xFF0F172A)),
                    ),
                    const ColoredBox(color: Colors.black38),
                    const Center(
                      child: CircularProgressIndicator(color: Color(0xFFE8B85A)),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

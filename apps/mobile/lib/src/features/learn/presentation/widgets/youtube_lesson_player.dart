import 'dart:async';

import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

/// 100% In-App YouTube lesson player.
///
/// Starts automatically from 0:00 directly on screen inside the 16:9 container box.
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
  bool _isLoadingPage = true;

  @override
  void initState() {
    super.initState();
    _initPlayer();
  }

  void _initPlayer() {
    final embedUrl =
        'https://www.youtube-nocookie.com/embed/${widget.videoId}?autoplay=1&mute=0&controls=1&playsinline=1&rel=0&start=0';

    final htmlContent = '''
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; background: #0F172A; overflow: hidden; display: flex; align-items: center; justify-content: center; }
    iframe { width: 100%; height: 100%; border: 0; outline: none; }
  </style>
</head>
<body>
  <iframe 
    src="$embedUrl" 
    allow="autoplay; encrypted-media; picture-in-picture; accelerometer; gyroscope" 
    allowfullscreen>
  </iframe>
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

    unawaited(webController.setNavigationDelegate(
      NavigationDelegate(
        onPageFinished: (_) {
          Future.delayed(const Duration(milliseconds: 600), () {
            if (mounted) setState(() => _isLoadingPage = false);
          });
        },
      ),
    ));

    if (webController.platform is AndroidWebViewController) {
      unawaited((webController.platform as AndroidWebViewController)
          .setMediaPlaybackRequiresUserGesture(false));
    }

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
              ignoring: !_isLoadingPage,
              child: AnimatedOpacity(
                opacity: _isLoadingPage ? 1.0 : 0.0,
                duration: const Duration(milliseconds: 300),
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

import 'dart:io' show Platform;

import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';

import '../../core/i18n/i18n_extension.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimens.dart';

/// Views a remote file (submission, attachment, resource) inside the app:
/// images render natively (zoomable); PDFs/other docs load in an embedded
/// WebView. Falls back to opening in the browser if rendering fails.
class FileViewerScreen extends StatefulWidget {
  const FileViewerScreen({super.key, required this.url, this.title});

  final String url;
  final String? title;

  static bool _isImage(String url) {
    final u = Uri.tryParse(url)?.path.toLowerCase() ?? url.toLowerCase();
    return u.endsWith('.png') ||
        u.endsWith('.jpg') ||
        u.endsWith('.jpeg') ||
        u.endsWith('.gif') ||
        u.endsWith('.webp') ||
        u.endsWith('.bmp');
  }

  static bool _isPdf(String url) =>
      (Uri.tryParse(url)?.path.toLowerCase() ?? url.toLowerCase())
          .endsWith('.pdf');

  @override
  State<FileViewerScreen> createState() => _FileViewerScreenState();
}

class _FileViewerScreenState extends State<FileViewerScreen> {
  WebViewController? _controller;
  bool _loading = true;
  bool _failed = false;

  bool get _isImage => FileViewerScreen._isImage(widget.url);

  @override
  void initState() {
    super.initState();
    if (!_isImage) {
      // Android's WebView can't render PDFs inline; route those through Google's
      // embedded viewer. iOS (WKWebView) renders PDFs natively, so load direct.
      final needsGView = FileViewerScreen._isPdf(widget.url) && Platform.isAndroid;
      final viewerUrl = needsGView
          ? 'https://docs.google.com/gview?embedded=1&url=${Uri.encodeComponent(widget.url)}'
          : widget.url;
      _controller = WebViewController()
        ..setJavaScriptMode(JavaScriptMode.unrestricted)
        ..setNavigationDelegate(
          NavigationDelegate(
            onPageStarted: (_) {
              if (mounted) setState(() => _loading = true);
            },
            onPageFinished: (_) {
              if (mounted) setState(() => _loading = false);
            },
            onWebResourceError: (error) {
              if (mounted && (error.isForMainFrame ?? true)) {
                setState(() => _failed = true);
              }
            },
          ),
        )
        ..loadRequest(Uri.parse(viewerUrl));
    }
  }

  Future<void> _openInBrowser() async {
    final uri = Uri.tryParse(widget.url);
    if (uri != null) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;

    return Scaffold(
      backgroundColor: _isImage ? Colors.black : colors.background,
      appBar: AppBar(
        title: Text(widget.title ?? context.tr('mobile.assignments.viewFile')),
        actions: [
          IconButton(
            tooltip: context.tr('mobile.welcome.openInBrowser'),
            icon: const Icon(Icons.open_in_new_rounded),
            onPressed: _openInBrowser,
          ),
        ],
      ),
      body: _isImage ? _buildImage(colors) : _buildWeb(colors),
    );
  }

  Widget _buildImage(AppColors colors) {
    return InteractiveViewer(
      minScale: 1,
      maxScale: 5,
      child: Center(
        child: Image.network(
          widget.url,
          fit: BoxFit.contain,
          loadingBuilder: (context, child, progress) => progress == null
              ? child
              : const Center(child: CircularProgressIndicator()),
          errorBuilder: (_, __, ___) => _FailedView(onOpenBrowser: _openInBrowser),
        ),
      ),
    );
  }

  Widget _buildWeb(AppColors colors) {
    if (_failed || _controller == null) {
      return _FailedView(onOpenBrowser: _openInBrowser);
    }
    return Stack(
      children: [
        WebViewWidget(controller: _controller!),
        if (_loading) const LinearProgressIndicator(minHeight: 2),
      ],
    );
  }
}

class _FailedView extends StatelessWidget {
  const _FailedView({required this.onOpenBrowser});
  final VoidCallback onOpenBrowser;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.insert_drive_file_outlined,
                size: 44, color: colors.textMuted,),
            const SizedBox(height: AppSpacing.md),
            Text(
              context.tr('mobile.welcome.applyFailedTitle'),
              style: text.titleMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.lg),
            FilledButton.icon(
              onPressed: onOpenBrowser,
              icon: const Icon(Icons.open_in_new_rounded),
              label: Text(context.tr('mobile.welcome.openInBrowser')),
            ),
          ],
        ),
      ),
    );
  }
}

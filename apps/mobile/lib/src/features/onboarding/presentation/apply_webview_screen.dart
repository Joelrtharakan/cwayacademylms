import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';

import '../../../core/i18n/i18n_extension.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';

/// Opens the website application page inside an in-app WebView. The application
/// process stays entirely on the website — this only hosts it. If the WebView
/// fails to load, the user is offered the system browser instead. Closing
/// returns to the previous screen (the Welcome screen).
class ApplyWebViewScreen extends StatefulWidget {
  const ApplyWebViewScreen({super.key, required this.url, this.title});

  final String url;
  final String? title;

  @override
  State<ApplyWebViewScreen> createState() => _ApplyWebViewScreenState();
}

class _ApplyWebViewScreenState extends State<ApplyWebViewScreen> {
  late final WebViewController _controller;
  bool _loading = true;
  bool _failed = false;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) {
            if (mounted) {
              setState(() {
                _loading = true;
                _failed = false;
              });
            }
          },
          onPageFinished: (_) {
            if (mounted) setState(() => _loading = false);
          },
          onWebResourceError: (error) {
            // Only surface a full failure when the main document itself fails to
            // load. Sub-resource errors (favicon, third-party scripts) must not
            // replace an otherwise-working page with the error screen.
            if (mounted && (error.isForMainFrame ?? true)) {
              setState(() => _failed = true);
            }
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.url));
  }

  Future<void> _openInBrowser() async {
    final uri = Uri.parse(widget.url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
    if (mounted) await Navigator.of(context).maybePop();
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: colors.forestDeep,
        foregroundColor: Colors.white,
        systemOverlayStyle: SystemUiOverlayStyle.light,
        flexibleSpace: DecoratedBox(
          decoration: BoxDecoration(gradient: colors.forestGradient),
        ),
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          tooltip: context.tr('mobile.common.close'),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
        title: Text(
          widget.title ?? context.tr('mobile.welcome.applyTitle'),
          style: Theme.of(context)
              .textTheme
              .titleLarge
              ?.copyWith(color: Colors.white),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.open_in_new_rounded),
            tooltip: context.tr('mobile.welcome.openInBrowser'),
            onPressed: _openInBrowser,
          ),
        ],
      ),
      body: _failed
          ? _FailedState(onOpenBrowser: _openInBrowser)
          : Stack(
              children: [
                WebViewWidget(controller: _controller),
                if (_loading)
                  const LinearProgressIndicator(minHeight: 2),
              ],
            ),
    );
  }
}

class _FailedState extends StatelessWidget {
  const _FailedState({required this.onOpenBrowser});
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
            Icon(Icons.public_off_rounded, size: 44, color: colors.textMuted),
            const SizedBox(height: AppSpacing.md),
            Text(context.tr('mobile.welcome.applyFailedTitle'),
                style: text.titleMedium, textAlign: TextAlign.center,),
            const SizedBox(height: AppSpacing.sm),
            Text(
              context.tr('mobile.welcome.applyFailedMessage'),
              style: text.bodyMedium?.copyWith(color: colors.textSecondary),
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

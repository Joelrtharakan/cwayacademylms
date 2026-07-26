import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:package_info_plus/package_info_plus.dart';

import '../../../core/i18n/i18n_extension.dart';
import '../../../core/router/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';
import '../application/locale_controller.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  /// Native autonyms for each language, shared across all locales via
  /// `mobile.languages.{code}` (e.g. always "हिन्दी" for Hindi).
  String _languageName(BuildContext context, String code) =>
      context.tr('mobile.languages.$code');

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = context.colors;
    final locale = ref.watch(localeControllerProvider);
    final currentLabel = locale == null
        ? context.tr('mobile.settings.systemDefault')
        : _languageName(context, locale.languageCode);

    return Scaffold(
      appBar: AppBar(title: Text(context.tr('mobile.settings.title'))),
      body: ListView(
        children: [
          _Header(title: context.tr('mobile.settings.language')),
          ListTile(
            leading: Icon(Icons.translate_rounded, color: colors.forestLight),
            title: Text(context.tr('mobile.settings.language')),
            subtitle: Text(currentLabel),
            trailing: const Icon(Icons.chevron_right_rounded),
            onTap: () => _pickLanguage(context, ref),
          ),
          const Divider(height: 1),
          _Header(title: context.tr('mobile.settings.account')),
          ListTile(
            leading: Icon(Icons.lock_outline_rounded, color: colors.forestLight),
            title: Text(context.tr('mobile.settings.changePassword')),
            trailing: const Icon(Icons.chevron_right_rounded),
            onTap: () => context.push(AppRoutes.changePassword),
          ),
          const Divider(height: 1),
          _Header(title: context.tr('mobile.settings.about')),
          FutureBuilder<PackageInfo>(
            future: PackageInfo.fromPlatform(),
            builder: (context, snap) {
              final v = snap.hasData
                  ? '${snap.data!.version} (${snap.data!.buildNumber})'
                  : '—';
              return ListTile(
                leading: Icon(Icons.info_outline_rounded, color: colors.forestLight),
                title: Text(context.tr('mobile.settings.version')),
                subtitle: Text(v),
              );
            },
          ),
        ].animate(interval: 50.ms).fade(duration: 300.ms).slideY(begin: 0.1, duration: 300.ms, curve: Curves.easeOutQuad),
      ),
    );
  }

  Future<void> _pickLanguage(BuildContext context, WidgetRef ref) async {
    final current = ref.read(localeControllerProvider)?.languageCode;
    await showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (ctx) => SafeArea(
        child: RadioGroup<String?>(
          groupValue: current,
          onChanged: (value) {
            ref.read(localeControllerProvider.notifier).setLanguage(value);
            Navigator.pop(ctx);
          },
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              RadioListTile<String?>(
                value: null,
                title: Text(context.tr('mobile.settings.systemDefault')),
              ),
              for (final code in supportedLanguageCodes)
                RadioListTile<String?>(
                  value: code,
                  title: Text(_languageName(ctx, code)),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.title});
  final String title;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    return Padding(
      padding: const EdgeInsets.fromLTRB(
          AppSpacing.lg, AppSpacing.lg, AppSpacing.lg, AppSpacing.sm,),
      child: Text(
        title.toUpperCase(),
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: colors.textMuted,
              letterSpacing: 1,
            ),
      ),
    );
  }
}

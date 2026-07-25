import 'package:cway_academy/l10n/app_localizations.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:package_info_plus/package_info_plus.dart';

import '../../../core/router/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';
import '../application/locale_controller.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  String _languageName(AppLocalizations l, String code) => switch (code) {
        'hi' => l.languageHindi,
        'ta' => l.languageTamil,
        'te' => l.languageTelugu,
        'kn' => l.languageKannada,
        'ml' => l.languageMalayalam,
        _ => l.languageEnglish,
      };

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppLocalizations.of(context);
    final colors = context.colors;
    final locale = ref.watch(localeControllerProvider);
    final currentLabel =
        locale == null ? l.systemDefault : _languageName(l, locale.languageCode);

    return Scaffold(
      appBar: AppBar(title: Text(l.settings)),
      body: ListView(
        children: [
          _Header(title: l.language),
          ListTile(
            leading: Icon(Icons.translate_rounded, color: colors.forestLight),
            title: Text(l.language),
            subtitle: Text(currentLabel),
            trailing: const Icon(Icons.chevron_right_rounded),
            onTap: () => _pickLanguage(context, ref, l),
          ),
          const Divider(height: 1),
          _Header(title: l.account),
          ListTile(
            leading: Icon(Icons.lock_outline_rounded, color: colors.forestLight),
            title: Text(l.changePassword),
            trailing: const Icon(Icons.chevron_right_rounded),
            onTap: () => context.push(AppRoutes.changePassword),
          ),
          const Divider(height: 1),
          _Header(title: l.about),
          FutureBuilder<PackageInfo>(
            future: PackageInfo.fromPlatform(),
            builder: (context, snap) {
              final v = snap.hasData
                  ? '${snap.data!.version} (${snap.data!.buildNumber})'
                  : '—';
              return ListTile(
                leading: Icon(Icons.info_outline_rounded, color: colors.forestLight),
                title: Text(l.version),
                subtitle: Text(v),
              );
            },
          ),
        ].animate(interval: 50.ms).fade(duration: 300.ms).slideY(begin: 0.1, duration: 300.ms, curve: Curves.easeOutQuad),
      ),
    );
  }

  Future<void> _pickLanguage(
    BuildContext context,
    WidgetRef ref,
    AppLocalizations l,
  ) async {
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
                title: Text(l.systemDefault),
              ),
              for (final code in supportedLanguageCodes)
                RadioListTile<String?>(
                  value: code,
                  title: Text(_languageName(l, code)),
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

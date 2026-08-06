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

  Future<void> _pickLanguage(BuildContext context, WidgetRef ref) =>
      showLanguageSelector(context, ref);
}

/// The reference "Select Language" modal: a titled sheet listing each language
/// with a gold check on the active one. Shared so the header/settings open the
/// same picker. Preserves the existing [localeControllerProvider] logic.
Future<void> showLanguageSelector(BuildContext context, WidgetRef ref) async {
  final current = ref.read(localeControllerProvider)?.languageCode;
  await showModalBottomSheet<void>(
    context: context,
    showDragHandle: false,
    isScrollControlled: true,
    backgroundColor: context.colors.surface,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadii.xl)),
    ),
    builder: (ctx) {
      final text = Theme.of(ctx).textTheme;
      void select(String? code) {
        ref.read(localeControllerProvider.notifier).setLanguage(code);
        Navigator.pop(ctx);
      }

      return SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(
              AppSpacing.xl, AppSpacing.lg, AppSpacing.sm, AppSpacing.md,),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(ctx.tr('mobile.settings.language'),
                        style: text.titleLarge,),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              for (final code in supportedLanguageCodes)
                _LanguageRow(
                  label: ctx.tr('mobile.languages.$code'),
                  selected: current == code,
                  onTap: () => select(code),
                ),
            ],
          ),
        ),
      );
    },
  );
}

class _LanguageRow extends StatelessWidget {
  const _LanguageRow({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    return InkWell(
      onTap: onTap,
      borderRadius: AppRadii.rMd,
      child: Padding(
        padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.sm, vertical: AppSpacing.md,),
        child: Row(
          children: [
            Expanded(
              child: Text(
                label,
                style: text.bodyLarge?.copyWith(
                  fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
                  color: selected ? colors.textPrimary : colors.textSecondary,
                ),
              ),
            ),
            if (selected)
              Icon(Icons.check_circle_rounded, color: colors.goldPrimary, size: 22),
          ],
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

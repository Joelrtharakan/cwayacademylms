import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/i18n/app_translations.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'features/settings/application/locale_controller.dart';
import 'features/settings/application/theme_controller.dart';

/// Root widget. Wires the router, light/dark themes, and localization delegates.
/// Full ARB message catalogs (en/hi/ta/te/kn/ml) are added in the Multilingual
/// module; the supported-locales list is declared up-front.
class CwayApp extends ConsumerStatefulWidget {
  const CwayApp({super.key});

  @override
  ConsumerState<CwayApp> createState() => _CwayAppState();
}

class _CwayAppState extends ConsumerState<CwayApp> {
  @override
  void reassemble() {
    super.reassemble();
    // Hot reload only re-runs build methods, not bootstrap — so newly-added
    // i18n keys would show as raw keys until a full restart. In debug, re-read
    // the catalogs on every hot reload so translations stay fresh.
    if (kDebugMode) {
      AppTranslations.reload().then((_) {
        if (mounted) setState(() {});
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(routerProvider);
    final themeMode = ref.watch(themeModeControllerProvider);
    final locale = ref.watch(localeControllerProvider);

    return MaterialApp.router(
      title: 'CWAY Academy',
      debugShowCheckedModeBanner: false,
      routerConfig: router,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      themeMode: themeMode,
      locale: locale,
      supportedLocales: kSupportedLocales.map(Locale.new),
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      builder: (context, child) {
        // Keep the context-free translation locale in sync with the resolved
        // app locale (this builder runs beneath MaterialApp's Localizations).
        AppTranslations.currentLocale = Localizations.localeOf(context).languageCode;

        // Clamp system text scaling to keep premium layouts intact while still
        // honoring Dynamic Type up to a sensible ceiling (accessibility).
        final mq = MediaQuery.of(context);
        final clamped = mq.textScaler.clamp(minScaleFactor: 1.0, maxScaleFactor: 1.4);
        return MediaQuery(
          data: mq.copyWith(textScaler: clamped),
          child: child!,
        );
      },
    );
  }
}

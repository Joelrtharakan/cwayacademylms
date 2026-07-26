import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'app.dart';
import 'core/i18n/app_translations.dart';
import 'core/network/auth_session.dart';
import 'core/network/dio_client.dart';
import 'core/offline/json_cache.dart';
import 'core/storage/preferences.dart';
import 'core/storage/token_storage.dart';
import 'shared/widgets/app_error_widget.dart';

/// Composition root. Performs the async initialization that providers depend on
/// (preferences, secure storage, cookie jar, Dio, session restore) and injects
/// them as provider overrides so the widget tree stays synchronous and testable.
Future<void> bootstrap() async {
  await runZonedGuarded(_run, (error, stack) {
    // Last-resort handler for uncaught async errors. Wire a crash reporter
    // (e.g. Sentry/Crashlytics) here in production.
    debugPrint('Uncaught zone error: $error\n$stack');
  });
}

Future<void> _run() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Route Flutter framework errors through the same path; show a friendly
  // fallback instead of the red screen in release builds.
  FlutterError.onError = (details) {
    FlutterError.presentError(details);
  };
  if (kReleaseMode) {
    ErrorWidget.builder = (details) => AppErrorWidget(details: details);
  }

  // Bound the in-memory image cache (default is ~100MB / 1000 entries).
  PaintingBinding.instance.imageCache
    ..maximumSizeBytes = 120 << 20
    ..maximumSize = 400;

  // Pre-load every locale's translation catalog so `context.tr(...)` is fully
  // synchronous for the whole widget tree and the first frame is already
  // localized (no flash of raw keys).
  await AppTranslations.loadAll();

  final prefs = await SharedPreferences.getInstance();
  final secureStorage = buildSecureStorage();

  final session = AuthSession(TokenStorage(secureStorage));
  await session.restore();

  final network = await buildDio(session);

  await Hive.initFlutter();
  final cacheBox = await Hive.openBox<String>('cway_cache');
  // Best-effort startup cleanup of stale, unpinned cache entries.
  unawaited(JsonCache(cacheBox).evictStale());

  runApp(
    ProviderScope(
      overrides: [
        sharedPreferencesProvider.overrideWithValue(prefs),
        secureStorageProvider.overrideWithValue(secureStorage),
        authSessionProvider.overrideWithValue(session),
        dioProvider.overrideWithValue(network.dio),
        cookieJarProvider.overrideWithValue(network.jar),
        cacheBoxProvider.overrideWithValue(cacheBox),
      ],
      child: const CwayApp(),
    ),
  );
}

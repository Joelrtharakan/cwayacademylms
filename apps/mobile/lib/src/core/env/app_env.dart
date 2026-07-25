/// Compile-time environment configuration.
///
/// Values are injected with `--dart-define` so no secrets live in source, e.g.:
///   flutter run --dart-define=FLAVOR=dev
///   flutter build apk --dart-define=FLAVOR=prod --dart-define=API_BASE_URL=https://api.cwayacademy.com/api/v1
///
/// The backend is the single source of truth; the app only ever *consumes* it.
library;

import 'package:flutter/foundation.dart';

enum AppFlavor { dev, staging, prod }

class AppEnv {
  const AppEnv._();

  static const String _flavorRaw =
      String.fromEnvironment('FLAVOR', defaultValue: 'dev');

  static AppFlavor get flavor => switch (_flavorRaw) {
        'prod' => AppFlavor.prod,
        'staging' => AppFlavor.staging,
        _ => AppFlavor.dev,
      };

  static bool get isProd => flavor == AppFlavor.prod;

  /// Host used to reach a locally-running backend in dev.
  ///
  /// Android emulators alias the host machine as 10.0.2.2 (not localhost).
  /// Every other target — iOS simulator, macOS/Windows/Linux desktop, web —
  /// reaches it as localhost.
  static String get _devHost {
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      return '10.0.2.2';
    }
    return 'localhost';
  }

  /// API base URL. Defaults are per-flavor; overridable via --dart-define.
  static String get apiBaseUrl {
    const override = String.fromEnvironment('API_BASE_URL');
    if (override.isNotEmpty) return override;
    return switch (flavor) {
      AppFlavor.prod => 'https://api.cwayacademy.com/api/v1',
      AppFlavor.staging => 'https://staging-api.cwayacademy.com/api/v1',
      AppFlavor.dev => 'http://$_devHost:4000/api/v1',
    };
  }

  /// Public site origin — used for share links, certificate URLs, deep links.
  static String get webBaseUrl {
    const override = String.fromEnvironment('WEB_BASE_URL');
    if (override.isNotEmpty) return override;
    return isProd ? 'https://www.cwayacademy.com' : 'http://$_devHost:3000';
  }

  static const Duration connectTimeout = Duration(seconds: 20);
  static const Duration receiveTimeout = Duration(seconds: 30);

  static bool get enableNetworkLogs =>
      const bool.fromEnvironment('ENABLE_LOGS', defaultValue: false);

  /// Optional TLS certificate pinning. Provide comma-separated SHA-256
  /// fingerprints (of the leaf cert DER) via
  ///   --dart-define=CERT_PINS=aabb...,ccdd...
  /// Empty (default) = standard system trust. When set, only matching certs
  /// are accepted — see [buildDio].
  static List<String> get pinnedCertSha256 {
    const raw = String.fromEnvironment('CERT_PINS');
    if (raw.isEmpty) return const [];
    return raw
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .where((s) => s.isNotEmpty)
        .toList();
  }
}

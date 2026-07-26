import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart' show rootBundle;

/// The app's languages. Codes match the web `messages/{locale}` folders, the
/// ARB-era scaffold, and the backend enum. Kept here (rather than in the
/// settings feature) so the i18n layer has no upward dependency.
const kSupportedLocales = ['en', 'hi', 'ta', 'te', 'kn', 'ml'];

/// Fallback language used whenever a key (or an entire locale) is missing.
const kFallbackLocale = 'en';

/// Web namespaces bundled under `assets/i18n/{locale}/`, plus the mobile-only
/// `mobile` catalog for strings with no website equivalent.
const _namespaces = [
  'common',
  'auth',
  'public',
  'admin',
  'instructor',
  'student',
  'landing',
  'mobile',
];

/// In-memory store of every locale's merged translation catalog, mirroring the
/// website's next-intl JSON. Keys are dot-notation paths into the namespaced
/// tree, e.g. `student.dashboard.kpi.enrolled`, `auth.login.title`,
/// `mobile.splash.tagline`. Interpolation uses `{param}` placeholders, exactly
/// like next-intl (the catalogs use no ICU plural/select).
///
/// [loadAll] is awaited once during bootstrap so lookups are synchronous for
/// the entire widget tree — `context.tr(...)` never has to deal with a future.
class AppTranslations {
  AppTranslations._();

  /// locale code -> merged `{ namespace: {...nested...} }` map.
  static final Map<String, Map<String, dynamic>> _catalogs = {};

  static bool get isLoaded => _catalogs.isNotEmpty;

  /// The active language code, kept in sync by the app root. Lets context-free
  /// code (form validators, controllers, background error messages) localize via
  /// [tg] without a [BuildContext].
  static String currentLocale = kFallbackLocale;

  /// Context-free translation using [currentLocale]. Prefer `context.tr(...)` in
  /// widgets (it reacts to locale changes); use this only where no context is
  /// available.
  static String tg(String key, [Map<String, Object?> params = const {}]) =>
      translate(currentLocale, key, params);

  /// Loads and caches all supported locales from the bundled assets. Missing
  /// namespace files are tolerated (e.g. a locale lacking `mobile.json` early
  /// on) — resolution falls back to English at lookup time.
  static Future<void> loadAll() async {
    for (final locale in kSupportedLocales) {
      _catalogs[locale] = await _loadLocale(locale);
    }
  }

  static Future<Map<String, dynamic>> _loadLocale(String locale) async {
    final merged = <String, dynamic>{};
    for (final ns in _namespaces) {
      try {
        final raw = await rootBundle.loadString('assets/i18n/$locale/$ns.json');
        merged[ns] = json.decode(raw) as Map<String, dynamic>;
      } catch (_) {
        // Namespace not present for this locale; ignore and fall back later.
      }
    }
    return merged;
  }

  /// Resolves [key] for [locale], interpolating [params]. Resolution order:
  /// requested locale → English → the raw key (so a bug is visible, never a
  /// blank). Interpolates `{name}` style placeholders from [params].
  static String translate(
    String locale,
    String key, [
    Map<String, Object?> params = const {},
  ]) {
    final value = _lookup(locale, key) ?? _lookup(kFallbackLocale, key);
    if (value == null) {
      if (kDebugMode) debugPrint('[i18n] missing key: $key ($locale)');
      return key;
    }
    return _interpolate(value, params);
  }

  static String? _lookup(String locale, String key) {
    final catalog = _catalogs[locale];
    if (catalog == null) return null;
    dynamic node = catalog;
    for (final segment in key.split('.')) {
      if (node is Map && node.containsKey(segment)) {
        node = node[segment];
      } else {
        return null;
      }
    }
    if (node is String) return node;
    // A non-leaf key was requested (points at a sub-tree) — not a usable string.
    return null;
  }

  static final _placeholder = RegExp(r'\{(\w+)\}');
  // The web keeps a single inline-HTML value (auth.register.check_email_desc);
  // strip tags so mobile renders clean text.
  static final _htmlTag = RegExp(r'<[^>]+>');

  static String _interpolate(String template, Map<String, Object?> params) {
    var out = template;
    if (out.contains('<')) out = out.replaceAll(_htmlTag, '');
    if (params.isEmpty) return out;
    return out.replaceAllMapped(_placeholder, (m) {
      final name = m.group(1)!;
      return params.containsKey(name) ? '${params[name]}' : m.group(0)!;
    });
  }
}

import 'package:flutter/widgets.dart';

import 'app_translations.dart';

/// Ergonomic access to the shared translation catalog from any widget.
///
/// `context.tr('student.courses.title')` resolves against the *active* app
/// locale. It reads the locale via [Localizations.localeOf], which registers an
/// inherited dependency — so every widget that calls `tr` rebuilds automatically
/// the instant the language changes (no manual listeners, no restart).
extension I18nContext on BuildContext {
  /// Translates [key] (dot-notation into the namespaced catalog), interpolating
  /// `{param}` placeholders from [params]. Falls back to English, then to the
  /// raw key if truly missing.
  String tr(String key, [Map<String, Object?> params = const {}]) {
    final locale = Localizations.localeOf(this).languageCode;
    return AppTranslations.translate(locale, key, params);
  }
}

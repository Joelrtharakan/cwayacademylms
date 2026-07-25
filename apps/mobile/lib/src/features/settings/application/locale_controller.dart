import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/storage/preferences.dart';
import '../../auth/application/auth_controller.dart';

/// The app's languages. Codes match the ARB locales and the backend enum
/// (via [AppUser.localeCode]).
const supportedLanguageCodes = ['en', 'hi', 'ta', 'te', 'kn', 'ml'];

/// Owns the active [Locale]. Resolution order:
///   explicit saved choice → the signed-in user's preferredLanguage → system.
///
/// Language is persisted locally (the backend exposes no update-language
/// endpoint); it initializes from the user's registration preference on login.
/// Changing it instantly re-resolves all backend `LocalizedText` content too.
class LocaleController extends Notifier<Locale?> {
  static const _key = 'settings.locale';

  @override
  Locale? build() {
    final saved = ref.watch(sharedPreferencesProvider).getString(_key);
    if (saved != null && saved.isNotEmpty) return Locale(saved);
    final user = ref.watch(currentUserProvider);
    if (user != null && supportedLanguageCodes.contains(user.localeCode)) {
      return Locale(user.localeCode);
    }
    return null; // follow the system locale
  }

  /// [code] null clears the override (follow system).
  Future<void> setLanguage(String? code) async {
    final prefs = ref.read(sharedPreferencesProvider);
    if (code == null) {
      await prefs.remove(_key);
    } else {
      await prefs.setString(_key, code);
    }
    ref.invalidateSelf();
  }
}

final localeControllerProvider =
    NotifierProvider<LocaleController, Locale?>(LocaleController.new);

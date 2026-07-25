import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:local_auth/local_auth.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../storage/preferences.dart';

/// Wraps platform biometrics (Face ID / Touch ID / fingerprint) and persists the
/// user's opt-in. Used to lock an already-authenticated session behind a local
/// biometric gate — the JWT never leaves secure storage.
class BiometricService {
  BiometricService(this._prefs, [LocalAuthentication? auth])
      : _auth = auth ?? LocalAuthentication();

  final SharedPreferences _prefs;
  final LocalAuthentication _auth;

  static const _enabledKey = 'settings.biometric_enabled';

  bool get isEnabled => _prefs.getBool(_enabledKey) ?? false;

  Future<bool> isAvailable() async {
    try {
      final supported = await _auth.isDeviceSupported();
      final canCheck = await _auth.canCheckBiometrics;
      return supported && canCheck;
    } on Exception {
      return false;
    }
  }

  /// Prompts the OS biometric sheet. Returns true only on a successful match.
  Future<bool> authenticate({
    String reason = 'Unlock CWAY Academy',
  }) async {
    try {
      return await _auth.authenticate(
        localizedReason: reason,
        options: const AuthenticationOptions(
          biometricOnly: false, // allow device PIN as fallback
          stickyAuth: true,
        ),
      );
    } on Exception {
      return false;
    }
  }

  Future<void> setEnabled(bool value) => _prefs.setBool(_enabledKey, value);
}

final biometricServiceProvider = Provider<BiometricService>((ref) {
  return BiometricService(ref.watch(sharedPreferencesProvider));
});

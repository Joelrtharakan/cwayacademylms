/// Secure storage for the short-lived JWT access token.
///
/// The long-lived refresh token is delivered by the API as an httpOnly cookie
/// (`cway_refresh`) and is persisted by the Dio cookie jar — never handled here.
/// This keeps the mobile client byte-for-byte compatible with the web auth flow.
library;
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class TokenStorage {
  TokenStorage(this._storage);

  final FlutterSecureStorage _storage;

  static const _kAccessToken = 'cway.access_token';

  Future<String?> readAccessToken() async {
    if (!kIsWeb && Platform.isMacOS && kDebugMode) {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getString(_kAccessToken);
    }
    return _storage.read(key: _kAccessToken);
  }

  Future<void> writeAccessToken(String token) async {
    if (!kIsWeb && Platform.isMacOS && kDebugMode) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_kAccessToken, token);
      return;
    }
    return _storage.write(key: _kAccessToken, value: token);
  }

  Future<void> clear() async {
    if (!kIsWeb && Platform.isMacOS && kDebugMode) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_kAccessToken);
      return;
    }
    return _storage.delete(key: _kAccessToken);
  }
}

/// Single source of truth for secure-storage options (used by both the provider
/// and the pre-runApp bootstrap path).
FlutterSecureStorage buildSecureStorage() => const FlutterSecureStorage(
      aOptions: AndroidOptions(encryptedSharedPreferences: true),
      iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
    );

final secureStorageProvider =
    Provider<FlutterSecureStorage>((ref) => buildSecureStorage());

final tokenStorageProvider = Provider<TokenStorage>((ref) {
  return TokenStorage(ref.watch(secureStorageProvider));
});


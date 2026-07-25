import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../storage/token_storage.dart';

/// In-memory holder for the current access token plus a persistence bridge.
///
/// The Dio auth interceptor reads the token synchronously from here (network
/// interceptors cannot await), while writes are mirrored to secure storage so
/// the session survives cold starts. A broadcast stream lets the router react
/// when the session is forcibly ended (refresh failed / server revoked).
class AuthSession {
  AuthSession(this._storage);

  final TokenStorage _storage;
  final _expiredController = StreamController<void>.broadcast();

  String? _accessToken;
  String? get accessToken => _accessToken;
  bool get hasToken => _accessToken != null && _accessToken!.isNotEmpty;

  /// Emits whenever the session ends unexpectedly (not on explicit logout).
  Stream<void> get onExpired => _expiredController.stream;

  /// Loads any persisted token into memory. Called once during bootstrap.
  Future<void> restore() async {
    _accessToken = await _storage.readAccessToken();
  }

  Future<void> setAccessToken(String token) async {
    _accessToken = token;
    await _storage.writeAccessToken(token);
  }

  /// Clears local session state. [notify] fires the expiry stream (used when the
  /// server rejects our credentials); explicit user logout passes false.
  Future<void> clear({bool notify = false}) async {
    _accessToken = null;
    await _storage.clear();
    if (notify && !_expiredController.isClosed) {
      _expiredController.add(null);
    }
  }

  void dispose() => _expiredController.close();
}

final authSessionProvider = Provider<AuthSession>((ref) {
  final session = AuthSession(ref.watch(tokenStorageProvider));
  ref.onDispose(session.dispose);
  return session;
});

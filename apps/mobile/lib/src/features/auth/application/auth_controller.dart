import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../core/network/auth_session.dart';
import '../../../core/security/biometric_service.dart';
import '../data/auth_repository_impl.dart';
import '../domain/app_user.dart';

part 'auth_controller.freezed.dart';

/// The app-wide session status the router reacts to.
@freezed
class AuthStatus with _$AuthStatus {
  const AuthStatus._();

  const factory AuthStatus.unauthenticated() = _Unauthenticated;
  const factory AuthStatus.authenticated(AppUser user) = _Authenticated;

  /// Valid session that is gated behind a biometric unlock (cold start).
  const factory AuthStatus.locked(AppUser user) = _Locked;

  AppUser? get userOrNull => switch (this) {
        _Authenticated(:final user) => user,
        _Locked(:final user) => user,
        _ => null,
      };

  bool get isAuthenticated => this is _Authenticated;
  bool get isLocked => this is _Locked;
}

/// Coordinates login/register/logout, session restoration and the biometric gate.
/// Login errors are thrown to the caller (screens show inline feedback) rather
/// than flipping the whole app into a loading state.
class AuthController extends AsyncNotifier<AuthStatus> {
  @override
  Future<AuthStatus> build() async {
    final session = ref.watch(authSessionProvider);

    // React to forced session expiry (refresh failed / revoked server-side).
    final sub = session.onExpired.listen((_) {
      state = const AsyncData(AuthStatus.unauthenticated());
    });
    ref.onDispose(sub.cancel);

    if (!session.hasToken) return const AuthStatus.unauthenticated();

    final user = await ref.read(authRepositoryProvider).currentUser();
    if (user == null) return const AuthStatus.unauthenticated();

    final biometric = ref.read(biometricServiceProvider);
    if (biometric.isEnabled && await biometric.isAvailable()) {
      return AuthStatus.locked(user);
    }
    return AuthStatus.authenticated(user);
  }

  Future<void> signIn({required String email, required String password}) async {
    final user = await ref
        .read(authRepositoryProvider)
        .login(email: email, password: password);
    state = AsyncData(AuthStatus.authenticated(user));
  }

  Future<String> register({
    required String name,
    required String email,
    required String password,
    String? church,
    String? location,
    String preferredLanguage = 'ENGLISH',
  }) {
    return ref.read(authRepositoryProvider).register(
          name: name,
          email: email,
          password: password,
          church: church,
          location: location,
          preferredLanguage: preferredLanguage,
        );
  }

  Future<String> forgotPassword(String email) =>
      ref.read(authRepositoryProvider).forgotPassword(email);

  /// Re-fetches `/me` and updates the session — call after profile/avatar edits
  /// so the new data propagates app-wide (dashboard, profile, account chips).
  Future<void> refreshUser() async {
    final user = await ref.read(authRepositoryProvider).currentUser();
    if (user != null) state = AsyncData(AuthStatus.authenticated(user));
  }

  /// Called by the lock screen after a successful biometric match.
  Future<bool> unlock() async {
    final current = state.valueOrNull;
    if (current is! _Locked) return true;
    final ok = await ref.read(biometricServiceProvider).authenticate();
    if (ok) state = AsyncData(AuthStatus.authenticated(current.user));
    return ok;
  }

  Future<void> signOut() async {
    await ref.read(authRepositoryProvider).logout();
    state = const AsyncData(AuthStatus.unauthenticated());
  }
}

final authControllerProvider =
    AsyncNotifierProvider<AuthController, AuthStatus>(AuthController.new);

/// Convenience selector for the current user across the app.
final currentUserProvider = Provider<AppUser?>((ref) {
  return ref.watch(authControllerProvider).valueOrNull?.userOrNull;
});

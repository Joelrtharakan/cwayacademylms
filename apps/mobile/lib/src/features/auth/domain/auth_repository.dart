import 'app_user.dart';

/// Contract for authentication against the CWAY backend. The implementation is
/// the only place that knows about Dio/endpoints — keeping the domain pure.
abstract interface class AuthRepository {
  /// Authenticates, persists the access token + refresh cookie, and returns the
  /// full profile (fetched from `/me`). Throws [ApiException] on failure.
  Future<AppUser> login({required String email, required String password});

  /// Registers a new account. Does **not** sign in — the backend requires email
  /// verification first. Returns the server message.
  Future<String> register({
    required String name,
    required String email,
    required String password,
    String? church,
    String? location,
    String preferredLanguage,
  });

  /// Loads the current user from `/me`; returns null if unauthenticated.
  Future<AppUser?> currentUser();

  /// Requests a password-reset email. Always succeeds (no account enumeration).
  Future<String> forgotPassword(String email);

  /// Changes the signed-in user's password.
  Future<void> updatePassword({
    required String currentPassword,
    required String newPassword,
  });

  /// Revokes the server session, clears the access token and refresh cookie.
  Future<void> logout();
}

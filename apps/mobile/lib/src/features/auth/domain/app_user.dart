import 'package:freezed_annotation/freezed_annotation.dart';

part 'app_user.freezed.dart';
part 'app_user.g.dart';

/// Authenticated user, mirroring the payload of `GET /auth/me`.
/// Roles and languages are plain strings in the backend (not enums).
@freezed
class AppUser with _$AppUser {
  const AppUser._();

  const factory AppUser({
    required String id,
    required String name,
    required String email,
    @Default('STUDENT') String role,
    String? avatar,
    String? bio,
    String? phone,
    String? church,
    String? location,
    String? title,
    String? credentials,
    int? yearsExperience,
    @Default('ENGLISH') String preferredLanguage,
    @Default(false) bool isVerified,
    DateTime? createdAt,
  }) = _AppUser;

  factory AppUser.fromJson(Map<String, dynamic> json) => _$AppUserFromJson(json);

  bool get isStudent => role == 'STUDENT';
  bool get isInstructor => role == 'INSTRUCTOR';
  bool get isAdmin => role == 'ADMIN';

  /// Maps the backend language enum ("ENGLISH") to a Flutter locale code ("en").
  String get localeCode => switch (preferredLanguage.toUpperCase()) {
        'HINDI' => 'hi',
        'TAMIL' => 'ta',
        'TELUGU' => 'te',
        'KANNADA' => 'kn',
        'MALAYALAM' => 'ml',
        _ => 'en',
      };

  String get initials {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty || parts.first.isEmpty) return '?';
    if (parts.length == 1) return parts.first[0].toUpperCase();
    return (parts.first[0] + parts.last[0]).toUpperCase();
  }
}

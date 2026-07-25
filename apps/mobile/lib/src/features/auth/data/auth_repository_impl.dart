import 'package:cookie_jar/cookie_jar.dart';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/network/auth_session.dart';
import '../../../core/network/dio_client.dart';
import '../domain/app_user.dart';
import '../domain/auth_repository.dart';

class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl({
    required Dio dio,
    required AuthSession session,
    required CookieJar cookieJar,
  })  : _dio = dio,
        _session = session,
        _cookieJar = cookieJar;

  final Dio _dio;
  final AuthSession _session;
  final CookieJar _cookieJar;

  @override
  Future<AppUser> login({
    required String email,
    required String password,
  }) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>(
        '/auth/login',
        data: {'email': email.trim(), 'password': password},
      );
      final token = res.data?['accessToken'] as String?;
      if (token == null || token.isEmpty) {
        throw const ApiException(message: 'Login failed: no token returned.');
      }
      await _session.setAccessToken(token);

      // Login returns a slim user; fetch the full profile as the source of truth.
      final me = await currentUser();
      if (me == null) {
        throw const ApiException(message: 'Could not load your profile.');
      }
      return me;
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  @override
  Future<AppUser?> currentUser() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/auth/me');
      final user = res.data?['user'];
      if (user is Map<String, dynamic>) return AppUser.fromJson(user);
      return null;
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) return null;
      throw ApiException.fromDio(e);
    }
  }

  @override
  Future<String> register({
    required String name,
    required String email,
    required String password,
    String? church,
    String? location,
    String preferredLanguage = 'ENGLISH',
  }) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>(
        '/auth/register',
        data: {
          'name': name.trim(),
          'email': email.trim(),
          'password': password,
          if (church != null && church.trim().isNotEmpty) 'church': church.trim(),
          if (location != null && location.trim().isNotEmpty)
            'location': location.trim(),
          'preferredLanguage': preferredLanguage,
        },
      );
      final data = res.data?['data'];
      if (data is Map && data['message'] is String) return data['message'] as String;
      return 'Account created successfully';
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  @override
  Future<String> forgotPassword(String email) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>(
        '/auth/forgot-password',
        data: {'email': email.trim()},
      );
      final data = res.data?['data'];
      if (data is Map && data['message'] is String) return data['message'] as String;
      return 'If that email exists, a reset link was sent.';
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  @override
  Future<void> updatePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      await _dio.put<Map<String, dynamic>>(
        '/auth/update-password',
        data: {'currentPassword': currentPassword, 'newPassword': newPassword},
      );
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  @override
  Future<void> logout() async {
    try {
      await _dio.post<void>('/auth/logout');
    } on DioException {
      // Even if the server call fails, clear local session below.
    } finally {
      await _session.clear();
      await _cookieJar.deleteAll();
    }
  }
}

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepositoryImpl(
    dio: ref.watch(dioProvider),
    session: ref.watch(authSessionProvider),
    cookieJar: ref.watch(cookieJarProvider),
  );
});

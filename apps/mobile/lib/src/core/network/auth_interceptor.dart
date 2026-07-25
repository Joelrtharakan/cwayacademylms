import 'package:dio/dio.dart';

import '../env/app_env.dart';
import 'auth_session.dart';

/// Attaches the bearer access token and transparently refreshes it on 401.
///
/// Mirrors the web client exactly: the access token lives in the Authorization
/// header; the refresh token is an httpOnly cookie (`cway_refresh`) that Dio's
/// cookie jar sends automatically to `POST /auth/refresh`. A single-flight lock
/// coalesces concurrent 401s into one refresh, then replays the queued requests.
class AuthInterceptor extends QueuedInterceptor {
  AuthInterceptor({
    required AuthSession session,
    required Dio refreshDio,
  })  : _session = session,
        _refreshDio = refreshDio;

  final AuthSession _session;

  /// A bare Dio (cookie jar attached, no auth interceptor) used only to hit the
  /// refresh endpoint — prevents recursive interception.
  final Dio _refreshDio;

  static const _retriedFlag = 'cway_retried';

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final token = _session.accessToken;
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    final response = err.response;
    final isAuthError = response?.statusCode == 401;
    final path = err.requestOptions.path;
    final alreadyRetried = err.requestOptions.extra[_retriedFlag] == true;
    final isRefreshCall = path.contains('/auth/refresh');

    if (!isAuthError || alreadyRetried || isRefreshCall) {
      return handler.next(err);
    }

    final newToken = await _refreshToken();
    if (newToken == null) {
      await _session.clear(notify: true);
      return handler.next(err);
    }

    try {
      final req = err.requestOptions
        ..headers['Authorization'] = 'Bearer $newToken'
        ..extra[_retriedFlag] = true;
      final retried = await _refreshDio.fetch<dynamic>(req);
      return handler.resolve(retried);
    } on DioException catch (e) {
      return handler.next(e);
    }
  }

  Future<String?> _refreshToken() async {
    try {
      final res = await _refreshDio.post<Map<String, dynamic>>(
        '${AppEnv.apiBaseUrl}/auth/refresh',
      );
      final token = res.data?['accessToken'] as String?;
      if (token == null || token.isEmpty) return null;
      await _session.setAccessToken(token);
      return token;
    } on DioException {
      return null;
    }
  }
}

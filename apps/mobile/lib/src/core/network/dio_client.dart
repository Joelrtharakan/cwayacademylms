import 'dart:io';

import 'package:cookie_jar/cookie_jar.dart';
import 'package:crypto/crypto.dart';
import 'package:dio/dio.dart';
import 'package:dio/io.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path_provider/path_provider.dart';

import '../env/app_env.dart';
import 'auth_interceptor.dart';
import 'auth_session.dart';
import 'retry_interceptor.dart';

/// Builds the configured Dio stack. Called once during bootstrap because the
/// persistent cookie jar needs an async directory lookup.
///
/// Returns the primary [Dio] and its persisted [CookieJar]. Certificate pinning
/// can be enabled by supplying an [HttpClientAdapter] with a pinned
/// SecurityContext (a hook for Production Hardening — module 15).
Future<({Dio dio, CookieJar jar})> buildDio(AuthSession session) async {
  final Directory dir = await getApplicationSupportDirectory();
  final jar = PersistCookieJar(
    ignoreExpires: false,
    storage: FileStorage('${dir.path}/.cookies/'),
  );

  final base = BaseOptions(
    baseUrl: AppEnv.apiBaseUrl,
    connectTimeout: AppEnv.connectTimeout,
    receiveTimeout: AppEnv.receiveTimeout,
    contentType: Headers.jsonContentType,
    headers: {'Accept': 'application/json'},
    // Default validation (only 2xx succeed) is intentional: 401s must throw so
    // AuthInterceptor.onError can refresh, and other 4xx map to ApiException.
  );

  // Bare client used exclusively for /auth/refresh + replaying retried requests.
  final refreshDio = Dio(base)..interceptors.add(CookieManager(jar));

  final dio = Dio(base)
    ..interceptors.add(CookieManager(jar))
    ..interceptors.add(AuthInterceptor(session: session, refreshDio: refreshDio))
    ..interceptors.add(RetryInterceptor(resendClient: refreshDio));

  if (AppEnv.enableNetworkLogs) {
    dio.interceptors.add(
      LogInterceptor(
        requestBody: true,
        responseBody: true,
        logPrint: (o) => debugPrint('[dio] $o'),
      ),
    );
  }

  _applyCertificatePinning(dio, refreshDio);

  return (dio: dio, jar: jar);
}

/// Enables TLS pinning only when [AppEnv.pinnedCertSha256] is configured, so the
/// default build is unaffected. Accepts a connection only if the leaf
/// certificate's SHA-256 fingerprint matches one of the configured pins.
void _applyCertificatePinning(Dio dio, Dio refreshDio) {
  final pins = AppEnv.pinnedCertSha256;
  if (pins.isEmpty) return;

  IOHttpClientAdapter adapter() => IOHttpClientAdapter(
        validateCertificate: (cert, host, port) {
          if (cert == null) return false;
          final fingerprint = sha256.convert(cert.der).toString().toLowerCase();
          return pins.contains(fingerprint);
        },
      );

  dio.httpClientAdapter = adapter();
  refreshDio.httpClientAdapter = adapter();
}

/// Overridden in bootstrap once the async build completes.
final dioProvider = Provider<Dio>((ref) {
  throw UnimplementedError('dioProvider must be overridden in bootstrap()');
});

/// The persisted cookie jar, exposed so logout can purge the refresh cookie.
final cookieJarProvider = Provider<CookieJar>((ref) {
  throw UnimplementedError('cookieJarProvider must be overridden in bootstrap()');
});

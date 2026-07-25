import 'package:dio/dio.dart';

/// Retries transient transport failures (timeouts / connection errors) for
/// idempotent GETs with a small exponential backoff. Non-transient errors,
/// non-GET methods, and streaming requests (SSE) are passed straight through.
///
/// Placed *after* the auth interceptor so 401s are handled by refresh, not here.
class RetryInterceptor extends Interceptor {
  RetryInterceptor({
    required Dio resendClient,
    this.maxRetries = 2,
    this.baseDelay = const Duration(milliseconds: 400),
  }) : _resend = resendClient;

  final Dio _resend;
  final int maxRetries;
  final Duration baseDelay;

  static const _attemptKey = 'cway_retry_attempt';

  bool _isTransient(DioException e) =>
      e.type == DioExceptionType.connectionTimeout ||
      e.type == DioExceptionType.sendTimeout ||
      e.type == DioExceptionType.receiveTimeout ||
      e.type == DioExceptionType.connectionError;

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    final options = err.requestOptions;
    final isGet = options.method.toUpperCase() == 'GET';
    final isStream = options.responseType == ResponseType.stream;

    if (!_isTransient(err) || !isGet || isStream) {
      return handler.next(err);
    }

    var attempt = (options.extra[_attemptKey] as int?) ?? 0;
    while (attempt < maxRetries) {
      attempt++;
      await Future<void>.delayed(baseDelay * attempt);
      try {
        options.extra[_attemptKey] = attempt;
        final response = await _resend.fetch<dynamic>(options);
        return handler.resolve(response);
      } on DioException catch (e) {
        if (attempt >= maxRetries || !_isTransient(e)) {
          return handler.next(e);
        }
        // otherwise loop and retry again
      }
    }
    return handler.next(err);
  }
}

import 'package:dio/dio.dart';

/// A normalized, user-presentable error surfaced from the API layer.
///
/// The backend responds with `{ status: "error", message: "..." }` on failure
/// (see AppError in apps/api). We map transport + payload errors into a single
/// type so the UI never has to reason about DioException internals.
class ApiException implements Exception {
  const ApiException({
    required this.message,
    this.statusCode,
    this.kind = ApiErrorKind.unknown,
  });

  final String message;
  final int? statusCode;
  final ApiErrorKind kind;

  bool get isUnauthorized => statusCode == 401;
  bool get isNetwork => kind == ApiErrorKind.network;

  factory ApiException.fromDio(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return const ApiException(
          message: 'The connection timed out. Please try again.',
          kind: ApiErrorKind.timeout,
        );
      case DioExceptionType.connectionError:
        return const ApiException(
          message: 'No internet connection. Check your network and retry.',
          kind: ApiErrorKind.network,
        );
      case DioExceptionType.badResponse:
        final status = e.response?.statusCode;
        return ApiException(
          message: _extractMessage(e.response?.data) ??
              'Something went wrong (${status ?? 'error'}).',
          statusCode: status,
          kind: ApiErrorKind.server,
        );
      case DioExceptionType.cancel:
        return const ApiException(
          message: 'Request cancelled.',
          kind: ApiErrorKind.cancelled,
        );
      case DioExceptionType.badCertificate:
      case DioExceptionType.unknown:
      default:
        return ApiException(
          message: e.message ?? 'An unexpected error occurred.',
          kind: ApiErrorKind.unknown,
        );
    }
  }

  static String? _extractMessage(dynamic data) {
    if (data is Map) {
      final msg = data['message'] ?? data['error'];
      if (msg is String && msg.trim().isNotEmpty) return msg;
    }
    if (data is String && data.trim().isNotEmpty && data.length < 300) {
      return data;
    }
    return null;
  }

  @override
  String toString() => 'ApiException($statusCode, $kind): $message';
}

enum ApiErrorKind { network, timeout, server, cancelled, unknown }

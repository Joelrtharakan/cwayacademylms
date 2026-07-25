import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path_provider/path_provider.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/network/dio_client.dart';
import 'certificate_dto.dart';

abstract interface class CertificatesRepository {
  Future<List<CertificateDto>> list();

  /// Downloads the certificate PDF bytes and writes them to a temp file,
  /// returning the local path (for sharing / opening).
  Future<String> downloadPdf({required String id, required String filename});
}

class CertificatesRepositoryImpl implements CertificatesRepository {
  CertificatesRepositoryImpl(this._dio);
  final Dio _dio;

  @override
  Future<List<CertificateDto>> list() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/student/certificates/my');
      final data = res.data?['data'];
      if (data is List) {
        return data
            .whereType<Map<String, dynamic>>()
            .map(CertificateDto.fromJson)
            .toList();
      }
      return const [];
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  @override
  Future<String> downloadPdf({
    required String id,
    required String filename,
  }) async {
    try {
      final res = await _dio.get<List<int>>(
        '/student/certificates/$id/download',
        options: Options(responseType: ResponseType.bytes),
      );
      final bytes = res.data ?? const <int>[];
      final dir = await getTemporaryDirectory();
      final safe = filename.replaceAll(RegExp(r'[^A-Za-z0-9._-]'), '-');
      final file = File('${dir.path}/$safe');
      await file.writeAsBytes(bytes, flush: true);
      return file.path;
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }
}

final certificatesRepositoryProvider = Provider<CertificatesRepository>((ref) {
  return CertificatesRepositoryImpl(ref.watch(dioProvider));
});

final myCertificatesProvider = FutureProvider<List<CertificateDto>>((ref) {
  return ref.watch(certificatesRepositoryProvider).list();
});

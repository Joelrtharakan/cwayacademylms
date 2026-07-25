import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/offline/json_cache.dart';
import 'dashboard_dto.dart';

/// Reads the aggregated student dashboard. The DTO doubles as the presentation
/// model — it is immutable and already resolves progress server-side. Responses
/// are cached so the dashboard renders offline (stale-while-offline).
abstract interface class DashboardRepository {
  Future<DashboardDto> fetch();
}

class DashboardRepositoryImpl implements DashboardRepository {
  DashboardRepositoryImpl(this._dio, this._cache);
  final Dio _dio;
  final JsonCache _cache;

  static const _key = 'dashboard';

  @override
  Future<DashboardDto> fetch() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/student/dashboard');
      final data = res.data?['data'];
      if (data is Map<String, dynamic>) {
        await _cache.put(_key, data);
        return DashboardDto.fromJson(data);
      }
      return const DashboardDto();
    } on DioException catch (e) {
      final api = ApiException.fromDio(e);
      if (api.isNetwork || api.kind == ApiErrorKind.timeout) {
        final cached = await _cache.get(_key);
        if (cached is Map<String, dynamic>) return DashboardDto.fromJson(cached);
      }
      throw api;
    }
  }
}

final dashboardRepositoryProvider = Provider<DashboardRepository>((ref) {
  return DashboardRepositoryImpl(
    ref.watch(dioProvider),
    ref.watch(jsonCacheProvider),
  );
});

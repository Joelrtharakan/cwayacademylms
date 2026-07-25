import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/network/dio_client.dart';
import 'admin_dto.dart';

/// Query parameters for the admin user directory. Equality is value-based so it
/// can key a family provider.
class AdminUserQuery {
  const AdminUserQuery({this.role, this.search});
  final String? role;
  final String? search;

  AdminUserQuery copyWith({String? Function()? role, String? search}) =>
      AdminUserQuery(
        role: role != null ? role() : this.role,
        search: search ?? this.search,
      );

  @override
  bool operator ==(Object other) =>
      other is AdminUserQuery && other.role == role && other.search == search;

  @override
  int get hashCode => Object.hash(role, search);
}

/// Admin-only endpoints. The backend gates the entire `/admin` router behind
/// `authorize("ADMIN")`; nothing here is trusted client-side.
abstract interface class AdminRepository {
  Future<AdminStatsDto> stats();
  Future<AdminUsersPageDto> users(AdminUserQuery query);
  Future<void> setBanned(String userId, {required bool banned});
}

class AdminRepositoryImpl implements AdminRepository {
  AdminRepositoryImpl(this._dio);
  final Dio _dio;

  @override
  Future<AdminStatsDto> stats() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/admin/stats');
      final data = res.data?['data'];
      if (data is Map<String, dynamic>) return AdminStatsDto.fromJson(data);
      throw const ApiException(message: 'No stats available.', statusCode: 404);
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  @override
  Future<AdminUsersPageDto> users(AdminUserQuery query) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>(
        '/admin/users',
        queryParameters: {
          'limit': 50,
          if (query.role != null) 'role': query.role,
          if (query.search != null && query.search!.isNotEmpty)
            'search': query.search,
        },
      );
      final data = res.data?['data'];
      if (data is Map<String, dynamic>) return AdminUsersPageDto.fromJson(data);
      return const AdminUsersPageDto(users: [], total: 0);
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  @override
  Future<void> setBanned(String userId, {required bool banned}) async {
    try {
      await _dio.post<Map<String, dynamic>>(
        '/admin/users/$userId/${banned ? 'ban' : 'unban'}',
      );
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }
}

final adminRepositoryProvider = Provider<AdminRepository>((ref) {
  return AdminRepositoryImpl(ref.watch(dioProvider));
});

final adminStatsProvider = FutureProvider<AdminStatsDto>((ref) {
  return ref.watch(adminRepositoryProvider).stats();
});

/// Current filter/search for the users directory.
final adminUserQueryProvider =
    StateProvider.autoDispose<AdminUserQuery>((ref) => const AdminUserQuery());

final adminUsersProvider =
    FutureProvider.autoDispose<AdminUsersPageDto>((ref) {
  final query = ref.watch(adminUserQueryProvider);
  return ref.watch(adminRepositoryProvider).users(query);
});

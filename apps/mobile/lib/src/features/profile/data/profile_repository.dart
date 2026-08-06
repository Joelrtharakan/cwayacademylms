import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/i18n/app_translations.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/network/dio_client.dart';

abstract interface class ProfileRepository {
  Future<void> updateProfile({
    String? name,
    String? bio,
    String? church,
    String? location,
    String? phone,
  });

  /// Uploads a new avatar (multipart `avatar`) and returns its URL.
  Future<String> uploadAvatar({required String filePath, String? fileName});

  /// Removes the current avatar (clears it server-side).
  Future<void> removeAvatar();
}

class ProfileRepositoryImpl implements ProfileRepository {
  ProfileRepositoryImpl(this._dio);
  final Dio _dio;

  @override
  Future<void> updateProfile({
    String? name,
    String? bio,
    String? church,
    String? location,
    String? phone,
  }) async {
    try {
      await _dio.put<Map<String, dynamic>>(
        '/users/me/profile',
        data: {
          if (name != null) 'name': name.trim(),
          if (bio != null) 'bio': bio.trim(),
          if (church != null) 'church': church.trim(),
          if (location != null) 'location': location.trim(),
          if (phone != null) 'phone': phone.trim(),
        },
      );
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  @override
  Future<String> uploadAvatar({
    required String filePath,
    String? fileName,
  }) async {
    try {
      final form = FormData.fromMap({
        'avatar': await MultipartFile.fromFile(filePath, filename: fileName),
      });
      final res = await _dio.post<Map<String, dynamic>>(
        '/users/me/upload-avatar',
        data: form,
      );
      final url = res.data?['data']?['avatarUrl'];
      if (url is String) return url;
      throw ApiException(message: AppTranslations.tg('mobile.errors.avatarUpload'));
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  @override
  Future<void> removeAvatar() async {
    try {
      await _dio.put<Map<String, dynamic>>(
        '/users/me/profile',
        data: {'avatar': null},
      );
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }
}

final profileRepositoryProvider = Provider<ProfileRepository>((ref) {
  return ProfileRepositoryImpl(ref.watch(dioProvider));
});

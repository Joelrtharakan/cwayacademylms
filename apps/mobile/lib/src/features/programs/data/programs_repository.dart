import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/network/dio_client.dart';
import 'program_dto.dart';

abstract interface class ProgramsRepository {
  Future<List<ProgramDto>> listPublicPrograms();
  Future<ProgramDto> getById(String id);
  Future<void> applyForProgram(String programId, Map<String, dynamic> formData);
}

class ProgramsRepositoryImpl implements ProgramsRepository {
  ProgramsRepositoryImpl(this._dio);
  final Dio _dio;

  @override
  Future<List<ProgramDto>> listPublicPrograms() async {
    try {
      final res = await _dio.get<dynamic>('/programs');
      dynamic rawData = res.data;
      if (rawData is Map<String, dynamic>) {
        rawData = rawData['data'];
      }
      if (rawData is List) {
        return rawData
            .whereType<Map<String, dynamic>>()
            .map(ProgramDto.fromJson)
            .toList();
      }
      return [];
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    } catch (e) {
      throw ApiException(message: e.toString());
    }
  }

  @override
  Future<ProgramDto> getById(String id) async {
    try {
      final res = await _dio.get<dynamic>('/programs/$id');
      dynamic rawData = res.data;
      if (rawData is Map<String, dynamic>) {
        rawData = rawData['data'] ?? rawData;
      }
      if (rawData is Map<String, dynamic>) {
        return ProgramDto.fromJson(rawData);
      }
      throw const ApiException(message: 'Invalid program data');
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    } catch (e) {
      throw ApiException(message: e.toString());
    }
  }

  @override
  Future<void> applyForProgram(String programId, Map<String, dynamic> formData) async {
    try {
      await _dio.post<dynamic>(
        '/programs/$programId/apply',
        data: formData,
      );
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    } catch (e) {
      throw ApiException(message: e.toString());
    }
  }
}

final programsRepositoryProvider = Provider<ProgramsRepository>((ref) {
  return ProgramsRepositoryImpl(ref.watch(dioProvider));
});

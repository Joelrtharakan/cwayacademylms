import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/network/dio_client.dart';
import 'note_dto.dart';

/// Consumes the backend note endpoints exactly as the website does. The backend
/// owns authorization (a note can only be read/edited/deleted by its author)
/// and enforces one note per (student, lesson).
abstract interface class NotesRepository {
  Future<NoteDto?> getForLesson(String lessonId);
  Future<NoteDto> create({
    required String lessonId,
    required String content,
    int? timestamp,
  });
  Future<NoteDto> update({required String id, required String content});
  Future<void> delete(String id);
}

class NotesRepositoryImpl implements NotesRepository {
  NotesRepositoryImpl(this._dio);
  final Dio _dio;

  @override
  Future<NoteDto?> getForLesson(String lessonId) async {
    try {
      final res = await _dio
          .get<Map<String, dynamic>>('/student/lessons/$lessonId/my-notes');
      final data = res.data?['data'];
      if (data is List && data.isNotEmpty) {
        return NoteDto.fromJson(data.first as Map<String, dynamic>);
      }
      return null;
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  @override
  Future<NoteDto> create({
    required String lessonId,
    required String content,
    int? timestamp,
  }) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>(
        '/student/lessons/$lessonId/notes',
        data: {'content': content, if (timestamp != null) 'timestamp': timestamp},
      );
      return NoteDto.fromJson(res.data!['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  @override
  Future<NoteDto> update({required String id, required String content}) async {
    try {
      final res = await _dio.put<Map<String, dynamic>>(
        '/student/notes/$id',
        data: {'content': content},
      );
      return NoteDto.fromJson(res.data!['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  @override
  Future<void> delete(String id) async {
    try {
      await _dio.delete<Map<String, dynamic>>('/student/notes/$id');
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }
}

final notesRepositoryProvider = Provider<NotesRepository>((ref) {
  return NotesRepositoryImpl(ref.watch(dioProvider));
});

/// The signed-in student's note for a lesson (null if none yet), keyed by
/// lessonId. Auto-disposed so switching lessons refetches.
final lessonNoteProvider =
    FutureProvider.family.autoDispose<NoteDto?, String>((ref, lessonId) {
  return ref.watch(notesRepositoryProvider).getForLesson(lessonId);
});

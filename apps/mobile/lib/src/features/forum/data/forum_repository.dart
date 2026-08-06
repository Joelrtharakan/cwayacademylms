import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/network/dio_client.dart';
import 'forum_dto.dart';

/// Per-lesson forum (discussions + replies). Mirrors the website's forum,
/// backed by `/forums/lessons/:lessonId` and `/forums/discussions/...`.
abstract interface class ForumRepository {
  Future<List<ForumDiscussion>> lessonForums(String lessonId);
  Future<void> createPost({
    required String lessonId,
    required String content,
    String? title,
  });
  Future<void> createReply({
    required String discussionId,
    required String content,
  });
}

class ForumRepositoryImpl implements ForumRepository {
  ForumRepositoryImpl(this._dio);
  final Dio _dio;

  @override
  Future<List<ForumDiscussion>> lessonForums(String lessonId) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/forums/lessons/$lessonId');
      final data = res.data?['data'];
      if (data is List) {
        return data
            .whereType<Map<String, dynamic>>()
            .map(ForumDiscussion.fromJson)
            .toList();
      }
      return const [];
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  @override
  Future<void> createPost({
    required String lessonId,
    required String content,
    String? title,
  }) async {
    try {
      await _dio.post<Map<String, dynamic>>(
        '/forums/lessons/$lessonId',
        data: {
          'content': content.trim(),
          if (title != null && title.trim().isNotEmpty) 'title': title.trim(),
        },
      );
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  @override
  Future<void> createReply({
    required String discussionId,
    required String content,
  }) async {
    try {
      await _dio.post<Map<String, dynamic>>(
        '/forums/discussions/$discussionId/replies',
        data: {'content': content.trim()},
      );
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }
}

final forumRepositoryProvider = Provider<ForumRepository>((ref) {
  return ForumRepositoryImpl(ref.watch(dioProvider));
});

/// Discussions for a lesson. autoDispose so re-opening re-fetches fresh threads.
final lessonForumProvider = FutureProvider.autoDispose
    .family<List<ForumDiscussion>, String>((ref, lessonId) {
  return ref.watch(forumRepositoryProvider).lessonForums(lessonId);
});

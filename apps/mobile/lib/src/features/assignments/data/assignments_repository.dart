import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/network/dio_client.dart';
import 'assignment_dto.dart';

abstract interface class AssignmentsRepository {
  Future<List<AssignmentDto>> list();
  Future<SubmissionDto?> mySubmission(String assignmentId);

  /// Submits (or resubmits) an assignment. At least one of [content]/[filePath]
  /// is required. Fails with a 403 if the due date has passed without extension.
  Future<void> submit({
    required String assignmentId,
    String? content,
    String? filePath,
    String? fileName,
  });

  Future<void> unsubmit(String assignmentId);

  /// Requests a deadline extension for an assignment. Mirrors the website:
  /// `POST /courses/:courseId/extensions/request`. Fails with 400 if a pending
  /// request already exists.
  Future<void> requestExtension({
    required String courseId,
    required String assignmentId,
    required String reason,
    DateTime? requestedDate,
  });

  /// The student's current extension status for an item, or null if none.
  Future<MyExtensionInfo?> myExtensionForItem({
    required String courseId,
    required String itemId,
  });
}

/// The student's extension state for a single assignment/forum item.
class MyExtensionInfo {
  const MyExtensionInfo({
    required this.status,
    this.requestedDate,
    this.extendedDate,
  });

  final String status; // PENDING | APPROVED | REJECTED
  final DateTime? requestedDate;
  final DateTime? extendedDate;

  bool get isPending => status == 'PENDING';
  bool get isRejected => status == 'REJECTED';

  /// Mirrors the server gate: an approved request lets the student submit while
  /// now is on/before the requested date (or indefinitely when none was given).
  bool get isActive =>
      status == 'APPROVED' &&
      (requestedDate == null || !DateTime.now().isAfter(requestedDate!));
}

class AssignmentsRepositoryImpl implements AssignmentsRepository {
  AssignmentsRepositoryImpl(this._dio);
  final Dio _dio;

  @override
  Future<List<AssignmentDto>> list() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/student/assignments');
      final data = res.data?['data'];
      if (data is List) {
        return data
            .whereType<Map<String, dynamic>>()
            .map(AssignmentDto.fromJson)
            .toList();
      }
      return const [];
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  @override
  Future<SubmissionDto?> mySubmission(String assignmentId) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>(
        '/student/assignments/$assignmentId/my-submission',
      );
      final data = res.data?['data'];
      if (data is Map<String, dynamic>) return SubmissionDto.fromJson(data);
      return null; // no submission yet
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  @override
  Future<void> submit({
    required String assignmentId,
    String? content,
    String? filePath,
    String? fileName,
  }) async {
    try {
      final form = FormData.fromMap({
        if (content != null && content.trim().isNotEmpty) 'content': content.trim(),
        if (filePath != null)
          'file': await MultipartFile.fromFile(filePath, filename: fileName),
      });
      await _dio.post<Map<String, dynamic>>(
        '/student/assignments/$assignmentId/submit',
        data: form,
      );
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  @override
  Future<void> unsubmit(String assignmentId) async {
    try {
      await _dio.delete<Map<String, dynamic>>(
        '/student/assignments/$assignmentId/unsubmit',
      );
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  @override
  Future<void> requestExtension({
    required String courseId,
    required String assignmentId,
    required String reason,
    DateTime? requestedDate,
  }) async {
    try {
      await _dio.post<Map<String, dynamic>>(
        '/courses/$courseId/extensions/request',
        data: {
          'itemId': assignmentId,
          'itemType': 'ASSIGNMENT',
          'reason': reason.trim(),
          if (requestedDate != null)
            'requestedDate': requestedDate.toIso8601String(),
        },
      );
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  @override
  Future<MyExtensionInfo?> myExtensionForItem({
    required String courseId,
    required String itemId,
  }) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>(
        '/courses/$courseId/extensions/my-requests',
      );
      final data = res.data?['data'];
      final requests = (data is Map ? data['requests'] : null) as List? ?? [];
      final granted = (data is Map ? data['granted'] : null) as List? ?? [];

      final mine = requests
          .whereType<Map<String, dynamic>>()
          .where((r) => r['itemId'] == itemId)
          .toList();
      if (mine.isEmpty) return null;

      // Prefer an approved request, then a pending one, else the most recent.
      Map<String, dynamic>? pick;
      for (final r in mine) {
        if (r['status'] == 'APPROVED') {
          pick = r;
          break;
        }
      }
      pick ??= mine.firstWhere(
        (r) => r['status'] == 'PENDING',
        orElse: () => mine.last,
      );

      DateTime? parse(Object? v) =>
          v == null ? null : DateTime.tryParse(v.toString());

      DateTime? extendedDate;
      for (final g in granted.whereType<Map<String, dynamic>>()) {
        if (g['itemId'] == itemId) {
          extendedDate = parse(g['extendedDate']);
          break;
        }
      }

      return MyExtensionInfo(
        status: pick['status']?.toString() ?? 'PENDING',
        requestedDate: parse(pick['requestedDate']),
        extendedDate: extendedDate,
      );
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }
}

final assignmentsRepositoryProvider = Provider<AssignmentsRepository>((ref) {
  return AssignmentsRepositoryImpl(ref.watch(dioProvider));
});

final myAssignmentsProvider = FutureProvider<List<AssignmentDto>>((ref) {
  return ref.watch(assignmentsRepositoryProvider).list();
});

final mySubmissionProvider =
    FutureProvider.family<SubmissionDto?, String>((ref, assignmentId) {
  return ref.watch(assignmentsRepositoryProvider).mySubmission(assignmentId);
});

/// The student's extension status for an assignment, keyed by (courseId, itemId).
/// autoDispose so re-opening the screen re-fetches fresh approval status.
final assignmentExtensionProvider = FutureProvider.autoDispose.family<
    MyExtensionInfo?, ({String courseId, String itemId})>((ref, key) {
  return ref.watch(assignmentsRepositoryProvider).myExtensionForItem(
        courseId: key.courseId,
        itemId: key.itemId,
      );
});

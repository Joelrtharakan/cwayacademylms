import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/offline/json_cache.dart';
import '../../learn/data/learn_repository.dart';
import '../data/download_item.dart';

/// Manages courses saved for offline. Saving pins the course's learn payload and
/// detail in the durable cache so lessons/curriculum open without a network.
class DownloadsController extends AsyncNotifier<List<DownloadItem>> {
  static const _indexKey = 'downloads:index';

  JsonCache get _cache => ref.read(jsonCacheProvider);

  @override
  Future<List<DownloadItem>> build() async {
    final raw = await _cache.get(_indexKey);
    if (raw is List) {
      return raw
          .whereType<Map<dynamic, dynamic>>()
          .map((m) => DownloadItem.fromMap(Map<String, dynamic>.from(m)))
          .toList();
    }
    return <DownloadItem>[];
  }

  bool isSaved(String courseId) =>
      (state.valueOrNull ?? <DownloadItem>[]).any((d) => d.courseId == courseId);

  Future<void> save(DownloadItem item) async {
    // Pin the learn payload (requires enrollment) + course detail for offline.
    await ref.read(learnRepositoryProvider).enrollment(item.courseId, pin: true);
    await _cache.setPinned('course:${item.courseId}', true);

    final current = state.valueOrNull ?? <DownloadItem>[];
    final next = [
      for (final d in current)
        if (d.courseId != item.courseId) d,
      item,
    ];
    await _cache.put(_indexKey, next.map((d) => d.toMap()).toList(), pinned: true);
    state = AsyncData(next);
  }

  Future<void> remove(String courseId) async {
    await _cache.delete('learn:$courseId');
    await _cache.setPinned('course:$courseId', false);

    final next = [
      for (final d in (state.valueOrNull ?? <DownloadItem>[]))
        if (d.courseId != courseId) d,
    ];
    await _cache.put(_indexKey, next.map((d) => d.toMap()).toList(), pinned: true);
    state = AsyncData(next);
  }
}

final downloadsControllerProvider =
    AsyncNotifierProvider<DownloadsController, List<DownloadItem>>(
  DownloadsController.new,
);

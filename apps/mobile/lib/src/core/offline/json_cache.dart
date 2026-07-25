import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive/hive.dart';

/// A durable JSON cache backed by a Hive box. Repositories write successful
/// responses here and read them back when the network is unavailable
/// (stale-while-offline). Each value is a JSON envelope: `{data, updatedAt,
/// pinned}`. `pinned` entries are user-saved "downloads" and never auto-evicted.
class JsonCache {
  JsonCache(this._box);
  final Box<String> _box;

  Map<String, dynamic>? _envelope(String key) {
    final raw = _box.get(key);
    if (raw == null) return null;
    try {
      final decoded = jsonDecode(raw);
      return decoded is Map<String, dynamic> ? decoded : null;
    } on FormatException {
      return null;
    }
  }

  Future<void> put(String key, Object? data, {bool pinned = false}) async {
    final wasPinned = _envelope(key)?['pinned'] == true;
    await _box.put(
      key,
      jsonEncode({
        'data': data,
        'updatedAt': DateTime.now().toIso8601String(),
        'pinned': pinned || wasPinned,
      }),
    );
  }

  Future<dynamic> get(String key) async => _envelope(key)?['data'];

  Future<void> setPinned(String key, bool pinned) async {
    final env = _envelope(key);
    if (env == null) return;
    env['pinned'] = pinned;
    await _box.put(key, jsonEncode(env));
  }

  Future<void> delete(String key) => _box.delete(key);

  /// Evicts unpinned entries older than [maxAge] (called at startup).
  Future<void> evictStale({Duration maxAge = const Duration(days: 7)}) async {
    final cutoff = DateTime.now().subtract(maxAge);
    final toDelete = <String>[];
    for (final key in _box.keys) {
      final env = _envelope(key as String);
      if (env == null) continue;
      if (env['pinned'] == true) continue;
      final updated = DateTime.tryParse('${env['updatedAt']}');
      if (updated != null && updated.isBefore(cutoff)) toDelete.add(key);
    }
    await _box.deleteAll(toDelete);
  }
}

/// Overridden in bootstrap once the Hive box is opened.
final cacheBoxProvider = Provider<Box<String>>((ref) {
  throw UnimplementedError('cacheBoxProvider must be overridden in bootstrap()');
});

final jsonCacheProvider = Provider<JsonCache>((ref) {
  return JsonCache(ref.watch(cacheBoxProvider));
});

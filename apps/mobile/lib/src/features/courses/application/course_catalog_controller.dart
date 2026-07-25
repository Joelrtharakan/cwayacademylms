import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/course_dto.dart';
import '../data/courses_repository.dart';
import 'course_query.dart';

@immutable
class CourseCatalogState {
  const CourseCatalogState({
    required this.items,
    required this.query,
    required this.page,
    required this.pages,
    required this.total,
    this.loadingMore = false,
  });

  final List<CourseListItemDto> items;
  final CourseQuery query;
  final int page;
  final int pages;
  final int total;
  final bool loadingMore;

  bool get hasMore => page < pages;

  CourseCatalogState copyWith({
    List<CourseListItemDto>? items,
    CourseQuery? query,
    int? page,
    int? pages,
    int? total,
    bool? loadingMore,
  }) {
    return CourseCatalogState(
      items: items ?? this.items,
      query: query ?? this.query,
      page: page ?? this.page,
      pages: pages ?? this.pages,
      total: total ?? this.total,
      loadingMore: loadingMore ?? this.loadingMore,
    );
  }
}

/// Owns the catalog list: current query, accumulated pages and load-more.
/// Changing the query resets to page 1 (skeleton); load-more appends.
class CourseCatalogController extends AsyncNotifier<CourseCatalogState> {
  CourseQuery _query = const CourseQuery();

  @override
  Future<CourseCatalogState> build() => _fetchFirst(_query);

  Future<CourseCatalogState> _fetchFirst(CourseQuery query) async {
    final page = await ref.read(coursesRepositoryProvider).list(query, page: 1);
    return CourseCatalogState(
      items: page.courses,
      query: query,
      page: page.page,
      pages: page.pages,
      total: page.total,
    );
  }

  Future<void> applyQuery(CourseQuery query) async {
    if (query == _query && state.hasValue) return;
    _query = query;
    state = const AsyncLoading<CourseCatalogState>().copyWithPrevious(state);
    state = await AsyncValue.guard(() => _fetchFirst(query));
  }

  void search(String term) => applyQuery(_query.copyWith(search: term));

  Future<void> refresh() async {
    final next = await AsyncValue.guard(() => _fetchFirst(_query));
    if (next.hasValue) state = next;
  }

  Future<void> loadMore() async {
    final current = state.valueOrNull;
    if (current == null || !current.hasMore || current.loadingMore) return;

    state = AsyncData(current.copyWith(loadingMore: true));
    try {
      final next = await ref
          .read(coursesRepositoryProvider)
          .list(_query, page: current.page + 1);
      state = AsyncData(current.copyWith(
        items: [...current.items, ...next.courses],
        page: next.page,
        pages: next.pages,
        total: next.total,
        loadingMore: false,
      ),);
    } on Object {
      // Keep existing items; just stop the spinner so the user can retry.
      state = AsyncData(current.copyWith(loadingMore: false));
    }
  }
}

final courseCatalogControllerProvider =
    AsyncNotifierProvider<CourseCatalogController, CourseCatalogState>(
  CourseCatalogController.new,
);

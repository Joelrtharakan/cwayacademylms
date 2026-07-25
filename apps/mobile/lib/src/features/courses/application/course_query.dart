import 'package:flutter/foundation.dart';

/// Immutable catalog query. Mirrors the query params accepted by `GET /courses`.
enum CourseSort { newest, popular, moduleOrder }

@immutable
class CourseQuery {
  const CourseQuery({
    this.search = '',
    this.categoryId,
    this.level,
    this.language,
    this.isFree,
    this.sort = CourseSort.newest,
  });

  final String search;
  final String? categoryId;
  final String? level;
  final String? language;
  final bool? isFree;
  final CourseSort sort;

  CourseQuery copyWith({
    String? search,
    String? Function()? categoryId,
    String? Function()? level,
    String? Function()? language,
    bool? Function()? isFree,
    CourseSort? sort,
  }) {
    return CourseQuery(
      search: search ?? this.search,
      categoryId: categoryId != null ? categoryId() : this.categoryId,
      level: level != null ? level() : this.level,
      language: language != null ? language() : this.language,
      isFree: isFree != null ? isFree() : this.isFree,
      sort: sort ?? this.sort,
    );
  }

  Map<String, dynamic> toParams({required int page, int limit = 12}) {
    return {
      'page': page,
      'limit': limit,
      if (search.trim().isNotEmpty) 'search': search.trim(),
      if (categoryId != null) 'category': categoryId,
      if (level != null) 'level': level,
      if (language != null) 'language': language,
      if (isFree != null) 'isFree': isFree,
      'sortBy': switch (sort) {
        CourseSort.popular => 'popular',
        CourseSort.moduleOrder => 'moduleOrder',
        CourseSort.newest => 'newest',
      },
    };
  }

  bool get hasActiveFilters =>
      categoryId != null || level != null || language != null || isFree != null;

  @override
  bool operator ==(Object other) =>
      other is CourseQuery &&
      other.search == search &&
      other.categoryId == categoryId &&
      other.level == level &&
      other.language == language &&
      other.isFree == isFree &&
      other.sort == sort;

  @override
  int get hashCode =>
      Object.hash(search, categoryId, level, language, isFree, sort);
}

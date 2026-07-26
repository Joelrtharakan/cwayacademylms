import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/i18n/i18n_extension.dart';
import '../../../core/localization/localized_text.dart';
import '../../../core/router/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';
import '../../../shared/widgets/app_shimmer.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/error_banner.dart';
import '../application/course_catalog_controller.dart';
import '../application/course_query.dart';
import '../data/courses_repository.dart';
import 'widgets/course_card.dart';

/// Dedicated screen displaying standalone courses (courses not attached to an academic program).
class CoursesBrowseScreen extends ConsumerStatefulWidget {
  const CoursesBrowseScreen({super.key});

  @override
  ConsumerState<CoursesBrowseScreen> createState() =>
      _CoursesBrowseScreenState();
}

class _CoursesBrowseScreenState extends ConsumerState<CoursesBrowseScreen> {
  final _scroll = ScrollController();
  final _searchCtrl = TextEditingController();
  Timer? _debounce;

  @override
  void initState() {
    super.initState();
    _scroll.addListener(_onScroll);
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _scroll.dispose();
    _searchCtrl.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scroll.position.pixels >= _scroll.position.maxScrollExtent - 400) {
      ref.read(courseCatalogControllerProvider.notifier).loadMore();
    }
  }

  void _onSearchChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 400), () {
      ref.read(courseCatalogControllerProvider.notifier).search(value);
    });
  }

  CourseCatalogController get _ctrl =>
      ref.read(courseCatalogControllerProvider.notifier);

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final async = ref.watch(courseCatalogControllerProvider);
    final query = async.valueOrNull?.query ?? const CourseQuery();

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        backgroundColor: colors.forestDeep,
        foregroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        flexibleSpace: DecoratedBox(
          decoration: BoxDecoration(gradient: colors.forestGradient),
        ),
        title: Text(
          context.tr('mobile.courses.standalone'),
          style: Theme.of(context)
              .textTheme
              .titleLarge
              ?.copyWith(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        actions: [
          PopupMenuButton<CourseSort>(
            icon: const Icon(Icons.sort_rounded),
            tooltip: context.tr('mobile.browse.sort'),
            initialValue: query.sort,
            onSelected: (s) => _ctrl.applyQuery(query.copyWith(sort: s)),
            itemBuilder: (context) => [
              PopupMenuItem(value: CourseSort.newest, child: Text(context.tr('mobile.browse.sortNewest'))),
              PopupMenuItem(value: CourseSort.popular, child: Text(context.tr('mobile.browse.sortPopular'))),
              PopupMenuItem(
                value: CourseSort.moduleOrder, child: Text(context.tr('mobile.browse.sortModuleOrder')),),
            ],
          ),
        ],
      ),
      body: RefreshIndicator(
        color: colors.goldPrimary,
        onRefresh: () => _ctrl.refresh(),
        child: CustomScrollView(
          controller: _scroll,
          slivers: [
            SliverToBoxAdapter(child: _searchField(colors)),
            SliverToBoxAdapter(child: _filterChips(query)),
            ..._results(async),
          ],
        ),
      ),
    );
  }

  Widget _searchField(AppColors colors) => Padding(
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.lg, AppSpacing.sm, AppSpacing.lg, AppSpacing.sm,
        ),
        child: TextField(
          controller: _searchCtrl,
          textInputAction: TextInputAction.search,
          onChanged: _onSearchChanged,
          decoration: InputDecoration(
            hintText: context.tr('mobile.browse.searchHint'),
            prefixIcon: const Icon(Icons.search_rounded),
            suffixIcon: _searchCtrl.text.isEmpty
                ? null
                : IconButton(
                    icon: const Icon(Icons.close_rounded),
                    onPressed: () {
                      _searchCtrl.clear();
                      _ctrl.search('');
                      setState(() {});
                    },
                  ),
          ),
        ),
      );

  Widget _filterChips(CourseQuery query) {
    final categoriesAsync = ref.watch(categoriesProvider);
    return SizedBox(
      height: 44,
      child: categoriesAsync.maybeWhen(
        data: (categories) => ListView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
          children: [
            _chip(
              label: context.tr('mobile.browse.filterAll'),
              selected: query.categoryId == null,
              onSelected: () =>
                  _ctrl.applyQuery(query.copyWith(categoryId: () => null)),
            ),
            _chip(
              label: context.tr('mobile.browse.filterFree'),
              selected: query.isFree == true,
              onSelected: () => _ctrl.applyQuery(
                query.copyWith(isFree: () => query.isFree == true ? null : true),
              ),
            ),
            for (final c in categories)
              _chip(
                label: c.name.resolveFor(context),
                selected: query.categoryId == c.id,
                onSelected: () =>
                    _ctrl.applyQuery(query.copyWith(categoryId: () => c.id)),
              ),
          ],
        ),
        orElse: () => const SizedBox.shrink(),
      ),
    );
  }

  Widget _chip({
    required String label,
    required bool selected,
    required VoidCallback onSelected,
  }) =>
      Padding(
        padding: const EdgeInsets.only(right: AppSpacing.sm),
        child: ChoiceChip(
          label: Text(label),
          selected: selected,
          onSelected: (_) => onSelected(),
        ),
      );

  List<Widget> _results(AsyncValue<CourseCatalogState> async) {
    return [
      ...async.when(
        skipLoadingOnRefresh: true,
        skipLoadingOnReload: true,
        loading: () => [const _CatalogSkeletonSliver()],
        error: (_, __) => [
          SliverPadding(
            padding: const EdgeInsets.all(AppSpacing.xl),
            sliver: SliverToBoxAdapter(
              child: ErrorBanner(
                message: context.tr('mobile.browse.loadError'),
                onRetry: () => ref.invalidate(courseCatalogControllerProvider),
              ),
            ),
          ),
        ],
        data: (state) {
          // Filter standalone courses ONLY (courses with no program association)
          final standaloneItems = state.items
              .where((c) => c.programId == null || c.programId!.isEmpty)
              .toList();

          if (standaloneItems.isEmpty) {
            return [
              SliverFillRemaining(
                hasScrollBody: false,
                child: EmptyState(
                  icon: Icons.search_off_rounded,
                  title: context.tr('mobile.browse.emptyTitle'),
                  message: context.tr('mobile.browse.emptyMessage'),
                ),
              ),
            ];
          }
          return [
            SliverPadding(
              padding: const EdgeInsets.only(
                left: AppSpacing.lg,
                right: AppSpacing.lg,
                top: AppSpacing.lg,
                bottom: 120,
              ),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                  maxCrossAxisExtent: 240,
                  crossAxisSpacing: AppSpacing.md,
                  mainAxisSpacing: AppSpacing.md,
                  mainAxisExtent: 252,
                ),
                delegate: SliverChildBuilderDelegate(
                  (context, i) {
                    final course = standaloneItems[i];
                    return RepaintBoundary(
                      child: CourseCard(
                        course: course,
                        onTap: () => context.push(
                          AppRoutes.courseDetailPath(course.id),
                        ),
                      ),
                    );
                  },
                  childCount: standaloneItems.length,
                ),
              ),
            ),
          ];
        },
      ),
    ];
  }
}

class _CatalogSkeletonSliver extends StatelessWidget {
  const _CatalogSkeletonSliver();

  @override
  Widget build(BuildContext context) {
    return SliverPadding(
      padding: const EdgeInsets.all(AppSpacing.lg),
      sliver: SliverGrid(
        gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
          maxCrossAxisExtent: 240,
          crossAxisSpacing: AppSpacing.md,
          mainAxisSpacing: AppSpacing.md,
          mainAxisExtent: 252,
        ),
        delegate: SliverChildBuilderDelegate(
          (_, __) => const AppShimmer(
            height: 252,
            borderRadius: AppRadii.rLg,
          ),
          childCount: 6,
        ),
      ),
    );
  }
}

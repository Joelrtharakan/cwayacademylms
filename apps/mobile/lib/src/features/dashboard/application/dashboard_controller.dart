import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/dashboard_dto.dart';
import '../data/dashboard_repository.dart';

/// Loads and caches the student dashboard. `refresh()` re-fetches without
/// flipping the UI back to a full skeleton (used by pull-to-refresh and the
/// on-resume revalidation), preserving the current content while updating.
class DashboardController extends AsyncNotifier<DashboardDto> {
  @override
  Future<DashboardDto> build() {
    return ref.watch(dashboardRepositoryProvider).fetch();
  }

  Future<void> refresh() async {
    final data = await AsyncValue.guard(
      () => ref.read(dashboardRepositoryProvider).fetch(),
    );
    // Keep prior content visible on error; only replace on success.
    if (data.hasValue) state = data;
  }
}

final dashboardControllerProvider =
    AsyncNotifierProvider<DashboardController, DashboardDto>(
  DashboardController.new,
);

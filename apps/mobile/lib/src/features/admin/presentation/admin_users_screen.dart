import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/i18n/app_translations.dart';
import '../../../core/i18n/i18n_extension.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';
import '../../../shared/widgets/app_shimmer.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/error_banner.dart';
import '../../../shared/widgets/status_badge.dart';
import '../data/admin_dto.dart';
import '../data/admin_repository.dart';

/// Admin user directory: search, filter by role, and ban/unban. All actions are
/// authorized server-side (the `/admin` router requires the ADMIN role).
class AdminUsersScreen extends ConsumerStatefulWidget {
  const AdminUsersScreen({super.key});

  @override
  ConsumerState<AdminUsersScreen> createState() => _AdminUsersScreenState();
}

class _AdminUsersScreenState extends ConsumerState<AdminUsersScreen> {
  final _searchCtrl = TextEditingController();
  Timer? _debounce;

  static const _roles = ['STUDENT', 'INSTRUCTOR', 'ADMIN'];

  @override
  void dispose() {
    _debounce?.cancel();
    _searchCtrl.dispose();
    super.dispose();
  }

  void _onSearch(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 400), () {
      final q = ref.read(adminUserQueryProvider);
      ref.read(adminUserQueryProvider.notifier).state =
          q.copyWith(search: value);
    });
  }

  Future<void> _toggleBan(AdminUserDto user) async {
    final messenger = ScaffoldMessenger.of(context);
    try {
      await ref
          .read(adminRepositoryProvider)
          .setBanned(user.id, banned: !user.isBanned);
      ref.invalidate(adminUsersProvider);
      messenger.showSnackBar(SnackBar(
        content: Text(user.isBanned
            ? AppTranslations.tg('mobile.admin.userUnbanned', {'name': user.name})
            : AppTranslations.tg('mobile.admin.userBanned', {'name': user.name}),),
      ),);
    } on ApiException catch (e) {
      messenger.showSnackBar(SnackBar(content: Text(e.message)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final query = ref.watch(adminUserQueryProvider);
    final async = ref.watch(adminUsersProvider);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: colors.forestDeep,
        foregroundColor: Colors.white,
        systemOverlayStyle: SystemUiOverlayStyle.light,
        flexibleSpace: DecoratedBox(
          decoration: BoxDecoration(gradient: colors.forestGradient),
        ),
        title: Text(context.tr('admin.users.title'),
            style: Theme.of(context)
                .textTheme
                .titleLarge
                ?.copyWith(color: Colors.white),),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg, AppSpacing.md, AppSpacing.lg, AppSpacing.sm,),
            child: TextField(
              controller: _searchCtrl,
              textInputAction: TextInputAction.search,
              onChanged: _onSearch,
              decoration: InputDecoration(
                hintText: context.tr('admin.users.searchPlaceholder'),
                prefixIcon: const Icon(Icons.search_rounded),
              ),
            ),
          ),
          SizedBox(
            height: 44,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
              children: [
                _roleChip(context.tr('admin.users.allRoles'), null, query.role),
                for (final r in _roles) _roleChip(_roleName(context, r), r, query.role),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Expanded(
            child: RefreshIndicator(
              color: colors.goldPrimary,
              onRefresh: () => ref.refresh(adminUsersProvider.future),
              child: async.when(
                skipLoadingOnRefresh: true,
                loading: () => ListView.separated(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  itemCount: 8,
                  separatorBuilder: (_, __) =>
                      const SizedBox(height: AppSpacing.md),
                  itemBuilder: (_, __) =>
                      const AppShimmer(height: 72, borderRadius: AppRadii.rLg),
                ),
                error: (_, __) => ListView(
                  children: [
                    SizedBox(height: MediaQuery.sizeOf(context).height * 0.1),
                    Padding(
                      padding: const EdgeInsets.all(AppSpacing.xl),
                      child: ErrorBanner(
                        message: context.tr('mobile.admin.usersLoadError'),
                        onRetry: () => ref.invalidate(adminUsersProvider),
                      ),
                    ),
                  ],
                ),
                data: (page) {
                  if (page.users.isEmpty) {
                    return ListView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      children: [
                        SizedBox(
                            height: MediaQuery.sizeOf(context).height * 0.12,),
                        EmptyState(
                          icon: Icons.person_search_rounded,
                          title: context.tr('mobile.admin.noUsersFound'),
                          message: context.tr('mobile.admin.noUsersMessage'),
                        ),
                      ],
                    );
                  }
                  return ListView.separated(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.only(
                      left: AppSpacing.lg,
                      right: AppSpacing.lg,
                      top: AppSpacing.lg,
                      bottom: 140,
                    ),
                    itemCount: page.users.length,
                    separatorBuilder: (_, __) =>
                        const SizedBox(height: AppSpacing.md),
                    itemBuilder: (_, i) => _UserRow(
                      user: page.users[i],
                      onToggleBan: () => _toggleBan(page.users[i]),
                    ),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _roleChip(String label, String? role, String? selected) => Padding(
        padding: const EdgeInsets.only(right: AppSpacing.sm),
        child: ChoiceChip(
          label: Text(label),
          selected: selected == role,
          onSelected: (_) => ref.read(adminUserQueryProvider.notifier).state =
              ref.read(adminUserQueryProvider).copyWith(role: () => role),
        ),
      );

  static String _roleName(BuildContext context, String r) => switch (r.toUpperCase()) {
        'ADMIN' => context.tr('admin.users.roleAdmin'),
        'INSTRUCTOR' => context.tr('admin.users.roleInstructor'),
        _ => context.tr('admin.users.roleStudent'),
      };
}

class _UserRow extends StatelessWidget {
  const _UserRow({required this.user, required this.onToggleBan});
  final AdminUserDto user;
  final VoidCallback onToggleBan;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final hasAvatar = user.avatar?.startsWith('http') ?? false;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: AppRadii.rLg,
        border: Border.all(color: colors.border),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 22,
            backgroundColor: colors.forestMid,
            backgroundImage: hasAvatar ? NetworkImage(user.avatar!) : null,
            child: hasAvatar
                ? null
                : Text(
                    user.name.isNotEmpty
                        ? user.name.characters.first.toUpperCase()
                        : '?',
                    style: const TextStyle(color: Colors.white),
                  ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(user.name,
                          style: text.titleSmall,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    StatusBadge.role(user.role),
                    if (user.isBanned) ...[
                      const SizedBox(width: 4),
                      StatusBadge(
                        label: context.tr('admin.users.statusBanned'),
                        tone: BadgeTone.danger,
                        dense: true,
                      ),
                    ] else if (!user.isVerified) ...[
                      const SizedBox(width: 4),
                      StatusBadge(
                        label: context.tr('admin.users.statusUnverified'),
                        tone: BadgeTone.warning,
                        dense: true,
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 2),
                Text(user.email,
                    style: text.bodySmall?.copyWith(color: colors.textMuted),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,),
              ],
            ),
          ),
          PopupMenuButton<String>(
            icon: Icon(Icons.more_vert_rounded, color: colors.textMuted),
            onSelected: (_) => onToggleBan(),
            itemBuilder: (_) => [
              PopupMenuItem(
                value: 'ban',
                child: Text(user.isBanned ? context.tr('mobile.admin.unbanUser') : context.tr('mobile.admin.banUser'),
                    style: TextStyle(
                        color: user.isBanned ? colors.success : colors.danger,),),
              ),
            ],
          ),
        ],
      ),
    );
  }
}


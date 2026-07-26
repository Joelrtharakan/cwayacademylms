import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/i18n/i18n_extension.dart';
import '../../../core/localization/localized_text.dart';
import '../../../core/router/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../dashboard/presentation/widgets/course_thumbnail.dart';
import '../application/downloads_controller.dart';

class DownloadsScreen extends ConsumerWidget {
  const DownloadsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = context.colors;
    final async = ref.watch(downloadsControllerProvider);

    return Scaffold(
      appBar: AppBar(title: Text(context.tr('mobile.downloads.title'))),
      body: async.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => EmptyState(
          icon: Icons.download_rounded,
          title: context.tr('mobile.downloads.errorTitle'),
          message: context.tr('mobile.downloads.errorMessage'),
        ),
        data: (items) {
          if (items.isEmpty) {
            return EmptyState(
              icon: Icons.download_for_offline_outlined,
              title: context.tr('mobile.downloads.emptyTitle'),
              message: context.tr('mobile.downloads.emptyMessage'),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(AppSpacing.lg),
            itemCount: items.length,
            separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.md),
            itemBuilder: (context, i) {
              final item = items[i];
              final title = item.title.resolveFor(context);
              return Dismissible(
                key: ValueKey(item.courseId),
                direction: DismissDirection.endToStart,
                background: Container(
                  alignment: Alignment.centerRight,
                  padding: const EdgeInsets.only(right: AppSpacing.lg),
                  decoration: BoxDecoration(
                    color: colors.danger.withValues(alpha: 0.1),
                    borderRadius: AppRadii.rLg,
                  ),
                  child: Icon(Icons.delete_outline_rounded, color: colors.danger),
                ),
                onDismissed: (_) => ref
                    .read(downloadsControllerProvider.notifier)
                    .remove(item.courseId),
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    borderRadius: AppRadii.rLg,
                    onTap: () =>
                        context.push(AppRoutes.courseLearnPath(item.courseId)),
                    child: Ink(
                      decoration: BoxDecoration(
                        color: colors.surface,
                        borderRadius: AppRadii.rLg,
                        border: Border.all(color: colors.border),
                      ),
                      padding: const EdgeInsets.all(AppSpacing.md),
                      child: Row(
                        children: [
                          CourseThumbnail(
                            url: item.thumbnail,
                            title: title,
                            width: 56,
                            height: 56,
                            radius: 12,
                          ),
                          const SizedBox(width: AppSpacing.md),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(title,
                                    style: Theme.of(context).textTheme.titleSmall,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,),
                                const SizedBox(height: 2),
                                Row(
                                  children: [
                                    Icon(Icons.offline_pin_rounded,
                                        size: 14, color: colors.success,),
                                    const SizedBox(width: 4),
                                    Text(
                                      context.tr('mobile.downloads.availableOffline', {'date': Formatters.date(item.savedAt)}),
                                      style: Theme.of(context)
                                          .textTheme
                                          .labelSmall
                                          ?.copyWith(color: colors.textMuted),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          Icon(Icons.chevron_right_rounded, color: colors.textMuted),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

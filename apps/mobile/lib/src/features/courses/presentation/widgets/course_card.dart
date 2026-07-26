import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../../../../core/i18n/i18n_extension.dart';
import '../../../../core/localization/localized_text.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../shared/widgets/animated_press.dart';
import '../../data/course_dto.dart';

/// Premium catalog course card: cinematic artwork with a gradient scrim,
/// floating level/price chips, then a compact, bounded info block. The body is
/// wrapped in [Expanded] so it can never overflow its grid cell regardless of
/// card width — the previous fixed-height + 16:9 combination clipped on wide
/// layouts.
class CourseCard extends StatelessWidget {
  const CourseCard({super.key, required this.course, required this.onTap});

  final CourseListItemDto course;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final title = course.title.resolveFor(context);

    return Semantics(
      button: true,
      label: title,
      child: AnimatedPress(
        onTap: onTap,
        child: Container(
          clipBehavior: Clip.antiAlias,
          decoration: BoxDecoration(
            color: colors.surfaceElevated,
            borderRadius: AppRadii.rXl,
            boxShadow: AppShadows.card(colors.forestDeep),
            border: Border.all(color: colors.border.withValues(alpha: 0.5)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _Artwork(course: course, title: title),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(
                    AppSpacing.md,
                    AppSpacing.sm,
                    AppSpacing.md,
                    AppSpacing.md,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: text.titleSmall?.copyWith(height: 1.2),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (course.instructor?.name.isNotEmpty ?? false) ...[
                        const SizedBox(height: 2),
                        Text(
                          course.instructor!.name,
                          style: text.labelSmall?.copyWith(color: colors.textMuted),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                      const Spacer(),
                      Row(
                        children: [
                          Icon(Icons.star_rounded, size: 15, color: colors.goldPrimary),
                          const SizedBox(width: 2),
                          Text(
                            course.avgRating > 0
                                ? course.avgRating.toStringAsFixed(1)
                                : context.tr('mobile.course.new'),
                            style: text.labelSmall?.copyWith(
                                fontWeight: FontWeight.w700,),
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          Icon(Icons.people_alt_rounded,
                              size: 13, color: colors.textMuted,),
                          const SizedBox(width: 2),
                          Flexible(
                            child: Text(
                              Formatters.compact(course.enrollmentCount),
                              style: text.labelSmall
                                  ?.copyWith(color: colors.textMuted),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Artwork extends StatelessWidget {
  const _Artwork({required this.course, required this.title});
  final CourseListItemDto course;
  final String title;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final hasImage =
        course.thumbnail != null && course.thumbnail!.startsWith('http');

    return AspectRatio(
      aspectRatio: 16 / 10,
      child: Stack(
        fit: StackFit.expand,
        children: [
          hasImage
              ? CachedNetworkImage(
                  imageUrl: course.thumbnail!,
                  fit: BoxFit.cover,
                  memCacheWidth:
                      (400 * MediaQuery.devicePixelRatioOf(context)).round(),
                  placeholder: (_, __) => ColoredBox(color: colors.surfaceMuted),
                  errorWidget: (_, __, ___) => _gradient(colors, title),
                )
              : _gradient(colors, title),
          // Bottom scrim so overlaid chips stay legible on any thumbnail.
          const DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.bottomCenter,
                end: Alignment.center,
                colors: [Colors.black26, Colors.transparent],
              ),
            ),
          ),
          Positioned(
            top: AppSpacing.sm,
            left: AppSpacing.sm,
            child: _Chip(
              label: _levelLabel(course.level),
              background: Colors.black.withValues(alpha: 0.55),
              foreground: Colors.white,
            ),
          ),
          Positioned(
            bottom: AppSpacing.sm,
            left: AppSpacing.sm,
            child: _Chip(
              label: course.isFree
                  ? context.tr('mobile.browse.filterFree')
                  : Formatters.price(
                      amount: course.price,
                      currency: course.currency,
                      isFree: course.isFree,
                    ),
              background: colors.goldPrimary,
              foreground: Colors.white,
            ),
          ),
          if (course.isFeatured)
            Positioned(
              top: AppSpacing.sm,
              right: AppSpacing.sm,
              child: _Chip(
                label: context.tr('mobile.course.featured'),
                background: colors.forestMid,
                foreground: colors.goldLight,
              ),
            ),
        ],
      ),
    );
  }

  static String _levelLabel(String level) =>
      level.isEmpty ? '' : level[0].toUpperCase() + level.substring(1).toLowerCase();

  static Widget _gradient(AppColors colors, String title) => DecoratedBox(
        decoration: BoxDecoration(gradient: colors.forestGradient),
        child: Center(
          child: Text(
            title.isNotEmpty ? title.characters.first.toUpperCase() : '•',
            style: TextStyle(
              color: colors.goldLight,
              fontSize: 40,
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
      );
}

class _Chip extends StatelessWidget {
  const _Chip({
    required this.label,
    required this.background,
    required this.foreground,
  });
  final String label;
  final Color background;
  final Color foreground;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: 3),
      decoration: BoxDecoration(color: background, borderRadius: AppRadii.rPill),
      child: Text(
        label,
        style: TextStyle(
          color: foreground,
          fontSize: 11,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

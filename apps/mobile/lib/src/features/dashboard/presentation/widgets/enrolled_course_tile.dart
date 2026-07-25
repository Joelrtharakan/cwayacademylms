import 'package:flutter/material.dart';

import '../../../../core/localization/localized_text.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../shared/widgets/animated_press.dart';
import '../../data/dashboard_dto.dart';
import 'course_thumbnail.dart';

/// A single enrolled course row: artwork, title, meta and a progress bar.
class EnrolledCourseTile extends StatelessWidget {
  const EnrolledCourseTile({
    super.key,
    required this.enrollment,
    required this.onTap,
  });

  final EnrollmentDto enrollment;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final course = enrollment.course;
    final title = course.title.resolveFor(context);
    final percent = enrollment.progress.round();
    final meta = <String>[
      if (course.moduleNumber != null) 'Module ${course.moduleNumber}',
      if (course.instructorName.isNotEmpty) course.instructorName,
    ].join(' · ');

    return Semantics(
      button: true,
      label: '$title, $percent percent complete',
      child: AnimatedPress(
        onTap: onTap,
        child: Container(
          decoration: BoxDecoration(
            color: colors.surfaceElevated,
            borderRadius: AppRadii.rLg,
            boxShadow: AppShadows.card(colors.forestDeep),
            border: Border.all(
              color: Theme.of(context).brightness == Brightness.light 
                  ? colors.border.withValues(alpha: 0.5) 
                  : colors.border,
            ),
          ),
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Row(
              children: [
                Container(
                  decoration: BoxDecoration(
                    borderRadius: AppRadii.rMd,
                    boxShadow: AppShadows.sm(colors.forestDeep),
                  ),
                  child: CourseThumbnail(
                    url: course.thumbnail,
                    title: title,
                    width: 72,
                    height: 72,
                    radius: 12,
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        title,
                        style: text.titleMedium,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (meta.isNotEmpty) ...[
                        const SizedBox(height: AppSpacing.xxs),
                        Text(
                          meta,
                          style: text.bodySmall?.copyWith(color: colors.textMuted),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                      const SizedBox(height: AppSpacing.md),
                      Row(
                        children: [
                          Expanded(
                            child: ClipRRect(
                              borderRadius: AppRadii.rPill,
                              child: Stack(
                                children: [
                                  Container(
                                    height: 8,
                                    width: double.infinity,
                                    color: colors.surfaceMuted,
                                  ),
                                  FractionallySizedBox(
                                    alignment: Alignment.centerLeft,
                                    widthFactor: enrollment.progressFraction,
                                    child: Container(
                                      height: 8,
                                      decoration: BoxDecoration(
                                        gradient: colors.warmGradient,
                                        borderRadius: AppRadii.rPill,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          Text('$percent%',
                              style: text.labelSmall
                                  ?.copyWith(color: colors.textSecondary),),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
        ),
      ),
    );
  }
}

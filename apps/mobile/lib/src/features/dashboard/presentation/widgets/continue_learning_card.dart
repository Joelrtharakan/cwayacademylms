import 'package:flutter/material.dart';

import '../../../../core/localization/localized_text.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../shared/widgets/animated_press.dart';
import '../../data/dashboard_dto.dart';
import 'course_thumbnail.dart';

/// The flagship "Continue Learning" hero — forest-gradient card showing the
/// active enrollment, its progress, and a Resume affordance.
class ContinueLearningCard extends StatelessWidget {
  const ContinueLearningCard({
    super.key,
    required this.enrollment,
    required this.onResume,
  });

  final EnrollmentDto enrollment;
  final VoidCallback onResume;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final title = enrollment.course.title.resolveFor(context);
    final percent = enrollment.progress.round();

    return Semantics(
      button: true,
      label: 'Resume $title, $percent percent complete',
      child: AnimatedPress(
        onTap: onResume,
        child: Container(
          decoration: BoxDecoration(
            gradient: colors.forestGradient,
            borderRadius: AppRadii.rXl,
            boxShadow: [
              ...AppShadows.lg(colors.forestDeep),
              ...AppShadows.glow(colors.goldDark.withValues(alpha: 0.15)),
            ],
          ),
            padding: const EdgeInsets.all(AppSpacing.xl),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'CONTINUE LEARNING',
                  style: text.labelSmall?.copyWith(
                    color: colors.goldLight,
                    letterSpacing: 1.5,
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        CourseThumbnail(
                          url: enrollment.course.thumbnail,
                          title: title,
                          width: 72,
                          height: 72,
                        ),
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.4),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.play_arrow_rounded,
                            color: Colors.white,
                            size: 24,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(width: AppSpacing.lg),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            title,
                            style: text.titleLarge?.copyWith(color: Colors.white),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          if (enrollment.course.instructorName.isNotEmpty) ...[
                            const SizedBox(height: AppSpacing.xxs),
                            Text(
                              enrollment.course.instructorName,
                              style: text.bodySmall?.copyWith(color: Colors.white70),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.lg),
                _ProgressBar(
                  fraction: enrollment.progressFraction,
                  color: colors.goldLight,
                  track: Colors.white24,
                ),
                const SizedBox(height: AppSpacing.sm),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('$percent% complete',
                        style: text.bodySmall?.copyWith(color: Colors.white70),),
                    Row(
                      children: [
                        Text('Resume',
                            style: text.labelLarge?.copyWith(color: colors.goldLight),),
                        const SizedBox(width: 4),
                        Icon(Icons.arrow_forward_rounded,
                            size: 18, color: colors.goldLight,),
                      ],
                    ),
                  ],
                ),
              ],
            ),
        ),
      ),
    );
  }
}

class _ProgressBar extends StatelessWidget {
  const _ProgressBar({
    required this.fraction,
    required this.color,
    required this.track,
  });

  final double fraction;
  final Color color;
  final Color track;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: AppRadii.rPill,
      child: TweenAnimationBuilder<double>(
        tween: Tween(begin: 0, end: fraction),
        duration: AppMotion.slow,
        curve: AppMotion.curve,
        builder: (context, value, _) => LinearProgressIndicator(
          value: value,
          minHeight: 8,
          backgroundColor: track,
          valueColor: AlwaysStoppedAnimation(color),
        ),
      ),
    );
  }
}

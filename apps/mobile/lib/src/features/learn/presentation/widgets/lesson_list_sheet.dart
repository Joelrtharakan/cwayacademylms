import 'package:flutter/material.dart';

import '../../../../core/localization/localized_text.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../core/utils/formatters.dart';
import '../../../courses/presentation/widgets/lesson_type_icon.dart';
import '../../data/learn_dto.dart';

/// Bottom sheet listing the whole curriculum with completion state, letting the
/// learner jump to any lesson. The active lesson is highlighted.
class LessonListSheet extends StatelessWidget {
  const LessonListSheet({
    super.key,
    required this.enrollment,
    required this.currentLessonId,
    required this.onSelect,
  });

  final EnrollmentLearnDto enrollment;
  final String currentLessonId;
  final void Function(String lessonId) onSelect;

  static Future<void> show(
    BuildContext context, {
    required EnrollmentLearnDto enrollment,
    required String currentLessonId,
    required void Function(String lessonId) onSelect,
  }) {
    final height = MediaQuery.sizeOf(context).height * 0.8;
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (_) => SizedBox(
        height: height,
        child: LessonListSheet(
          enrollment: enrollment,
          currentLessonId: currentLessonId,
          onSelect: onSelect,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;

    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg, 0, AppSpacing.lg, AppSpacing.sm,),
            child: Text('Course content', style: text.titleLarge),
          ),
        ),
        for (final section in enrollment.course.sections)
          SliverMainAxisGroup(
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.md,
                      AppSpacing.lg, AppSpacing.xs,),
                  child: Text(
                    section.title.resolveFor(context),
                    style: text.labelMedium?.copyWith(color: colors.textMuted),
                  ),
                ),
              ),
              SliverList.builder(
                itemCount: section.lessons.length,
                itemBuilder: (context, i) {
                  final lesson = section.lessons[i];
                  final active = lesson.id == currentLessonId;
                  return ListTile(
                    selected: active,
                    selectedTileColor: colors.goldPrimary.withValues(alpha: 0.08),
                    leading: Icon(
                      lesson.isCompleted
                          ? Icons.check_circle_rounded
                          : lessonTypeIcon(lesson.type),
                      color: lesson.isCompleted
                          ? colors.success
                          : (active ? colors.goldPrimary : colors.forestLight),
                    ),
                    title: Text(
                      lesson.title.resolveFor(context),
                      style: text.bodyMedium?.copyWith(
                        fontWeight: active ? FontWeight.w700 : FontWeight.w400,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    subtitle: lesson.duration > 0
                        ? Text(Formatters.duration(lesson.duration),
                            style: text.labelSmall
                                ?.copyWith(color: colors.textMuted),)
                        : null,
                    trailing: active
                        ? Icon(Icons.play_arrow_rounded, color: colors.goldPrimary)
                        : null,
                    onTap: () {
                      Navigator.of(context).pop();
                      onSelect(lesson.id);
                    },
                  );
                },
              ),
            ],
          ),
        const SliverToBoxAdapter(child: SizedBox(height: AppSpacing.xl)),
      ],
    );
  }
}

import 'package:flutter/material.dart';

import '../../../../core/i18n/i18n_extension.dart';
import '../../../../core/localization/localized_text.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../core/utils/formatters.dart';
import '../../data/course_dto.dart';
import 'lesson_type_icon.dart';

/// Expandable curriculum: sections → lessons. Lessons the student can't access
/// yet show a lock; free/preview lessons remain tappable.
class CurriculumList extends StatelessWidget {
  const CurriculumList({
    super.key,
    required this.sections,
    required this.isEnrolled,
    required this.onLessonTap,
  });

  final List<SectionDto> sections;
  final bool isEnrolled;
  final void Function(SectionDto section, LessonDto lesson) onLessonTap;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    return Column(
      children: [
        for (var i = 0; i < sections.length; i++)
          Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.md),
            child: Material(
              color: colors.surface,
              shape: RoundedRectangleBorder(
                borderRadius: AppRadii.rLg,
                side: BorderSide(color: colors.border),
              ),
              clipBehavior: Clip.antiAlias,
              child: _SectionTile(
                index: i + 1,
                section: sections[i],
                isEnrolled: isEnrolled,
                onLessonTap: onLessonTap,
                initiallyExpanded: i == 0,
              ),
            ),
          ),
      ],
    );
  }
}

class _SectionTile extends StatelessWidget {
  const _SectionTile({
    required this.index,
    required this.section,
    required this.isEnrolled,
    required this.onLessonTap,
    required this.initiallyExpanded,
  });

  final int index;
  final SectionDto section;
  final bool isEnrolled;
  final void Function(SectionDto section, LessonDto lesson) onLessonTap;
  final bool initiallyExpanded;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final title = section.title.resolveFor(context);
    final lessonCount = section.lessons.length;

    return Theme(
      data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
      child: ExpansionTile(
        initiallyExpanded: initiallyExpanded,
        tilePadding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
        childrenPadding: const EdgeInsets.only(bottom: AppSpacing.sm),
        leading: CircleAvatar(
          radius: 16,
          backgroundColor: colors.surfaceMuted,
          child: Text('$index',
              style: text.labelMedium?.copyWith(color: colors.textSecondary),),
        ),
        title: Text(title.isEmpty ? context.tr('mobile.curriculum.section', {'index': index}) : title,
            style: text.titleSmall,),
        subtitle: Text(context.tr('mobile.curriculum.lessonsCount', {'count': lessonCount}),
            style: text.bodySmall?.copyWith(color: colors.textMuted),),
        children: [
          for (final lesson in section.lessons)
            _LessonRow(
              lesson: lesson,
              locked: !isEnrolled && !lesson.isAccessiblePreview,
              onTap: () => onLessonTap(section, lesson),
            ),
        ],
      ),
    );
  }
}

class _LessonRow extends StatelessWidget {
  const _LessonRow({
    required this.lesson,
    required this.locked,
    required this.onTap,
  });

  final LessonDto lesson;
  final bool locked;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final title = lesson.title.resolveFor(context);

    return Material(
      color: Colors.transparent,
      child: ListTile(
        dense: true,
      enabled: !locked,
      onTap: locked ? null : onTap,
      contentPadding:
          const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      leading: Icon(
        lessonTypeIcon(lesson.type),
        size: 20,
        color: locked ? colors.textMuted : colors.forestLight,
      ),
      title: Text(
        title.isEmpty ? context.tr('mobile.curriculum.lesson') : title,
        style: text.bodyMedium,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      ),
      subtitle: lesson.duration > 0
          ? Text(Formatters.duration(lesson.duration),
              style: text.labelSmall?.copyWith(color: colors.textMuted),)
          : null,
      trailing: locked
          ? Icon(Icons.lock_outline_rounded, size: 16, color: colors.textMuted)
          : (lesson.isAccessiblePreview
              ? Text(context.tr('mobile.curriculum.preview'),
                  style: text.labelSmall?.copyWith(color: colors.goldDark),)
              : null),
      ),
    );
  }
}

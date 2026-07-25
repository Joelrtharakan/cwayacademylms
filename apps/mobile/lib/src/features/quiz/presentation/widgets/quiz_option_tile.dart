import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';

/// A selectable answer option. In review mode it also paints correct/incorrect
/// state (green/red) regardless of selection.
class QuizOptionTile extends StatelessWidget {
  const QuizOptionTile({
    super.key,
    required this.label,
    required this.selected,
    this.onTap,
    this.state = QuizOptionState.neutral,
  });

  final String label;
  final bool selected;
  final VoidCallback? onTap;
  final QuizOptionState state;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;

    final (border, fill, icon, iconColor) = switch (state) {
      QuizOptionState.correct => (
          colors.success,
          colors.success.withValues(alpha: 0.08),
          Icons.check_circle_rounded,
          colors.success,
        ),
      QuizOptionState.incorrect => (
          colors.danger,
          colors.danger.withValues(alpha: 0.08),
          Icons.cancel_rounded,
          colors.danger,
        ),
      QuizOptionState.neutral => (
          selected ? colors.goldPrimary : colors.border,
          selected ? colors.goldPrimary.withValues(alpha: 0.06) : colors.surface,
          selected
              ? Icons.radio_button_checked_rounded
              : Icons.radio_button_unchecked_rounded,
          selected ? colors.goldPrimary : colors.textMuted,
        ),
    };

    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: AppRadii.rMd,
          child: Ink(
            decoration: BoxDecoration(
              color: fill,
              borderRadius: AppRadii.rMd,
              border: Border.all(color: border, width: selected ? 1.5 : 1),
            ),
            padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md, vertical: AppSpacing.md,),
            child: Row(
              children: [
                Icon(icon, size: 20, color: iconColor),
                const SizedBox(width: AppSpacing.md),
                Expanded(child: Text(label, style: text.bodyMedium)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

enum QuizOptionState { neutral, correct, incorrect }

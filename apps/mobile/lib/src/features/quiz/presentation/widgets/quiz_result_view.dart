import 'package:flutter/material.dart';

import '../../../../core/localization/localized_text.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../shared/widgets/primary_button.dart';
import '../../data/quiz_dto.dart';

/// Post-submission summary: score ring, pass/fail, per-question review, and
/// retake / done actions.
class QuizResultView extends StatelessWidget {
  const QuizResultView({
    super.key,
    required this.result,
    required this.onRetake,
    required this.onDone,
  });

  final QuizResultDto result;
  final VoidCallback? onRetake;
  final VoidCallback onDone;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final passColor = result.passed ? colors.success : colors.danger;

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        const SizedBox(height: AppSpacing.md),
        Center(
          child: Column(
            children: [
              Container(
                width: 120,
                height: 120,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: passColor.withValues(alpha: 0.10),
                  border: Border.all(color: passColor, width: 3),
                ),
                child: Text('${result.score.round()}%',
                    style: text.headlineMedium?.copyWith(color: passColor),),
              ),
              const SizedBox(height: AppSpacing.lg),
              Text(result.passed ? 'Passed 🎉' : 'Not passed',
                  style: text.headlineSmall?.copyWith(color: passColor),),
              const SizedBox(height: AppSpacing.xs),
              Text(
                'You scored ${result.earnedPoints}/${result.totalPoints} · pass mark ${result.passingScore}%',
                style: text.bodySmall?.copyWith(color: colors.textMuted),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.xl),
        Text('Review', style: text.titleLarge),
        const SizedBox(height: AppSpacing.md),
        for (var i = 0; i < result.results.length; i++)
          _ReviewCard(index: i + 1, item: result.results[i]),
        const SizedBox(height: AppSpacing.xl),
        if (onRetake != null) ...[
          PrimaryButton(
            label: 'Retake quiz',
            icon: Icons.refresh_rounded,
            variant: ButtonVariant.gold,
            onPressed: onRetake,
          ),
          const SizedBox(height: AppSpacing.sm),
        ],
        PrimaryButton(
          label: 'Done',
          variant: ButtonVariant.outline,
          onPressed: onDone,
        ),
      ],
    );
  }
}

class _ReviewCard extends StatelessWidget {
  const _ReviewCard({required this.index, required this.item});
  final int index;
  final QuizResultItemDto item;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final your = item.yourAnswer.resolveDynamicFor(context);
    final correct = item.correctAnswer.resolveDynamicFor(context);
    final questionText = item.questionText.resolveDynamicFor(context);
    final tint = item.isCorrect ? colors.success : colors.danger;

    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: AppRadii.rLg,
        border: Border.all(color: colors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(
                item.isCorrect ? Icons.check_circle_rounded : Icons.cancel_rounded,
                color: tint,
                size: 20,
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Text('$index. $questionText', style: text.titleSmall),
              ),
              Text('${item.pointsEarned}/${item.points}',
                  style: text.labelSmall?.copyWith(color: colors.textMuted),),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          if (your.isNotEmpty)
            _Line(label: 'Your answer', value: your, color: tint),
          if (!item.isCorrect && correct.isNotEmpty)
            _Line(label: 'Correct answer', value: correct, color: colors.success),
        ],
      ),
    );
  }
}

class _Line extends StatelessWidget {
  const _Line({required this.label, required this.value, required this.color});
  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return Padding(
      padding: const EdgeInsets.only(top: 2),
      child: Text.rich(TextSpan(children: [
        TextSpan(
            text: '$label: ',
            style: text.bodySmall?.copyWith(color: context.colors.textMuted),),
        TextSpan(
            text: value,
            style: text.bodySmall?.copyWith(color: color, fontWeight: FontWeight.w600),),
      ],),),
    );
  }
}

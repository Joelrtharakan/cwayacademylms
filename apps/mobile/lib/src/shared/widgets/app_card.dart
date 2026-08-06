import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimens.dart';

/// A surface card matching the website's bordered, softly-shadowed cards, with
/// an optional gold top accent and tap ripple. Keeps every screen's card markup
/// consistent and DRY.
class AppCard extends StatelessWidget {
  const AppCard({
    super.key,
    required this.child,
    this.onTap,
    this.padding = AppSpacing.card,
    this.goldAccent = false,
    this.borderRadius = AppRadii.rLg,
  });

  final Widget child;
  final VoidCallback? onTap;
  final EdgeInsets padding;
  final bool goldAccent;
  final BorderRadius borderRadius;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;

    final isLight = Theme.of(context).brightness == Brightness.light;
    final content = Container(
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: borderRadius,
        // Reference cards are borderless white with a soft shadow. On the dark
        // theme a hairline keeps navy cards legible against the navy background.
        border: isLight ? null : Border.all(color: colors.border),
        boxShadow: AppShadows.card(colors.forestDeep),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (goldAccent)
            Container(
              height: 4,
              decoration: BoxDecoration(
                gradient: colors.goldGradient,
                borderRadius: BorderRadius.vertical(top: borderRadius.topLeft),
              ),
            ),
          Padding(padding: padding, child: child),
        ],
      ),
    );

    if (onTap == null) return content;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: borderRadius,
        child: content,
      ),
    );
  }
}

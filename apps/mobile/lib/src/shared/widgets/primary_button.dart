import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimens.dart';

enum ButtonVariant { forest, gold, outline }

/// The primary CTA used across the app. Handles loading + disabled states,
/// optional leading icon, and the brand gold gradient — with a minimum 52px
/// touch target for accessibility.
class PrimaryButton extends StatefulWidget {
  const PrimaryButton({
    super.key,
    required this.label,
    this.onPressed,
    this.variant = ButtonVariant.forest,
    this.icon,
    this.isLoading = false,
    this.expand = true,
  });

  final String label;
  final VoidCallback? onPressed;
  final ButtonVariant variant;
  final IconData? icon;
  final bool isLoading;
  final bool expand;

  @override
  State<PrimaryButton> createState() => _PrimaryButtonState();
}

class _PrimaryButtonState extends State<PrimaryButton> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final enabled = widget.onPressed != null && !widget.isLoading;

    final child = AnimatedSwitcher(
      duration: AppMotion.fast,
      child: widget.isLoading
          ? const SizedBox(
              key: ValueKey('loading'),
              height: 20,
              width: 20,
              child: CircularProgressIndicator(
                strokeWidth: 2.2,
                valueColor: AlwaysStoppedAnimation(Colors.white),
              ),
            )
          : Row(
              key: const ValueKey('label'),
              mainAxisSize: MainAxisSize.min,
              children: [
                if (widget.icon != null) ...[
                  Icon(widget.icon, size: 18),
                  const SizedBox(width: AppSpacing.sm),
                ],
                Flexible(
                    child: Text(widget.label, overflow: TextOverflow.ellipsis),),
              ],
            ),
    );

    Widget buttonWidget;

    if (widget.variant == ButtonVariant.outline) {
      // Secondary button per the reference design system: deep-navy fill with a
      // warm-gold outline and light text.
      buttonWidget = Semantics(
        button: true,
        enabled: enabled,
        label: widget.label,
        child: Opacity(
          opacity: enabled ? 1 : 0.5,
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: enabled ? widget.onPressed : null,
              onHighlightChanged: (pressed) {
                if (enabled) setState(() => _isPressed = pressed);
              },
              borderRadius: AppRadii.rPill,
              child: Ink(
                decoration: BoxDecoration(
                  color: colors.forestDeep,
                  borderRadius: AppRadii.rPill,
                  border: Border.all(color: colors.goldPrimary, width: 1.5),
                ),
                child: Container(
                  width: widget.expand ? double.infinity : null,
                  height: AppSizes.buttonHeight,
                  alignment: Alignment.center,
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
                  child: DefaultTextStyle.merge(
                    style: Theme.of(context)
                        .textTheme
                        .labelLarge!
                        .copyWith(color: Colors.white),
                    child: IconTheme.merge(
                      data: IconThemeData(color: colors.goldPrimary),
                      child: child,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      );
    } else {
      final gradient = widget.variant == ButtonVariant.gold
          ? colors.warmGradient
          : colors.forestGradient;

      buttonWidget = Semantics(
        button: true,
        enabled: enabled,
        label: widget.label,
        child: Opacity(
          opacity: enabled ? 1 : 0.5,
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: enabled ? widget.onPressed : null,
              onHighlightChanged: (pressed) {
                if (enabled) {
                  setState(() => _isPressed = pressed);
                }
              },
              borderRadius: AppRadii.rPill,
              child: Ink(
                decoration: BoxDecoration(
                  gradient: gradient,
                  borderRadius: AppRadii.rPill,
                  boxShadow: enabled && widget.variant == ButtonVariant.gold
                      ? AppShadows.glow(colors.goldPrimary)
                      : null,
                ),
                child: Container(
                  width: widget.expand ? double.infinity : null,
                  height: AppSizes.buttonHeight,
                  alignment: Alignment.center,
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
                  child: DefaultTextStyle.merge(
                    style: Theme.of(context)
                        .textTheme
                        .labelLarge!
                        .copyWith(color: Colors.white),
                    child: IconTheme.merge(
                      data: const IconThemeData(color: Colors.white),
                      child: child,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      );
    }

    return AnimatedScale(
      scale: _isPressed ? 0.96 : 1.0,
      duration: const Duration(milliseconds: 100),
      curve: Curves.easeOutCubic,
      child: buttonWidget,
    );
  }
}

import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimens.dart';

/// A dependency-free shimmer used to build skeleton loaders. Respects the OS
/// "reduce motion" setting by falling back to a static placeholder.
class AppShimmer extends StatefulWidget {
  const AppShimmer({
    super.key,
    this.width,
    this.height = 16,
    this.borderRadius = AppRadii.rSm,
  });

  final double? width;
  final double height;
  final BorderRadius borderRadius;

  @override
  State<AppShimmer> createState() => _AppShimmerState();
}

class _AppShimmerState extends State<AppShimmer>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1200),
  )..repeat();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final base = colors.surfaceMuted;
    final highlight = Color.lerp(base, colors.surface, 0.6)!;
    final reduceMotion = MediaQuery.disableAnimationsOf(context);

    if (reduceMotion) {
      return _box(base, null);
    }

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        final t = _controller.value;
        return _box(
          base,
          LinearGradient(
            begin: Alignment(-1 - 2 * (1 - t), 0),
            end: Alignment(1 - 2 * (1 - t), 0),
            colors: [base, highlight, base],
            stops: const [0.35, 0.5, 0.65],
          ),
        );
      },
    );
  }

  Widget _box(Color base, Gradient? gradient) => Container(
        width: widget.width,
        height: widget.height,
        decoration: BoxDecoration(
          color: gradient == null ? base : null,
          gradient: gradient,
          borderRadius: widget.borderRadius,
        ),
      );
}

/// Convenience: a stack of shimmer lines for text-block skeletons.
class ShimmerLines extends StatelessWidget {
  const ShimmerLines({super.key, this.lines = 3, this.spacing = AppSpacing.sm});

  final int lines;
  final double spacing;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (var i = 0; i < lines; i++) ...[
          AppShimmer(width: i == lines - 1 ? 160 : double.infinity),
          if (i != lines - 1) SizedBox(height: spacing),
        ],
      ],
    );
  }
}

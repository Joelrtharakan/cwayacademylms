import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';

/// Course artwork with graceful fallbacks: cached remote image when a valid URL
/// exists, otherwise a branded forest→gold gradient with the course initial.
class CourseThumbnail extends StatelessWidget {
  const CourseThumbnail({
    super.key,
    required this.url,
    required this.title,
    this.width = 96,
    this.height = 96,
    this.radius = 16,
  });

  final String? url;
  final String title;
  final double width;
  final double height;
  final double radius;

  bool get _hasRemote => url != null && url!.startsWith('http');

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final border = BorderRadius.circular(radius);

    Widget fallback() => Container(
          width: width,
          height: height,
          decoration: BoxDecoration(
            gradient: colors.forestGradient,
            borderRadius: border,
          ),
          alignment: Alignment.center,
          child: Text(
            title.isNotEmpty ? title.characters.first.toUpperCase() : '•',
            style: TextStyle(
              color: colors.goldLight,
              fontSize: width * 0.36,
              fontWeight: FontWeight.w800,
            ),
          ),
        );

    if (!_hasRemote) return fallback();

    return ClipRRect(
      borderRadius: border,
      child: CachedNetworkImage(
        imageUrl: url!,
        width: width,
        height: height,
        fit: BoxFit.cover,
        // Decode at (roughly) display resolution to bound memory.
        memCacheWidth:
            (width * MediaQuery.devicePixelRatioOf(context)).round(),
        placeholder: (_, __) => Container(
          width: width,
          height: height,
          color: colors.surfaceMuted,
        ),
        errorWidget: (_, __, ___) => fallback(),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'app_colors.dart';

/// Type system using Poppins (per the reference design system) for a clean,
/// premium mobile experience.
class AppTypography {
  const AppTypography._();

  /// Noto script families used as glyph fallbacks after Poppins, which
  /// covers only Latin. Without these, Hindi/Tamil/Telugu/Kannada/Malayalam text
  /// renders as tofu boxes. Calling each GoogleFonts method once registers its
  /// loader so the engine can resolve the family by name at paint time.
  static final List<String> indicFallback = <String>[
    GoogleFonts.notoSansDevanagari().fontFamily!, // hi
    GoogleFonts.notoSansTamil().fontFamily!, // ta
    GoogleFonts.notoSansTelugu().fontFamily!, // te
    GoogleFonts.notoSansKannada().fontFamily!, // kn
    GoogleFonts.notoSansMalayalam().fontFamily!, // ml
  ];

  static TextStyle serif(TextStyle? base) => GoogleFonts.poppins(textStyle: base)
      .copyWith(fontFamilyFallback: indicFallback);
  static TextStyle sans(TextStyle? base) => GoogleFonts.poppins(textStyle: base)
      .copyWith(fontFamilyFallback: indicFallback);

  static TextTheme textTheme(AppColors colors) {
    TextStyle display(double size, {double height = 1.15, FontWeight weight = FontWeight.w700}) =>
        GoogleFonts.poppins(
          fontSize: size,
          fontWeight: weight,
          height: height,
          color: colors.textPrimary,
          letterSpacing: -0.3,
        ).copyWith(fontFamilyFallback: indicFallback);

    TextStyle body(double size,
            {FontWeight weight = FontWeight.w400,
            double height = 1.45,
            Color? color,}) =>
        GoogleFonts.poppins(
          fontSize: size,
          fontWeight: weight,
          height: height,
          color: color ?? colors.textPrimary,
        ).copyWith(fontFamilyFallback: indicFallback);

    return TextTheme(
      displayLarge: display(44, height: 1.1, weight: FontWeight.w800),
      displayMedium: display(36, weight: FontWeight.w800),
      displaySmall: display(28, weight: FontWeight.w700),
      headlineLarge: display(24, weight: FontWeight.w700),
      headlineMedium: display(22, weight: FontWeight.w700),
      headlineSmall: display(18, weight: FontWeight.w700),
      titleLarge: body(18, weight: FontWeight.w700, height: 1.3),
      titleMedium: body(16, weight: FontWeight.w600, height: 1.35),
      titleSmall: body(14, weight: FontWeight.w600, height: 1.35),
      bodyLarge: body(16, weight: FontWeight.w400),
      bodyMedium: body(14, weight: FontWeight.w400),
      bodySmall: body(12, weight: FontWeight.w500, color: colors.textSecondary),
      labelLarge: body(14, weight: FontWeight.w700, height: 1.2),
      labelMedium: body(12, weight: FontWeight.w600, height: 1.2),
      labelSmall: body(11, weight: FontWeight.w600, height: 1.2, color: colors.textSecondary),
    );
  }
}

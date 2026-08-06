import 'package:flutter/material.dart';

/// Brand color tokens, mapped 1:1 from the website's CSS custom properties
/// (apps/web/src/app/globals.css `:root`). Exposed as a ThemeExtension so any
/// widget can read semantic brand colors via `context.colors` regardless of
/// the active light/dark theme.
@immutable
class AppColors extends ThemeExtension<AppColors> {
  const AppColors({
    required this.goldPrimary,
    required this.goldDark,
    required this.goldLight,
    required this.goldPale,
    required this.forestDeep,
    required this.forestMid,
    required this.forestLight,
    required this.background,
    required this.surface,
    required this.surfaceMuted,
    required this.surfaceElevated,
    required this.surfaceGlass,
    required this.textPrimary,
    required this.textSecondary,
    required this.textMuted,
    required this.border,
    required this.success,
    required this.warning,
    required this.danger,
    required this.shimmerBase,
    required this.shimmerHighlight,
  });

  final Color goldPrimary;
  final Color goldDark;
  final Color goldLight;
  final Color goldPale;
  final Color forestDeep;
  final Color forestMid;
  final Color forestLight;
  final Color background;
  final Color surface;
  final Color surfaceMuted;
  final Color surfaceElevated;
  final Color surfaceGlass;
  final Color textPrimary;
  final Color textSecondary;
  final Color textMuted;
  final Color border;
  final Color success;
  final Color warning;
  final Color danger;
  final Color shimmerBase;
  final Color shimmerHighlight;

  /// The signature gold → forest gradient used for premium CTAs and hero cards.
  LinearGradient get goldGradient => LinearGradient(
        colors: [goldLight, goldPrimary, goldDark],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );

  LinearGradient get forestGradient => LinearGradient(
        colors: [forestMid, forestDeep],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );

  LinearGradient get warmGradient => LinearGradient(
        colors: [goldLight, goldPrimary],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );

  // ── Deep Navy + Warm Gold brand palette ─────────────────────────────────────
  // Matches the CWAY Academy design reference: deep-navy / midnight-blue premium
  // surfaces, warm-gold CTAs and accents, white cards, and soft-gray neutrals.
  // `gold*` = the warm gold ramp, `forest*` = the navy/midnight header ramp.
  // All foreground/background pairings meet WCAG AA contrast.
  // Reference design-system tokens (exact): deep navy #0B1D33, midnight blue
  // #122A4D, white #FFFFFF, warm gold #F5B12D, light gray #E6EBED.
  static const light = AppColors(
    goldPrimary: Color(0xFFF5B12D), // warm gold — primary CTA / accent
    goldDark: Color(0xFFD2951C), // pressed / gold text on light (AA)
    goldLight: Color(0xFFF8C55E), // highlight / accent on dark surfaces
    goldPale: Color(0xFFFEF4DC), // subtle gold tint fill
    forestDeep: Color(0xFF0B1D33), // deep navy — header gradient base
    forestMid: Color(0xFF122A4D), // midnight blue — header gradient
    forestLight: Color(0xFF1E3A5F), // muted navy
    background: Color(0xFFF5F7F9), // soft gray app background
    surface: Color(0xFFFFFFFF), // white cards
    surfaceMuted: Color(0xFFEDF0F3), // input / chip fill (light gray)
    surfaceElevated: Color(0xFFFFFFFF),
    surfaceGlass: Color(0xCCFFFFFF),
    textPrimary: Color(0xFF0B1D33), // deep navy ink
    textSecondary: Color(0xFF44566E), // slate navy
    textMuted: Color(0xFF8A97A8), // soft gray
    border: Color(0xFFE6EBED), // light gray hairline
    success: Color(0xFF16A34A),
    warning: Color(0xFFD97706),
    danger: Color(0xFFDC2626),
    shimmerBase: Color(0xFFE6EBED),
    shimmerHighlight: Color(0xFFF2F5F8),
  );

  static const dark = AppColors(
    goldPrimary: Color(0xFFF5B12D), // warm gold — primary CTA / accent
    goldDark: Color(0xFFD2951C), // pressed
    goldLight: Color(0xFFF8C55E), // highlight / links
    goldPale: Color(0xFF2A2110), // subtle gold tint fill
    forestDeep: Color(0xFF071426), // deepest navy — header gradient base
    forestMid: Color(0xFF122A4D), // midnight blue — header gradient
    forestLight: Color(0xFF1E3A5F), // muted navy
    background: Color(0xFF0B1D33), // deep navy app background
    surface: Color(0xFF122A4D), // midnight-blue cards
    surfaceMuted: Color(0xFF0E2340), // input / chip fill
    surfaceElevated: Color(0xFF17355C), // elevated cards / sheets
    surfaceGlass: Color(0xCC0E2340),
    textPrimary: Color(0xFFF3F6FB), // near-white ink
    textSecondary: Color(0xFFC0CBDA), // light slate
    textMuted: Color(0xFF8697AC), // soft gray
    border: Color(0xFF25405F), // hairline on navy
    success: Color(0xFF22C55E),
    warning: Color(0xFFF59E0B),
    danger: Color(0xFFEF4444),
    shimmerBase: Color(0xFF122A4D),
    shimmerHighlight: Color(0xFF17355C),
  );

  @override
  AppColors copyWith({
    Color? goldPrimary,
    Color? goldDark,
    Color? goldLight,
    Color? goldPale,
    Color? forestDeep,
    Color? forestMid,
    Color? forestLight,
    Color? background,
    Color? surface,
    Color? surfaceMuted,
    Color? surfaceElevated,
    Color? surfaceGlass,
    Color? textPrimary,
    Color? textSecondary,
    Color? textMuted,
    Color? border,
    Color? success,
    Color? warning,
    Color? danger,
    Color? shimmerBase,
    Color? shimmerHighlight,
  }) {
    return AppColors(
      goldPrimary: goldPrimary ?? this.goldPrimary,
      goldDark: goldDark ?? this.goldDark,
      goldLight: goldLight ?? this.goldLight,
      goldPale: goldPale ?? this.goldPale,
      forestDeep: forestDeep ?? this.forestDeep,
      forestMid: forestMid ?? this.forestMid,
      forestLight: forestLight ?? this.forestLight,
      background: background ?? this.background,
      surface: surface ?? this.surface,
      surfaceMuted: surfaceMuted ?? this.surfaceMuted,
      surfaceElevated: surfaceElevated ?? this.surfaceElevated,
      surfaceGlass: surfaceGlass ?? this.surfaceGlass,
      textPrimary: textPrimary ?? this.textPrimary,
      textSecondary: textSecondary ?? this.textSecondary,
      textMuted: textMuted ?? this.textMuted,
      border: border ?? this.border,
      success: success ?? this.success,
      warning: warning ?? this.warning,
      danger: danger ?? this.danger,
      shimmerBase: shimmerBase ?? this.shimmerBase,
      shimmerHighlight: shimmerHighlight ?? this.shimmerHighlight,
    );
  }

  @override
  AppColors lerp(ThemeExtension<AppColors>? other, double t) {
    if (other is! AppColors) return this;
    return AppColors(
      goldPrimary: Color.lerp(goldPrimary, other.goldPrimary, t)!,
      goldDark: Color.lerp(goldDark, other.goldDark, t)!,
      goldLight: Color.lerp(goldLight, other.goldLight, t)!,
      goldPale: Color.lerp(goldPale, other.goldPale, t)!,
      forestDeep: Color.lerp(forestDeep, other.forestDeep, t)!,
      forestMid: Color.lerp(forestMid, other.forestMid, t)!,
      forestLight: Color.lerp(forestLight, other.forestLight, t)!,
      background: Color.lerp(background, other.background, t)!,
      surface: Color.lerp(surface, other.surface, t)!,
      surfaceMuted: Color.lerp(surfaceMuted, other.surfaceMuted, t)!,
      surfaceElevated: Color.lerp(surfaceElevated, other.surfaceElevated, t)!,
      surfaceGlass: Color.lerp(surfaceGlass, other.surfaceGlass, t)!,
      textPrimary: Color.lerp(textPrimary, other.textPrimary, t)!,
      textSecondary: Color.lerp(textSecondary, other.textSecondary, t)!,
      textMuted: Color.lerp(textMuted, other.textMuted, t)!,
      border: Color.lerp(border, other.border, t)!,
      success: Color.lerp(success, other.success, t)!,
      warning: Color.lerp(warning, other.warning, t)!,
      danger: Color.lerp(danger, other.danger, t)!,
      shimmerBase: Color.lerp(shimmerBase, other.shimmerBase, t)!,
      shimmerHighlight: Color.lerp(shimmerHighlight, other.shimmerHighlight, t)!,
    );
  }
}

/// Ergonomic access: `context.colors.goldPrimary`.
extension AppColorsX on BuildContext {
  AppColors get colors =>
      Theme.of(this).extension<AppColors>() ?? AppColors.light;
}

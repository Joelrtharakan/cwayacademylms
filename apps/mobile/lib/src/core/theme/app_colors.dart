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

  static const light = AppColors(
    goldPrimary: Color(0xFFC9973A),
    goldDark: Color(0xFFA8792A),
    goldLight: Color(0xFFE8B85A),
    goldPale: Color(0xFFF7F3E9),
    forestDeep: Color(0xFF142417),
    forestMid: Color(0xFF1E3A2B),
    forestLight: Color(0xFF3B6E4C),
    background: Color(0xFFFAFAF7), // Soft Ivory / Warm White
    surface: Color(0xFFFFFFFF),
    surfaceMuted: Color(0xFFF1F5F9),
    surfaceElevated: Color(0xFFFFFFFF),
    surfaceGlass: Color(0xCCFFFFFF),
    textPrimary: Color(0xFF0F172A), // Deep Slate Ink
    textSecondary: Color(0xFF334155), // Dark Slate
    textMuted: Color(0xFF475569), // Medium Slate (High legibility)
    border: Color(0xFFCBD5E1), // Defined Slate Border
    success: Color(0xFF059669),
    warning: Color(0xFFD97706),
    danger: Color(0xFFDC2626),
    shimmerBase: Color(0xFFE2E8F0),
    shimmerHighlight: Color(0xFFF8FAFC),
  );

  static const dark = AppColors(
    goldPrimary: Color(0xFFD4A345),
    goldDark: Color(0xFFB3832B),
    goldLight: Color(0xFFE5B869),
    goldPale: Color(0xFF2A2315),
    forestDeep: Color(0xFF0D140E),
    forestMid: Color(0xFF152217),
    forestLight: Color(0xFF2D4B34),
    background: Color(0xFF0A0F0B),
    surface: Color(0xFF121B13),
    surfaceMuted: Color(0xFF1A261C),
    surfaceElevated: Color(0xFF152217),
    surfaceGlass: Color(0xCC121B13),
    textPrimary: Color(0xFFF8F5EF),
    textSecondary: Color(0xFF94A3B8),
    textMuted: Color(0xFF64748B),
    border: Color(0xFF1E2D20),
    success: Color(0xFF10B981),
    warning: Color(0xFFF59E0B),
    danger: Color(0xFFEF4444),
    shimmerBase: Color(0xFF1A261C),
    shimmerHighlight: Color(0xFF253728),
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

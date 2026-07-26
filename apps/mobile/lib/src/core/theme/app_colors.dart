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

  // ── Blue / slate SaaS palette (Linear / Vercel / GitHub-style) ──────────────
  // Token names are kept for compatibility across the app: `gold*` now carries
  // the blue primary ramp, `forest*` the premium navy header ramp, and the
  // neutrals are a slate scale. All pairings meet WCAG AA contrast.
  static const light = AppColors(
    goldPrimary: Color(0xFF2563EB), // primary (blue-600)
    goldDark: Color(0xFF1D4ED8), // primary hover (blue-700)
    goldLight: Color(0xFF3B82F6), // accent on dark surfaces (blue-500)
    goldPale: Color(0xFFEFF6FF), // subtle primary tint (blue-50)
    forestDeep: Color(0xFF0B1220), // header gradient (deep navy)
    forestMid: Color(0xFF1E293B), // header gradient (slate-800)
    forestLight: Color(0xFF334155), // slate-700
    background: Color(0xFFFAFAFB),
    surface: Color(0xFFFFFFFF),
    surfaceMuted: Color(0xFFF1F5F9), // input / chip fill (slate-100)
    surfaceElevated: Color(0xFFFFFFFF),
    surfaceGlass: Color(0xCCFFFFFF),
    textPrimary: Color(0xFF111827), // gray-900
    textSecondary: Color(0xFF374151), // gray-700
    textMuted: Color(0xFF6B7280), // gray-500
    border: Color(0xFFE5E7EB), // gray-200
    success: Color(0xFF16A34A),
    warning: Color(0xFFD97706),
    danger: Color(0xFFDC2626),
    shimmerBase: Color(0xFFE5E7EB),
    shimmerHighlight: Color(0xFFF3F4F6),
  );

  static const dark = AppColors(
    goldPrimary: Color(0xFF3B82F6), // primary (blue-500)
    goldDark: Color(0xFF2563EB), // pressed (blue-600)
    goldLight: Color(0xFF60A5FA), // accent / links (blue-400)
    goldPale: Color(0xFF172033), // subtle primary tint
    forestDeep: Color(0xFF0B0F14), // header gradient (base)
    forestMid: Color(0xFF111827), // header gradient (surface)
    forestLight: Color(0xFF334155), // slate-700
    background: Color(0xFF0B0F14), // layered, not pure black
    surface: Color(0xFF1A2233), // cards
    surfaceMuted: Color(0xFF111827), // input / chip fill
    surfaceElevated: Color(0xFF222C3D), // elevated cards / sheets
    surfaceGlass: Color(0xCC111827),
    textPrimary: Color(0xFFF8FAFC), // slate-50
    textSecondary: Color(0xFFCBD5E1), // slate-300
    textMuted: Color(0xFF94A3B8), // slate-400
    border: Color(0xFF334155), // slate-700
    success: Color(0xFF22C55E),
    warning: Color(0xFFF59E0B),
    danger: Color(0xFFEF4444),
    shimmerBase: Color(0xFF1A2233),
    shimmerHighlight: Color(0xFF222C3D),
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

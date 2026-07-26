import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

import 'app_colors.dart';
import 'app_dimens.dart';
import 'app_typography.dart';

/// Central ThemeData factory. Component themes (buttons, inputs, cards, sheets)
/// are configured once here so screens stay free of styling boilerplate.
class AppTheme {
  const AppTheme._();

  static ThemeData light() => _build(AppColors.light, Brightness.light);
  static ThemeData dark() => _build(AppColors.dark, Brightness.dark);

  static ThemeData _build(AppColors c, Brightness brightness) {
    final colorScheme = ColorScheme(
      brightness: brightness,
      primary: c.goldPrimary,
      onPrimary: Colors.white,
      secondary: c.goldLight,
      onSecondary: Colors.white,
      surface: c.surface,
      onSurface: c.textPrimary,
      surfaceContainerHighest: c.surfaceMuted,
      error: c.danger,
      onError: Colors.white,
      outline: c.border,
    );

    final textTheme = AppTypography.textTheme(c);

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      scaffoldBackgroundColor: c.background,
      colorScheme: colorScheme,
      textTheme: textTheme,
      extensions: <ThemeExtension<dynamic>>[c],
      splashFactory: InkSparkle.splashFactory,

      appBarTheme: AppBarTheme(
        backgroundColor: c.background,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0, // Keep clean
        centerTitle: false,
        titleTextStyle: textTheme.titleLarge,
        iconTheme: IconThemeData(color: c.textPrimary),
      ),

      cardTheme: CardThemeData(
        color: c.surfaceElevated,
        surfaceTintColor: Colors.transparent,
        elevation: 0, // We use custom shadows instead of Material elevation
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: AppRadii.rLg,
          side: BorderSide(
            color: brightness == Brightness.light 
                ? c.border.withValues(alpha: 0.5) 
                : c.border,
          ),
        ),
      ),

      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: c.forestDeep,
          foregroundColor: Colors.white,
          minimumSize: const Size.fromHeight(AppSizes.buttonHeight),
          elevation: 0,
          textStyle: textTheme.labelLarge,
          shape: const RoundedRectangleBorder(borderRadius: AppRadii.rPill),
        ),
      ),

      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: c.textPrimary,
          minimumSize: const Size.fromHeight(AppSizes.buttonHeight),
          side: BorderSide(color: c.border),
          textStyle: textTheme.labelLarge,
          shape: const RoundedRectangleBorder(borderRadius: AppRadii.rPill),
        ),
      ),

      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: c.goldDark,
          textStyle: textTheme.labelLarge,
          minimumSize: const Size(AppSizes.minTouchTarget, AppSizes.minTouchTarget),
        ),
      ),

      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: c.surfaceMuted,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.lg),
        hintStyle: textTheme.bodyMedium?.copyWith(color: c.textMuted),
        border: OutlineInputBorder(
          borderRadius: AppRadii.rMd,
          borderSide: BorderSide(color: c.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: AppRadii.rMd,
          borderSide: BorderSide(
            color: brightness == Brightness.light ? Colors.transparent : c.border,
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: AppRadii.rMd,
          borderSide: BorderSide(color: c.goldPrimary, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: AppRadii.rMd,
          borderSide: BorderSide(color: c.danger),
        ),
      ),

      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: c.surfaceElevated,
        surfaceTintColor: Colors.transparent,
        showDragHandle: true,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadii.xl)),
        ),
      ),
      
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: c.surfaceElevated.withValues(alpha: 0.95),
        indicatorColor: Colors.transparent, // Custom indicator in code
        elevation: 0,
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return textTheme.labelSmall!.copyWith(color: c.goldPrimary);
          }
          return textTheme.labelSmall!.copyWith(color: c.textMuted);
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return IconThemeData(color: c.goldPrimary, size: 26);
          }
          return IconThemeData(color: c.textMuted, size: 24);
        }),
      ),

      dividerTheme: DividerThemeData(color: c.border, thickness: 1, space: 1),

      chipTheme: ChipThemeData(
        backgroundColor: c.surfaceMuted,
        side: BorderSide(
          color: brightness == Brightness.light ? Colors.transparent : c.border,
        ),
        labelStyle: textTheme.labelMedium,
        shape: const RoundedRectangleBorder(borderRadius: AppRadii.rPill),
      ),

      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: c.forestDeep,
        contentTextStyle: textTheme.bodyMedium?.copyWith(color: Colors.white),
        shape: const RoundedRectangleBorder(borderRadius: AppRadii.rMd),
      ),

      pageTransitionsTheme: const PageTransitionsTheme(
        builders: {
          TargetPlatform.android: PredictiveBackPageTransitionsBuilder(),
          TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
          TargetPlatform.macOS: CupertinoPageTransitionsBuilder(),
        },
      ),
    );
  }
}

import 'package:flutter/material.dart';

/// Spacing, radius and elevation tokens. Radii mirror the website
/// (`--radius-sm..xl` = 6/12/20/32). Spacing follows a 4pt base grid.
class AppSpacing {
  const AppSpacing._();
  static const double xxs = 2;
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 24;
  static const double xxl = 32;
  static const double xxxl = 48;

  static const EdgeInsets screen = EdgeInsets.symmetric(horizontal: lg);
  static const EdgeInsets card = EdgeInsets.all(xl);
}

class AppRadii {
  const AppRadii._();
  // Vibrant direction: rounder, friendlier shapes throughout.
  static const double sm = 10;
  static const double md = 16;
  static const double lg = 24;
  static const double xl = 30;
  static const double pill = 999;

  static const BorderRadius rSm = BorderRadius.all(Radius.circular(sm));
  static const BorderRadius rMd = BorderRadius.all(Radius.circular(md));
  static const BorderRadius rLg = BorderRadius.all(Radius.circular(lg));
  static const BorderRadius rXl = BorderRadius.all(Radius.circular(xl));
  static const BorderRadius rPill = BorderRadius.all(Radius.circular(pill));
}

/// Minimum interactive size — WCAG 2.5.5 / accessibility requirement.
class AppSizes {
  const AppSizes._();
  static const double minTouchTarget = 48;
  static const double buttonHeight = 52;
  static const double inputHeight = 52;
}

class AppShadows {
  const AppShadows._();

  static List<BoxShadow> sm(Color base) => [
        BoxShadow(
          color: base.withValues(alpha: 0.06),
          blurRadius: 8,
          offset: const Offset(0, 2),
        ),
      ];

  static List<BoxShadow> md(Color base) => [
        BoxShadow(
          color: base.withValues(alpha: 0.08),
          blurRadius: 24,
          offset: const Offset(0, 4),
        ),
      ];

  static List<BoxShadow> lg(Color base) => [
        BoxShadow(
          color: base.withValues(alpha: 0.12),
          blurRadius: 40,
          offset: const Offset(0, 8),
        ),
      ];
      
  static List<BoxShadow> card(Color base) => [
        BoxShadow(
          color: base.withValues(alpha: 0.08),
          blurRadius: 24,
          offset: const Offset(0, 8),
        ),
        BoxShadow(
          color: base.withValues(alpha: 0.03),
          blurRadius: 8,
          offset: const Offset(0, 4),
        ),
      ];
      
  static List<BoxShadow> glow(Color base) => [
        BoxShadow(
          color: base.withValues(alpha: 0.25),
          blurRadius: 20,
          spreadRadius: 2,
        ),
      ];

  static List<BoxShadow> glass(Color base) => [
        BoxShadow(
          color: base.withValues(alpha: 0.15),
          blurRadius: 32,
          spreadRadius: -4,
          offset: const Offset(0, 16),
        ),
      ];
}

class AppMotion {
  const AppMotion._();
  static const Duration fast = Duration(milliseconds: 150);
  static const Duration base = Duration(milliseconds: 250);
  static const Duration slow = Duration(milliseconds: 400);
  static const Curve curve = Cubic(0.4, 0, 0.2, 1);
}

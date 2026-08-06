import 'package:flutter/material.dart';

import '../../core/i18n/i18n_extension.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimens.dart';

/// Semantic tone for a [StatusBadge]. Maps to brand colours so badges stay
/// consistent everywhere (course status, user roles, verification, etc.).
enum BadgeTone { neutral, gold, forest, success, warning, danger }

/// A compact pill label used across the app for statuses, roles and tags.
/// Replaces the ad-hoc badge widgets that were duplicated per screen.
class StatusBadge extends StatelessWidget {
  const StatusBadge({
    super.key,
    required this.label,
    this.tone = BadgeTone.neutral,
    this.icon,
    this.dense = false,
    this.labelKey,
  });

  final String label;
  final BadgeTone tone;
  final IconData? icon;
  final bool dense;

  /// When set, the label is resolved from this translation key at build time so
  /// factory-produced badges (course status, roles) localize reactively.
  final String? labelKey;

  /// Maps a backend course status string to a labelled, toned badge.
  factory StatusBadge.courseStatus(String status, {bool dense = false}) {
    return switch (status) {
      'PUBLISHED' => StatusBadge(
          label: 'Published', labelKey: 'mobile.status.published', tone: BadgeTone.success, dense: dense,),
      'DRAFT' => StatusBadge(label: 'Draft', labelKey: 'mobile.status.draft', dense: dense),
      'PENDING' || 'PENDING_REVIEW' => StatusBadge(
          label: 'In review', labelKey: 'mobile.status.inReview', tone: BadgeTone.warning, dense: dense,),
      'ARCHIVED' => StatusBadge(
          label: 'Archived', labelKey: 'mobile.status.archived', tone: BadgeTone.danger, dense: dense,),
      _ => StatusBadge(label: status, dense: dense),
    };
  }

  /// Maps a user role to a toned badge.
  factory StatusBadge.role(String role, {bool dense = true}) {
    final labelKey = switch (role.toUpperCase()) {
      'ADMIN' => 'admin.users.roleAdmin',
      'REGISTRAR' => 'admin.sidebar.registrar',
      'INSTRUCTOR' => 'admin.users.roleInstructor',
      'STUDENT' => 'admin.users.roleStudent',
      _ => null,
    };
    final tone = switch (role.toUpperCase()) {
      'ADMIN' => BadgeTone.gold,
      'REGISTRAR' => BadgeTone.gold,
      'INSTRUCTOR' => BadgeTone.forest,
      _ => BadgeTone.neutral,
    };
    final fallback = role.isEmpty
        ? role
        : role[0].toUpperCase() + role.substring(1).toLowerCase();
    return StatusBadge(label: fallback, labelKey: labelKey, tone: tone, dense: dense);
  }

  (Color, Color) _colors(AppColors c) => switch (tone) {
        BadgeTone.gold => (c.goldPrimary.withValues(alpha: 0.16), c.goldDark),
        BadgeTone.forest =>
          (c.forestLight.withValues(alpha: 0.16), c.forestMid),
        BadgeTone.success => (c.success.withValues(alpha: 0.14), c.success),
        BadgeTone.warning => (c.warning.withValues(alpha: 0.16), c.warning),
        BadgeTone.danger => (c.danger.withValues(alpha: 0.14), c.danger),
        BadgeTone.neutral => (c.surfaceMuted, c.textSecondary),
      };

  @override
  Widget build(BuildContext context) {
    final (bg, fg) = _colors(context.colors);
    final resolved = labelKey != null ? context.tr(labelKey!) : label;
    final fontSize = dense ? 10.0 : 11.0;
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: dense ? AppSpacing.sm : AppSpacing.md,
        vertical: dense ? 2 : 4,
      ),
      decoration: BoxDecoration(color: bg, borderRadius: AppRadii.rPill),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: fontSize + 3, color: fg),
            const SizedBox(width: 4),
          ],
          Text(
            resolved,
            style: TextStyle(
              color: fg,
              fontSize: fontSize,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.2,
            ),
          ),
        ],
      ),
    );
  }
}

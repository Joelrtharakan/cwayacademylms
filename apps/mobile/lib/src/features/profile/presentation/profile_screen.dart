import 'package:cached_network_image/cached_network_image.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/i18n/app_translations.dart';
import '../../../core/i18n/i18n_extension.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/router/app_router.dart';
import '../../../core/security/biometric_service.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';
import '../../auth/application/auth_controller.dart';
import '../../auth/domain/app_user.dart';
import '../../settings/application/theme_controller.dart';
import '../../settings/presentation/settings_screen.dart' show showLanguageSelector;
import '../data/profile_repository.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  bool _uploadingAvatar = false;
  bool _biometricBusy = false;

  Future<void> _changeAvatar() async {
    final result = await FilePicker.platform.pickFiles(type: FileType.image);
    if (result == null || result.files.isEmpty) return;
    final file = result.files.first;
    if (file.path == null) return;

    setState(() => _uploadingAvatar = true);
    try {
      await ref.read(profileRepositoryProvider).uploadAvatar(
            filePath: file.path!,
            fileName: file.name,
          );
      await ref.read(authControllerProvider.notifier).refreshUser();
      _snack(AppTranslations.tg('mobile.profile.avatarUpdated'));
    } on ApiException catch (e) {
      _snack(e.message);
    } finally {
      if (mounted) setState(() => _uploadingAvatar = false);
    }
  }

  Future<void> _toggleBiometric(bool value) async {
    final service = ref.read(biometricServiceProvider);
    setState(() => _biometricBusy = true);
    try {
      if (value) {
        if (!await service.isAvailable()) {
          _snack(AppTranslations.tg('mobile.profile.biometricUnavailable'));
          return;
        }
        if (!await service.authenticate(reason: AppTranslations.tg('mobile.profile.biometricReason'))) return;
      }
      await service.setEnabled(value);
    } finally {
      if (mounted) setState(() => _biometricBusy = false);
    }
  }

  void _snack(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(msg)));
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final user = ref.watch(currentUserProvider);
    final mode = ref.watch(themeModeControllerProvider);
    final biometricEnabled = ref.watch(biometricServiceProvider).isEnabled;

    if (user == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      backgroundColor: colors.background,
      body: ListView(
        padding: const EdgeInsets.only(bottom: 140),
        children: [
          _ProfileHeader(
            user: user,
            roleLabel: _roleLabel(context, user.role),
            busy: _uploadingAvatar,
            onEditAvatar: _changeAvatar,
            onEditProfile: () => context.push(AppRoutes.profileEdit),
          ),
          const SizedBox(height: AppSpacing.xl),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
          _Section(title: context.tr('mobile.profile.personalInfo'), children: [
            if ((user.church ?? '').isNotEmpty)
              _InfoRow(icon: Icons.church_outlined, label: context.tr('auth.register.church'), value: user.church!),
            if ((user.location ?? '').isNotEmpty)
              _InfoRow(icon: Icons.place_outlined, label: context.tr('auth.register.location'), value: user.location!),
            if ((user.phone ?? '').isNotEmpty)
              _InfoRow(icon: Icons.phone_outlined, label: context.tr('mobile.profile.phone'), value: user.phone!),
            if ((user.bio ?? '').isNotEmpty)
              _InfoRow(icon: Icons.info_outline_rounded, label: context.tr('mobile.profile.bio'), value: user.bio!),
            if ((user.church ?? '').isEmpty &&
                (user.location ?? '').isEmpty &&
                (user.phone ?? '').isEmpty &&
                (user.bio ?? '').isEmpty)
              _InfoRow(
                icon: Icons.edit_note_rounded,
                label: context.tr('mobile.profile.completeTitle'),
                value: context.tr('mobile.profile.completeValue'),
              ),
          ],),
          const SizedBox(height: AppSpacing.lg),
          _Section(title: context.tr('mobile.profile.appearance'), children: [
            _ThemeToggle(
              mode: mode,
              onChanged: (m) =>
                  ref.read(themeModeControllerProvider.notifier).set(m),
            ),
          ],),
          const SizedBox(height: AppSpacing.lg),
          _Section(title: context.tr('mobile.profile.security'), children: [
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              secondary: Icon(Icons.fingerprint_rounded, color: colors.goldPrimary),
              title: Text(context.tr('mobile.profile.biometricUnlock')),
              subtitle: Text(context.tr('mobile.profile.biometricDesc')),
              value: biometricEnabled,
              onChanged: _biometricBusy ? null : _toggleBiometric,
            ),
          ],),
          const SizedBox(height: AppSpacing.lg),
          _Section(
            title: context.tr('mobile.profile.support'),
            children: [
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: Icon(Icons.headphones_outlined, color: colors.goldPrimary),
                title: Text(context.tr('mobile.profile.help')),
                trailing: const Icon(Icons.chevron_right_rounded),
                onTap: () => _showSupportModal(
                  context,
                  title: context.tr('mobile.profile.help'),
                  content: context.tr('mobile.profile.helpContent'),
                  icon: Icons.headset_mic_rounded,
                ),
              ),
              Divider(height: 1, color: colors.border),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: Icon(Icons.shield_outlined, color: colors.goldPrimary),
                title: Text(context.tr('mobile.profile.privacy')),
                trailing: const Icon(Icons.chevron_right_rounded),
                onTap: () => _showSupportModal(
                  context,
                  title: context.tr('mobile.profile.privacy'),
                  content: context.tr('mobile.profile.privacyContent'),
                  icon: Icons.verified_user_rounded,
                ),
              ),
              Divider(height: 1, color: colors.border),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: Icon(Icons.description_outlined, color: colors.goldPrimary),
                title: Text(context.tr('mobile.profile.terms')),
                trailing: const Icon(Icons.chevron_right_rounded),
                onTap: () => _showSupportModal(
                  context,
                  title: context.tr('mobile.profile.terms'),
                  content: context.tr('mobile.profile.termsContent'),
                  icon: Icons.article_rounded,
                ),
              ),
              Divider(height: 1, color: colors.border),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: Icon(Icons.info_outline_rounded, color: colors.goldPrimary),
                title: Text(context.tr('mobile.profile.about')),
                trailing: const Icon(Icons.chevron_right_rounded),
                onTap: () => _showSupportModal(
                  context,
                  title: context.tr('mobile.profile.about'),
                  content: context.tr('mobile.profile.aboutContent'),
                  icon: Icons.school_rounded,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          Material(
            color: colors.surfaceElevated,
            borderRadius: AppRadii.rLg,
            elevation: 2,
            shadowColor: colors.forestDeep.withValues(alpha: 0.1),
            clipBehavior: Clip.antiAlias,
            child: Column(
              children: [
                ListTile(
                  leading: Icon(Icons.download_outlined, color: colors.goldPrimary),
                  title: Text(context.tr('mobile.downloads.title')),
                  trailing: const Icon(Icons.chevron_right_rounded),
                  onTap: () => context.push(AppRoutes.downloads),
                ),
                Divider(height: 1, color: colors.border),
                ListTile(
                  leading: Icon(Icons.settings_outlined, color: colors.goldPrimary),
                  title: Text(context.tr('mobile.settings.title')),
                  trailing: const Icon(Icons.chevron_right_rounded),
                  onTap: () => context.push(AppRoutes.settings),
                ),
                Divider(height: 1, color: colors.border),
                ListTile(
                  leading: Icon(Icons.language_rounded, color: colors.goldPrimary),
                  title: Text(context.tr('mobile.settings.language')),
                  trailing: const Icon(Icons.chevron_right_rounded),
                  onTap: () => showLanguageSelector(context, ref),
                ),
                Divider(height: 1, color: colors.border),
                ListTile(
                  leading: Icon(Icons.logout_rounded, color: colors.danger),
                  title: Text(context.tr('student.sidebar.signOut'), style: TextStyle(color: colors.danger)),
                  onTap: () =>
                      ref.read(authControllerProvider.notifier).signOut(),
                ),
              ],
            ),
          ),
              ].animate(interval: 50.ms).fade(duration: 300.ms).slideY(begin: 0.1, duration: 300.ms, curve: Curves.easeOutQuad),
            ),
          ),
        ],
      ),
    );
  }

  void _showSupportModal(
    BuildContext context, {
    required String title,
    required String content,
    required IconData icon,
  }) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;

    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.xl,
          AppSpacing.sm,
          AppSpacing.xl,
          AppSpacing.xxl,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundColor: colors.goldPrimary.withValues(alpha: 0.15),
                  child: Icon(icon, color: colors.goldDark, size: 20),
                ),
                const SizedBox(width: AppSpacing.md),
                Text(
                  title,
                  style: text.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.lg),
            Text(
              content,
              style: text.bodyMedium?.copyWith(
                color: colors.textSecondary,
                height: 1.5,
              ),
            ),
            const SizedBox(height: AppSpacing.xl),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () => Navigator.pop(ctx),
                child: Text(context.tr('mobile.common.close')),
              ),
            ),
          ],
        ),
      ),
    );
  }

  static String _roleLabel(BuildContext context, String role) => switch (role.toUpperCase()) {
        'ADMIN' => context.tr('admin.users.roleAdmin'),
        'REGISTRAR' => context.tr('admin.sidebar.registrar'),
        'INSTRUCTOR' => context.tr('admin.users.roleInstructor'),
        _ => context.tr('admin.users.roleStudent'),
      };
}

/// The reference profile header: a navy/midnight gradient panel with the
/// avatar, name, role and a gold "Edit Profile" button.
class _ProfileHeader extends StatelessWidget {
  const _ProfileHeader({
    required this.user,
    required this.roleLabel,
    required this.busy,
    required this.onEditAvatar,
    required this.onEditProfile,
  });

  final AppUser user;
  final String roleLabel;
  final bool busy;
  final VoidCallback onEditAvatar;
  final VoidCallback onEditProfile;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [colors.forestMid, colors.forestDeep],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: const BorderRadius.vertical(
          bottom: Radius.circular(AppRadii.xl),
        ),
        boxShadow: AppShadows.card(colors.forestDeep),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(
              AppSpacing.lg, AppSpacing.lg, AppSpacing.lg, AppSpacing.xl,),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  _Avatar(
                    user: user,
                    busy: busy,
                    onEdit: onEditAvatar,
                    radius: 34,
                  ),
                  const SizedBox(width: AppSpacing.lg),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(user.name,
                            style: text.titleLarge?.copyWith(color: Colors.white),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,),
                        const SizedBox(height: 2),
                        Text(roleLabel,
                            style: text.labelMedium
                                ?.copyWith(color: colors.goldLight),),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),
              _EditProfileButton(onTap: onEditProfile),
            ],
          ),
        ),
      ),
    );
  }
}

/// Equal-width 3-way theme toggle (Light / Auto / Dark) that fills the card
/// width — replaces SegmentedButton which overflowed on narrow screens.
class _ThemeToggle extends StatelessWidget {
  const _ThemeToggle({required this.mode, required this.onChanged});

  final ThemeMode mode;
  final ValueChanged<ThemeMode> onChanged;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: colors.surfaceMuted,
        borderRadius: AppRadii.rPill,
      ),
      child: Row(
        children: [
          _seg(context, ThemeMode.light, Icons.light_mode_rounded,
              context.tr('mobile.profile.themeLight'),),
          _seg(context, ThemeMode.system, Icons.brightness_auto_rounded,
              context.tr('mobile.profile.themeAuto'),),
          _seg(context, ThemeMode.dark, Icons.dark_mode_rounded,
              context.tr('mobile.profile.themeDark'),),
        ],
      ),
    );
  }

  Widget _seg(
      BuildContext context, ThemeMode value, IconData icon, String label,) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final selected = mode == value;
    return Expanded(
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => onChanged(value),
        child: AnimatedContainer(
          duration: AppMotion.fast,
          curve: AppMotion.curve,
          padding: const EdgeInsets.symmetric(vertical: 9),
          decoration: BoxDecoration(
            color: selected ? colors.goldPrimary : Colors.transparent,
            borderRadius: AppRadii.rPill,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon,
                  size: 15,
                  color: selected ? Colors.white : colors.textSecondary,),
              const SizedBox(width: 5),
              Flexible(
                child: Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: text.labelMedium?.copyWith(
                    color: selected ? Colors.white : colors.textSecondary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Full-width gold "Edit profile" pill for the profile header.
class _EditProfileButton extends StatelessWidget {
  const _EditProfileButton({required this.onTap});
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    return Material(
      color: colors.goldPrimary,
      borderRadius: AppRadii.rPill,
      child: InkWell(
        onTap: onTap,
        borderRadius: AppRadii.rPill,
        child: Container(
          height: 44,
          width: double.infinity,
          alignment: Alignment.center,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.edit_rounded, size: 18, color: Colors.white),
              const SizedBox(width: AppSpacing.sm),
              Text(
                context.tr('mobile.profile.editProfile'),
                style: Theme.of(context)
                    .textTheme
                    .labelLarge
                    ?.copyWith(color: Colors.white),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Avatar extends StatelessWidget {
  const _Avatar({
    required this.user,
    required this.busy,
    required this.onEdit,
    this.radius = 48,
  });
  final AppUser user;
  final bool busy;
  final VoidCallback onEdit;
  final double radius;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final hasAvatar = user.avatar != null && user.avatar!.startsWith('http');
    final badge = radius >= 40 ? 8.0 : 6.0;
    final iconSize = radius >= 40 ? 16.0 : 13.0;

    return Stack(
      children: [
        CircleAvatar(
          radius: radius,
          backgroundColor: colors.forestMid,
          backgroundImage:
              hasAvatar ? CachedNetworkImageProvider(user.avatar!) : null,
          child: hasAvatar
              ? null
              : Text(user.initials,
                  style: TextStyle(
                      color: Colors.white,
                      fontSize: radius * 0.62,
                      fontWeight: FontWeight.w700,),),
        ),
        Positioned(
          right: 0,
          bottom: 0,
          child: Material(
            color: colors.goldPrimary,
            shape: CircleBorder(side: BorderSide(color: colors.forestDeep, width: 2)),
            child: InkWell(
              customBorder: const CircleBorder(),
              onTap: busy ? null : onEdit,
              child: Padding(
                padding: EdgeInsets.all(badge),
                child: busy
                    ? SizedBox(
                        width: iconSize,
                        height: iconSize,
                        child: const CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white,),
                      )
                    : Icon(Icons.camera_alt_rounded,
                        size: iconSize, color: Colors.white,),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.title, required this.children});
  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title.toUpperCase(),
            style: text.labelSmall
                ?.copyWith(color: colors.textMuted, letterSpacing: 1),),
        const SizedBox(height: AppSpacing.sm),
        Material(
          color: colors.surfaceElevated,
          borderRadius: AppRadii.rLg,
          elevation: 2,
          shadowColor: colors.forestDeep.withValues(alpha: 0.08),
          child: Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              borderRadius: AppRadii.rLg,
              border: Border.all(
                color: Theme.of(context).brightness == Brightness.light
                    ? colors.border.withValues(alpha: 0.5)
                    : colors.border,
              ),
            ),
            child: Column(children: children),
          ),
        ),
      ],
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.icon, required this.label, required this.value});
  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: colors.goldPrimary),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: text.bodySmall?.copyWith(color: colors.textMuted),),
                Text(value, style: text.bodyMedium),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

import 'package:cached_network_image/cached_network_image.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/router/app_router.dart';
import '../../../core/security/biometric_service.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';
import '../../auth/application/auth_controller.dart';
import '../../auth/domain/app_user.dart';
import '../../settings/application/theme_controller.dart';
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
      _snack('Profile photo updated.');
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
          _snack('Biometrics are not available on this device.');
          return;
        }
        if (!await service.authenticate(reason: 'Enable biometric unlock')) return;
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
    final text = Theme.of(context).textTheme;
    final user = ref.watch(currentUserProvider);
    final mode = ref.watch(themeModeControllerProvider);
    final biometricEnabled = ref.watch(biometricServiceProvider).isEnabled;

    if (user == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(
        backgroundColor: colors.forestDeep,
        foregroundColor: Colors.white,
        flexibleSpace: DecoratedBox(
          decoration: BoxDecoration(gradient: colors.forestGradient),
        ),
        title: Text(
          'Profile',
          style: Theme.of(context)
              .textTheme
              .titleLarge
              ?.copyWith(color: Colors.white),
        ),
        actions: [
          IconButton(
            tooltip: 'Edit profile',
            icon: const Icon(Icons.edit_rounded, color: Colors.white),
            onPressed: () => context.push(AppRoutes.profileEdit),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.only(
          left: AppSpacing.lg,
          right: AppSpacing.lg,
          top: AppSpacing.lg,
          bottom: 140,
        ),
        children: [
          Center(
            child: Column(
              children: [
                _Avatar(
                  user: user,
                  busy: _uploadingAvatar,
                  onEdit: _changeAvatar,
                ),
                const SizedBox(height: AppSpacing.md),
                Text(user.name, style: text.headlineSmall),
                const SizedBox(height: AppSpacing.xs),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.md, vertical: 4,),
                  decoration: BoxDecoration(
                    color: colors.goldPrimary.withValues(alpha: 0.12),
                    borderRadius: AppRadii.rPill,
                  ),
                  child: Text(_roleLabel(user.role),
                      style: text.labelSmall?.copyWith(color: colors.goldDark),),
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(user.email,
                    style: text.bodySmall?.copyWith(color: colors.textMuted),),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          _Section(title: 'Personal information', children: [
            if ((user.church ?? '').isNotEmpty)
              _InfoRow(icon: Icons.church_outlined, label: 'Church', value: user.church!),
            if ((user.location ?? '').isNotEmpty)
              _InfoRow(icon: Icons.place_outlined, label: 'Location', value: user.location!),
            if ((user.phone ?? '').isNotEmpty)
              _InfoRow(icon: Icons.phone_outlined, label: 'Phone', value: user.phone!),
            if ((user.bio ?? '').isNotEmpty)
              _InfoRow(icon: Icons.info_outline_rounded, label: 'Bio', value: user.bio!),
            if ((user.church ?? '').isEmpty &&
                (user.location ?? '').isEmpty &&
                (user.phone ?? '').isEmpty &&
                (user.bio ?? '').isEmpty)
              const _InfoRow(
                icon: Icons.edit_note_rounded,
                label: 'Complete your profile',
                value: 'Tap edit to add details',
              ),
          ],),
          const SizedBox(height: AppSpacing.lg),
          _Section(title: 'Appearance', children: [
            Padding(
              padding: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
              child: SegmentedButton<ThemeMode>(
                segments: const [
                  ButtonSegment(value: ThemeMode.light, icon: Icon(Icons.light_mode_rounded), label: Text('Light')),
                  ButtonSegment(value: ThemeMode.system, icon: Icon(Icons.brightness_auto_rounded), label: Text('Auto')),
                  ButtonSegment(value: ThemeMode.dark, icon: Icon(Icons.dark_mode_rounded), label: Text('Dark')),
                ],
                selected: {mode},
                showSelectedIcon: false,
                onSelectionChanged: (s) =>
                    ref.read(themeModeControllerProvider.notifier).set(s.first),
              ),
            ),
          ],),
          const SizedBox(height: AppSpacing.lg),
          _Section(title: 'Security', children: [
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              secondary: Icon(Icons.fingerprint_rounded, color: colors.goldPrimary),
              title: const Text('Biometric unlock'),
              subtitle: const Text('Require Face ID / fingerprint on launch'),
              value: biometricEnabled,
              onChanged: _biometricBusy ? null : _toggleBiometric,
            ),
          ],),
          const SizedBox(height: AppSpacing.lg),
          _Section(
            title: 'Support',
            children: [
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: Icon(Icons.headphones_outlined, color: colors.goldPrimary),
                title: const Text('Help & Support'),
                trailing: const Icon(Icons.chevron_right_rounded),
                onTap: () => _showSupportModal(
                  context,
                  title: 'Help & Support',
                  content: 'For academic assistance, course inquiries, or technical support, please contact our support team at support@cwayacademy.org or reach out to your instructor directly through course messaging.',
                  icon: Icons.headset_mic_rounded,
                ),
              ),
              Divider(height: 1, color: colors.border),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: Icon(Icons.shield_outlined, color: colors.goldPrimary),
                title: const Text('Privacy Policy'),
                trailing: const Icon(Icons.chevron_right_rounded),
                onTap: () => _showSupportModal(
                  context,
                  title: 'Privacy Policy',
                  content: 'CWAY Academy respects your privacy. Your personal information, course progress, and academic records are securely encrypted and protected in accordance with international data privacy standards.',
                  icon: Icons.verified_user_rounded,
                ),
              ),
              Divider(height: 1, color: colors.border),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: Icon(Icons.description_outlined, color: colors.goldPrimary),
                title: const Text('Terms of Service'),
                trailing: const Icon(Icons.chevron_right_rounded),
                onTap: () => _showSupportModal(
                  context,
                  title: 'Terms of Service',
                  content: 'By accessing CWAY Academy courses and materials, you agree to adhere to our academic honor code, respect copyright terms, and maintain integrity in all coursework and discussions.',
                  icon: Icons.article_rounded,
                ),
              ),
              Divider(height: 1, color: colors.border),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: Icon(Icons.info_outline_rounded, color: colors.goldPrimary),
                title: const Text('About CWAY Academy'),
                trailing: const Icon(Icons.chevron_right_rounded),
                onTap: () => _showSupportModal(
                  context,
                  title: 'About CWAY Academy',
                  content: 'CWAY Academy is dedicated to equipping leaders, ministers, and believers with high-quality, biblical theology and practical leadership training worldwide.',
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
                  title: const Text('Downloads'),
                  trailing: const Icon(Icons.chevron_right_rounded),
                  onTap: () => context.push(AppRoutes.downloads),
                ),
                Divider(height: 1, color: colors.border),
                ListTile(
                  leading: Icon(Icons.settings_outlined, color: colors.goldPrimary),
                  title: const Text('Settings'),
                  trailing: const Icon(Icons.chevron_right_rounded),
                  onTap: () => context.push(AppRoutes.settings),
                ),
                Divider(height: 1, color: colors.border),
                ListTile(
                  leading: Icon(Icons.logout_rounded, color: colors.danger),
                  title: Text('Sign out', style: TextStyle(color: colors.danger)),
                  onTap: () =>
                      ref.read(authControllerProvider.notifier).signOut(),
                ),
              ],
            ),
          ),
        ].animate(interval: 50.ms).fade(duration: 300.ms).slideY(begin: 0.1, duration: 300.ms, curve: Curves.easeOutQuad),
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
                child: const Text('Close'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  static String _roleLabel(String role) =>
      role.isEmpty ? 'Student' : role[0] + role.substring(1).toLowerCase();
}

class _Avatar extends StatelessWidget {
  const _Avatar({required this.user, required this.busy, required this.onEdit});
  final AppUser user;
  final bool busy;
  final VoidCallback onEdit;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final hasAvatar = user.avatar != null && user.avatar!.startsWith('http');

    return Stack(
      children: [
        CircleAvatar(
          radius: 48,
          backgroundColor: colors.forestMid,
          backgroundImage:
              hasAvatar ? CachedNetworkImageProvider(user.avatar!) : null,
          child: hasAvatar
              ? null
              : Text(user.initials,
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.w700,),),
        ),
        Positioned(
          right: 0,
          bottom: 0,
          child: Material(
            color: colors.goldPrimary,
            shape: const CircleBorder(),
            child: InkWell(
              customBorder: const CircleBorder(),
              onTap: busy ? null : onEdit,
              child: Padding(
                padding: const EdgeInsets.all(8),
                child: busy
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white,),
                      )
                    : const Icon(Icons.camera_alt_rounded,
                        size: 16, color: Colors.white,),
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

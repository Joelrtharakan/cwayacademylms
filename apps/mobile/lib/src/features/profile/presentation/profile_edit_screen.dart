import 'package:cached_network_image/cached_network_image.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/i18n/app_translations.dart';
import '../../../core/i18n/i18n_extension.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';
import '../../../core/utils/validators.dart';
import '../../../shared/widgets/error_banner.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../auth/application/auth_controller.dart';
import '../../auth/presentation/widgets/auth_text_field.dart';
import '../data/profile_repository.dart';

class ProfileEditScreen extends ConsumerStatefulWidget {
  const ProfileEditScreen({super.key});

  @override
  ConsumerState<ProfileEditScreen> createState() => _ProfileEditScreenState();
}

class _ProfileEditScreenState extends ConsumerState<ProfileEditScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _name;
  late final TextEditingController _phone;
  late final TextEditingController _church;
  late final TextEditingController _location;
  late final TextEditingController _bio;

  bool _saving = false;
  bool _avatarBusy = false;
  String? _error;

  void _snack(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(msg)));
  }

  Future<void> _pickAndUploadAvatar() async {
    final result = await FilePicker.platform.pickFiles(type: FileType.image);
    if (result == null || result.files.isEmpty) return;
    final file = result.files.first;
    if (file.path == null) return;

    setState(() => _avatarBusy = true);
    try {
      await ref
          .read(profileRepositoryProvider)
          .uploadAvatar(filePath: file.path!, fileName: file.name);
      await ref.read(authControllerProvider.notifier).refreshUser();
      _snack(AppTranslations.tg('mobile.profile.avatarUpdated'));
    } on ApiException catch (e) {
      _snack(e.message);
    } finally {
      if (mounted) setState(() => _avatarBusy = false);
    }
  }

  Future<void> _removeAvatar() async {
    setState(() => _avatarBusy = true);
    try {
      await ref.read(profileRepositoryProvider).removeAvatar();
      await ref.read(authControllerProvider.notifier).refreshUser();
      _snack(AppTranslations.tg('mobile.profile.avatarRemoved'));
    } on ApiException catch (e) {
      _snack(e.message);
    } finally {
      if (mounted) setState(() => _avatarBusy = false);
    }
  }

  /// Resolves [key], falling back to [fallback] when the catalog hasn't loaded
  /// the key yet (so users never see a raw key like "mobile.profile.changePhoto").
  String _label(String key, String fallback) {
    final v = context.tr(key);
    return v == key ? fallback : v;
  }

  Future<void> _showAvatarOptions(bool hasAvatar) async {
    final colors = context.colors;
    await showModalBottomSheet<void>(
      context: context,
      backgroundColor: colors.surface,
      showDragHandle: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadii.xl)),
      ),
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: Icon(Icons.photo_camera_rounded, color: colors.goldDark),
              title: Text(hasAvatar
                  ? _label('mobile.profile.changePhoto', 'Change photo')
                  : _label('mobile.profile.addPhoto', 'Add photo'),),
              onTap: () {
                Navigator.pop(ctx);
                _pickAndUploadAvatar();
              },
            ),
            if (hasAvatar)
              ListTile(
                leading: Icon(Icons.delete_outline_rounded, color: colors.danger),
                title: Text(
                  _label('mobile.profile.removePhoto', 'Remove photo'),
                  style: TextStyle(color: colors.danger),
                ),
                onTap: () {
                  Navigator.pop(ctx);
                  _removeAvatar();
                },
              ),
            const SizedBox(height: AppSpacing.sm),
          ],
        ),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    final user = ref.read(currentUserProvider);
    _name = TextEditingController(text: user?.name ?? '');
    _phone = TextEditingController(text: user?.phone ?? '');
    _church = TextEditingController(text: user?.church ?? '');
    _location = TextEditingController(text: user?.location ?? '');
    _bio = TextEditingController(text: user?.bio ?? '');
  }

  @override
  void dispose() {
    for (final c in [_name, _phone, _church, _location, _bio]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _save() async {
    FocusScope.of(context).unfocus();
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      await ref.read(profileRepositoryProvider).updateProfile(
            name: _name.text,
            phone: _phone.text,
            church: _church.text,
            location: _location.text,
            bio: _bio.text,
          );
      await ref.read(authControllerProvider.notifier).refreshUser();
      if (mounted) {
        ScaffoldMessenger.of(context)
          ..hideCurrentSnackBar()
          ..showSnackBar(SnackBar(content: Text(AppTranslations.tg('student.settings.messages.profileUpdated'))));
        context.pop();
      }
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(context.tr('mobile.profile.editProfile'))),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              if (_error != null) ...[
                ErrorBanner(message: _error!),
                const SizedBox(height: AppSpacing.lg),
              ],
              _AvatarEditor(
                busy: _avatarBusy,
                onTap: () {
                  final u = ref.read(currentUserProvider);
                  final hasAvatar =
                      (u?.avatar != null) && u!.avatar!.startsWith('http');
                  _showAvatarOptions(hasAvatar);
                },
              ),
              const SizedBox(height: AppSpacing.xl),
              AuthTextField(
                controller: _name,
                label: context.tr('mobile.profile.fullName'),
                prefixIcon: Icons.person_outline_rounded,
                textInputAction: TextInputAction.next,
                validator: (v) => Validators.required(v, field: context.tr('mobile.auth.nameField')),
                enabled: !_saving,
              ),
              AuthTextField(
                controller: _phone,
                label: '${context.tr('mobile.profile.phone')} ${context.tr('auth.register.optional')}',
                prefixIcon: Icons.phone_outlined,
                keyboardType: TextInputType.phone,
                textInputAction: TextInputAction.next,
                enabled: !_saving,
              ),
              AuthTextField(
                controller: _church,
                label: '${context.tr('auth.register.church')} ${context.tr('auth.register.optional')}',
                prefixIcon: Icons.church_outlined,
                textInputAction: TextInputAction.next,
                enabled: !_saving,
              ),
              AuthTextField(
                controller: _location,
                label: '${context.tr('auth.register.location')} ${context.tr('auth.register.optional')}',
                prefixIcon: Icons.place_outlined,
                textInputAction: TextInputAction.next,
                enabled: !_saving,
              ),
              AuthTextField(
                controller: _bio,
                label: '${context.tr('mobile.profile.bio')} ${context.tr('auth.register.optional')}',
                prefixIcon: Icons.info_outline_rounded,
                enabled: !_saving,
              ),
              const SizedBox(height: AppSpacing.sm),
              PrimaryButton(
                label: context.tr('mobile.profile.saveChanges'),
                variant: ButtonVariant.gold,
                isLoading: _saving,
                onPressed: _saving ? null : _save,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Circular avatar with a gold camera badge that opens the add / change /
/// remove photo options. Reads the live user so it updates after upload/remove.
class _AvatarEditor extends ConsumerWidget {
  const _AvatarEditor({required this.busy, required this.onTap});

  final bool busy;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = context.colors;
    final user = ref.watch(currentUserProvider);
    final hasAvatar =
        (user?.avatar != null) && user!.avatar!.startsWith('http');

    return Center(
      child: Stack(
        children: [
          CircleAvatar(
            radius: 48,
            backgroundColor: colors.forestMid,
            backgroundImage:
                hasAvatar ? CachedNetworkImageProvider(user.avatar!) : null,
            child: hasAvatar
                ? null
                : Text(
                    user?.initials ?? '?',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
          ),
          Positioned(
            right: 0,
            bottom: 0,
            child: Material(
              color: colors.goldPrimary,
              shape: const CircleBorder(),
              child: InkWell(
                customBorder: const CircleBorder(),
                onTap: busy ? null : onTap,
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
      ),
    );
  }
}

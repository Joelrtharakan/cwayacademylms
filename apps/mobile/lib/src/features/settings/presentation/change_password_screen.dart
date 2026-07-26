import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/i18n/i18n_extension.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_dimens.dart';
import '../../../core/utils/validators.dart';
import '../../../shared/widgets/error_banner.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../auth/data/auth_repository_impl.dart';
import '../../auth/presentation/widgets/auth_text_field.dart';

class ChangePasswordScreen extends ConsumerStatefulWidget {
  const ChangePasswordScreen({super.key});

  @override
  ConsumerState<ChangePasswordScreen> createState() =>
      _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends ConsumerState<ChangePasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _current = TextEditingController();
  final _next = TextEditingController();
  final _confirm = TextEditingController();

  bool _saving = false;
  String? _error;

  @override
  void dispose() {
    _current.dispose();
    _next.dispose();
    _confirm.dispose();
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
      await ref.read(authRepositoryProvider).updatePassword(
            currentPassword: _current.text,
            newPassword: _next.text,
          );
      if (mounted) {
        ScaffoldMessenger.of(context)
          ..hideCurrentSnackBar()
          ..showSnackBar(
            SnackBar(
              content: Text(context.tr('student.settings.messages.passwordUpdated')),
            ),
          );
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
      appBar: AppBar(title: Text(context.tr('student.settings.password.title'))),
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
              AuthTextField(
                controller: _current,
                label: context.tr('student.settings.password.current'),
                prefixIcon: Icons.lock_outline_rounded,
                obscure: true,
                textInputAction: TextInputAction.next,
                validator: Validators.password,
                enabled: !_saving,
              ),
              AuthTextField(
                controller: _next,
                label: context.tr('student.settings.password.new'),
                prefixIcon: Icons.lock_reset_rounded,
                obscure: true,
                textInputAction: TextInputAction.next,
                validator: Validators.password,
                enabled: !_saving,
              ),
              AuthTextField(
                controller: _confirm,
                label: context.tr('student.settings.password.confirm'),
                prefixIcon: Icons.lock_reset_rounded,
                obscure: true,
                textInputAction: TextInputAction.done,
                validator: Validators.confirm(() => _next.text),
                enabled: !_saving,
                onSubmitted: (_) => _save(),
              ),
              const SizedBox(height: AppSpacing.sm),
              PrimaryButton(
                label: context.tr('student.settings.password.updateBtn'),
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

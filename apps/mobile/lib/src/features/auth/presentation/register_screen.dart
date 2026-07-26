import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/router/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';
import '../../../core/utils/validators.dart';
import '../../../shared/widgets/error_banner.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../courses/data/courses_repository.dart';
import '../../dashboard/application/dashboard_controller.dart';
import '../application/auth_controller.dart';
import 'widgets/auth_scaffold.dart';
import 'widgets/auth_text_field.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key, this.pendingCourseId});

  final String? pendingCourseId;

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _confirm = TextEditingController();
  final _church = TextEditingController();
  final _location = TextEditingController();

  bool _submitting = false;
  String? _error;

  @override
  void dispose() {
    for (final c in [_name, _email, _password, _confirm, _church, _location]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _submit() async {
    FocusScope.of(context).unfocus();
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      await ref.read(authControllerProvider.notifier).register(
            name: _name.text,
            email: _email.text,
            password: _password.text,
            church: _church.text,
            location: _location.text,
          );

      if (widget.pendingCourseId != null && widget.pendingCourseId!.isNotEmpty) {
        try {
          await ref.read(coursesRepositoryProvider).enroll(widget.pendingCourseId!);
        } catch (_) {}
        ref.invalidate(courseDetailProvider(widget.pendingCourseId!));
        ref.invalidate(dashboardControllerProvider);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Account created & enrolled in course!')),
          );
          context.go(AppRoutes.courseDetailPath(widget.pendingCourseId!));
          return;
        }
      }

      if (mounted) {
        context.pushReplacement(
          AppRoutes.verifyEmail,
          extra: _email.text.trim(),
        );
      }
    } on ApiException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } catch (_) {
      if (mounted) setState(() => _error = 'Something went wrong. Please try again.');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    return AuthScaffold(
      title: 'Create your account',
      subtitle: 'Join CWAY Academy and start learning today.',
      onBack: () => context.pop(),
      children: [
        Form(
          key: _formKey,
          child: Column(
            children: [
              if (_error != null) ...[
                ErrorBanner(message: _error!),
                const SizedBox(height: AppSpacing.lg),
              ],
              AuthTextField(
                controller: _name,
                label: 'Full name',
                hint: 'Jane Doe',
                prefixIcon: Icons.person_outline_rounded,
                textInputAction: TextInputAction.next,
                autofillHints: const [AutofillHints.name],
                validator: (v) => Validators.required(v, field: 'Name'),
                enabled: !_submitting,
              ),
              AuthTextField(
                controller: _email,
                label: 'Email',
                hint: 'you@example.com',
                prefixIcon: Icons.mail_outline_rounded,
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.next,
                autofillHints: const [AutofillHints.email],
                validator: Validators.email,
                enabled: !_submitting,
              ),
              AuthTextField(
                controller: _password,
                label: 'Password',
                hint: 'At least 8 characters',
                prefixIcon: Icons.lock_outline_rounded,
                obscure: true,
                textInputAction: TextInputAction.next,
                autofillHints: const [AutofillHints.newPassword],
                validator: Validators.password,
                enabled: !_submitting,
              ),
              AuthTextField(
                controller: _confirm,
                label: 'Confirm password',
                hint: 'Re-enter your password',
                prefixIcon: Icons.lock_outline_rounded,
                obscure: true,
                textInputAction: TextInputAction.next,
                validator: Validators.confirm(() => _password.text),
                enabled: !_submitting,
              ),
              AuthTextField(
                controller: _church,
                label: 'Church / Ministry (optional)',
                prefixIcon: Icons.church_outlined,
                textInputAction: TextInputAction.next,
                enabled: !_submitting,
              ),
              AuthTextField(
                controller: _location,
                label: 'Location (optional)',
                prefixIcon: Icons.place_outlined,
                textInputAction: TextInputAction.done,
                enabled: !_submitting,
                onSubmitted: (_) => _submit(),
              ),
              const SizedBox(height: AppSpacing.sm),
              PrimaryButton(
                label: 'Create account',
                variant: ButtonVariant.gold,
                isLoading: _submitting,
                onPressed: _submitting ? null : _submit,
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.xxl),
        Center(
          child: Wrap(
            alignment: WrapAlignment.center,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              Text(
                'Already have an account? ',
                style: TextStyle(color: colors.textSecondary),
              ),
              GestureDetector(
                onTap: _submitting
                    ? null
                    : () => context.push(
                          widget.pendingCourseId != null &&
                                  widget.pendingCourseId!.isNotEmpty
                              ? '${AppRoutes.login}?pendingCourseId=${widget.pendingCourseId}'
                              : AppRoutes.login,
                        ),
                child: Text(
                  'Sign in',
                  style: TextStyle(
                    color: colors.goldDark,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/i18n/i18n_extension.dart';
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

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key, this.pendingCourseId});

  final String? pendingCourseId;

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();

  bool _submitting = false;
  String? _error;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
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
      await ref.read(authControllerProvider.notifier).signIn(
            email: _email.text,
            password: _password.text,
          );

      if (widget.pendingCourseId != null && widget.pendingCourseId!.isNotEmpty) {
        try {
          await ref.read(coursesRepositoryProvider).enroll(widget.pendingCourseId!);
        } catch (_) {}
        ref.invalidate(courseDetailProvider(widget.pendingCourseId!));
        ref.invalidate(dashboardControllerProvider);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(context.tr('auth.login.enroll_success'))),
          );
          context.go(AppRoutes.courseDetailPath(widget.pendingCourseId!));
          return;
        }
      }
    } on ApiException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } catch (e, st) {
      debugPrint('Login error caught: $e\n$st');
      if (mounted) setState(() => _error = context.tr('auth.register.error_generic'));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;

    return AuthScaffold(
      badgeText: context.tr('student.sidebar.portal'),
      title: context.tr('auth.login.title'),
      subtitle: context.tr('auth.login.subtitle'),
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
                controller: _email,
                label: context.tr('auth.login.email'),
                hint: context.tr('mobile.auth.emailHint'),
                prefixIcon: Icons.mail_outline_rounded,
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.next,
                autofillHints: const [AutofillHints.username, AutofillHints.email],
                validator: Validators.email,
                enabled: !_submitting,
              ),
              AuthTextField(
                controller: _password,
                label: context.tr('auth.login.password'),
                hint: '••••••••',
                prefixIcon: Icons.lock_outline_rounded,
                obscure: true,
                textInputAction: TextInputAction.done,
                autofillHints: const [AutofillHints.password],
                validator: Validators.password,
                enabled: !_submitting,
                onSubmitted: (_) => _submit(),
              ),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: _submitting
                      ? null
                      : () => context.push(AppRoutes.forgotPassword),
                  child: Text(context.tr('auth.login.forgot_password')),
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              PrimaryButton(
                label: context.tr('auth.login.sign_in'),
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
              Text('${context.tr('mobile.auth.newToAcademy')} ',
                  style: TextStyle(color: colors.textSecondary),),
              GestureDetector(
                onTap: _submitting
                    ? null
                    : () => context.push(
                          widget.pendingCourseId != null &&
                                  widget.pendingCourseId!.isNotEmpty
                              ? '${AppRoutes.register}?pendingCourseId=${widget.pendingCourseId}'
                              : AppRoutes.register,
                        ),
                child: Text(
                  context.tr('auth.register.create'),
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

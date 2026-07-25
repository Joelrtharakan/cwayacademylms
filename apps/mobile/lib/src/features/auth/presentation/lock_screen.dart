import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';
import '../../../shared/widgets/primary_button.dart';
import '../application/auth_controller.dart';

/// Biometric gate for a valid-but-locked session (cold start with biometrics on).
/// Auto-prompts on open; the router redirect leaves this screen once unlocked.
class LockScreen extends ConsumerStatefulWidget {
  const LockScreen({super.key});

  @override
  ConsumerState<LockScreen> createState() => _LockScreenState();
}

class _LockScreenState extends ConsumerState<LockScreen> {
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _unlock());
  }

  Future<void> _unlock() async {
    if (_busy) return;
    setState(() => _busy = true);
    await ref.read(authControllerProvider.notifier).unlock();
    if (mounted) setState(() => _busy = false);
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final user = ref.watch(currentUserProvider);

    return Scaffold(
      body: DecoratedBox(
        decoration: BoxDecoration(gradient: colors.forestGradient),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.xl),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Icon(Icons.fingerprint_rounded, size: 72, color: colors.goldLight),
                const SizedBox(height: AppSpacing.xl),
                Text(
                  user == null ? 'Welcome back' : 'Welcome back, ${user.name.split(' ').first}',
                  style: text.headlineMedium?.copyWith(color: Colors.white),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  'Unlock to continue',
                  style: text.bodyLarge?.copyWith(color: Colors.white70),
                ),
                const SizedBox(height: AppSpacing.xxxl),
                PrimaryButton(
                  label: 'Unlock',
                  icon: Icons.lock_open_rounded,
                  variant: ButtonVariant.gold,
                  isLoading: _busy,
                  onPressed: _busy ? null : _unlock,
                ),
                const SizedBox(height: AppSpacing.sm),
                TextButton(
                  onPressed: _busy
                      ? null
                      : () => ref.read(authControllerProvider.notifier).signOut(),
                  child: const Text('Sign in with a different account',
                      style: TextStyle(color: Colors.white70),),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

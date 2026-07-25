import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/error_banner.dart';
import '../../auth/application/auth_controller.dart';
import '../data/certificates_repository.dart';
import 'widgets/certificate_card.dart';

class CertificatesScreen extends ConsumerWidget {
  const CertificatesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = context.colors;
    final async = ref.watch(myCertificatesProvider);
    final name = ref.watch(currentUserProvider)?.name ?? 'Learner';

    return Scaffold(
      appBar: AppBar(title: const Text('Certificates')),
      body: RefreshIndicator(
        color: colors.goldPrimary,
        onRefresh: () async => ref.invalidate(myCertificatesProvider),
        child: async.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (_, __) => ListView(
            children: [
              const SizedBox(height: 80),
              Padding(
                padding: const EdgeInsets.all(AppSpacing.xl),
                child: ErrorBanner(
                  message: "We couldn't load your certificates.",
                  onRetry: () => ref.invalidate(myCertificatesProvider),
                ),
              ),
            ],
          ),
          data: (certs) {
            if (certs.isEmpty) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: const [
                  SizedBox(height: 100),
                  EmptyState(
                    icon: Icons.workspace_premium_outlined,
                    title: 'No certificates yet',
                    message: 'Complete a course to earn your first certificate.',
                  ),
                ],
              );
            }
            return ListView.separated(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(AppSpacing.lg),
              itemCount: certs.length,
              separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.lg),
              itemBuilder: (context, i) {
                final cert = certs[i];
                return GestureDetector(
                  onTap: () => context.push(
                    AppRoutes.certificatePath(cert.id),
                    extra: cert,
                  ),
                  child: Hero(
                    tag: 'certificate-${cert.id}',
                    child: CertificateCard(
                      certificate: cert,
                      recipientName: name,
                      compact: true,
                    ),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }
}

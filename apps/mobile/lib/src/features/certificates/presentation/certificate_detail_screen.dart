import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:share_plus/share_plus.dart';

import '../../../core/i18n/app_translations.dart';
import '../../../core/i18n/i18n_extension.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../auth/application/auth_controller.dart';
import '../data/certificate_dto.dart';
import '../data/certificates_repository.dart';
import 'widgets/certificate_card.dart';

class CertificateDetailScreen extends ConsumerStatefulWidget {
  const CertificateDetailScreen({
    super.key,
    required this.certificateId,
    this.certificate,
  });

  final String certificateId;
  final CertificateDto? certificate;

  @override
  ConsumerState<CertificateDetailScreen> createState() =>
      _CertificateDetailScreenState();
}

class _CertificateDetailScreenState
    extends ConsumerState<CertificateDetailScreen> {
  bool _busy = false;

  CertificateDto? _resolve(WidgetRef ref) {
    if (widget.certificate != null) return widget.certificate;
    final list = ref.watch(myCertificatesProvider).valueOrNull;
    if (list == null) return null;
    for (final c in list) {
      if (c.id == widget.certificateId) return c;
    }
    return null;
  }

  Future<void> _sharePdf(CertificateDto cert) async {
    setState(() => _busy = true);
    try {
      final base = cert.course?.slug ??
          (cert.isProgram ? 'program' : cert.titleText.resolve('en'));
      final path = await ref.read(certificatesRepositoryProvider).downloadPdf(
            id: cert.id,
            filename: '$base-certificate.pdf',
          );
      await Share.shareXFiles(
        [XFile(path, mimeType: 'application/pdf')],
        text: AppTranslations.tg('mobile.certificates.shareText'),
      );
    } on ApiException catch (e) {
      _snack(e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
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
    final name = ref.watch(currentUserProvider)?.name ?? context.tr('student.layout.role');
    final cert = _resolve(ref);

    return Scaffold(
      appBar: AppBar(title: Text(context.tr('mobile.certificates.detailTitle'))),
      body: cert == null
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(AppSpacing.lg),
              children: [
                Hero(
                  tag: 'certificate-${cert.id}',
                  child: CertificateCard(certificate: cert, recipientName: name),
                ),
                const SizedBox(height: AppSpacing.xl),
                _InfoRow(label: context.tr('mobile.certificates.issued'), value: Formatters.date(cert.issuedAt)),
                if (cert.certificateNumber != null)
                  _InfoRow(label: context.tr('mobile.certificates.number'), value: cert.certificateNumber!),
                if (cert.uniqueCode != null)
                  _InfoRow(label: context.tr('mobile.certificates.verificationCode'), value: cert.uniqueCode!),
                if (cert.instructorName != null && cert.instructorName!.isNotEmpty)
                  _InfoRow(label: context.tr('student.player.instructor'), value: cert.instructorName!),
                if (cert.scriptureRef != null && cert.scriptureRef!.isNotEmpty)
                  _InfoRow(label: context.tr('mobile.certificates.scripture'), value: cert.scriptureRef!),
                const SizedBox(height: AppSpacing.xl),
                PrimaryButton(
                  label: context.tr('mobile.certificates.downloadShare'),
                  icon: Icons.ios_share_rounded,
                  variant: ButtonVariant.gold,
                  isLoading: _busy,
                  onPressed: _busy ? null : () => _sharePdf(cert),
                ),
                const SizedBox(height: AppSpacing.sm),
                Center(
                  child: Text(
                    context.tr('mobile.certificates.verifyAt'),
                    style: Theme.of(context)
                        .textTheme
                        .bodySmall
                        ?.copyWith(color: colors.textMuted),
                  ),
                ),
              ],
            ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value});
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
          SizedBox(
            width: 130,
            child: Text(label,
                style: text.bodySmall?.copyWith(color: colors.textMuted),),
          ),
          Expanded(
            child: Text(value,
                style: text.bodyMedium?.copyWith(fontWeight: FontWeight.w600),),
          ),
        ],
      ),
    );
  }
}

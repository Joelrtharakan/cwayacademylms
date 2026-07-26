import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/app_shimmer.dart';
import '../../../shared/widgets/error_banner.dart';
import '../application/programs_controller.dart';

class ProgramDetailScreen extends ConsumerWidget {
  const ProgramDetailScreen({
    super.key,
    required this.programId,
  });

  final String programId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = context.colors;
    final async = ref.watch(programDetailProvider(programId));

    return Scaffold(
      appBar: AppBar(
        backgroundColor: colors.forestDeep,
        foregroundColor: Colors.white,
        title: const Text('Program Details'),
      ),
      body: async.when(
        data: (program) => SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: colors.forestGradient,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4,),
                      decoration: BoxDecoration(
                        color: colors.goldPrimary,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Text(
                        'ACADEMIC PROGRAM',
                        style: TextStyle(
                          color: Colors.black,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      program.title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (program.description.isNotEmpty) ...[
                      const SizedBox(height: 12),
                      Text(
                        program.description,
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.87),
                          fontSize: 14,
                          height: 1.5,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Program Features
              Text(
                'Program Features',
                style: Theme.of(context)
                    .textTheme
                    .titleMedium
                    ?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              _buildFeatureTile(
                icon: Icons.menu_book_rounded,
                title: 'Structured Curriculum',
                subtitle:
                    '${program.courseCount > 0 ? program.courseCount : "Comprehensive"} core & elective courses',
              ),
              _buildFeatureTile(
                icon: Icons.card_membership_rounded,
                title: 'Certificate & Diploma',
                subtitle: 'Recognized academic qualifications upon graduation',
              ),
              _buildFeatureTile(
                icon: Icons.online_prediction_rounded,
                title: 'Flexible Online Learning',
                subtitle: 'Study at your own pace with instructor support',
              ),

              const SizedBox(height: 32),

              // Apply Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: program.applicationsClosed
                      ? null
                      : () => context.push('/programs/$programId/apply'),
                  icon: const Icon(Icons.edit_note_rounded, size: 24),
                  label: Text(
                    program.applicationsClosed
                        ? 'Applications Closed'
                        : 'Apply for Program',
                    style: const TextStyle(
                        fontSize: 16, fontWeight: FontWeight.bold,),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: colors.goldPrimary,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        loading: () => const Padding(
          padding: EdgeInsets.all(20),
          child: AppShimmer(height: 200),
        ),
        error: (e, __) => Padding(
          padding: const EdgeInsets.all(20),
          child: ErrorBanner(message: e.toString()),
        ),
      ),
    );
  }

  Widget _buildFeatureTile({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A).withValues(alpha: 0.06),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: const Color(0xFFC9973A), size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                      fontWeight: FontWeight.bold, fontSize: 14,),
                ),
                Text(
                  subtitle,
                  style: const TextStyle(color: Colors.black54, fontSize: 12),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

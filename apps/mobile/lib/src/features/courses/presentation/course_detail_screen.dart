import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/localization/localized_text.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/router/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/error_banner.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../dashboard/application/dashboard_controller.dart';
import '../../downloads/application/downloads_controller.dart';
import '../../downloads/data/download_item.dart';
import '../data/course_dto.dart';
import '../data/courses_repository.dart';
import 'widgets/curriculum_list.dart';

class CourseDetailScreen extends ConsumerStatefulWidget {
  const CourseDetailScreen({super.key, required this.courseId});

  final String courseId;

  @override
  ConsumerState<CourseDetailScreen> createState() => _CourseDetailScreenState();
}

class _CourseDetailScreenState extends ConsumerState<CourseDetailScreen> {
  bool _enrolling = false;

  Future<void> _enroll(CourseDetailDto course) async {
    setState(() => _enrolling = true);
    try {
      await ref.read(coursesRepositoryProvider).enroll(course.id);
      ref.invalidate(courseDetailProvider(widget.courseId));
      ref.invalidate(dashboardControllerProvider);
      _snack('You are enrolled. Happy learning!');
    } on ApiException catch (e) {
      _snack(e.message);
    } finally {
      if (mounted) setState(() => _enrolling = false);
    }
  }

  void _openPlayer() {
    context.push(AppRoutes.courseLearnPath(widget.courseId));
  }

  Future<void> _toggleSaveOffline(CourseDetailDto course) async {
    final ctrl = ref.read(downloadsControllerProvider.notifier);
    if (ctrl.isSaved(course.id)) {
      await ctrl.remove(course.id);
      _snack('Removed from downloads.');
      return;
    }
    try {
      await ctrl.save(DownloadItem(
        courseId: course.id,
        title: course.title,
        thumbnail: course.thumbnail,
        savedAt: DateTime.now(),
      ),);
      _snack('Saved for offline.');
    } on Object {
      _snack('Could not save. Check your connection and try again.');
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
    final async = ref.watch(courseDetailProvider(widget.courseId));

    return Scaffold(
      body: async.when(
        loading: () => const _DetailSkeleton(),
        error: (_, __) => _DetailError(
          onRetry: () => ref.invalidate(courseDetailProvider(widget.courseId)),
        ),
        data: (course) {
          final saved = ref
                  .watch(downloadsControllerProvider)
                  .valueOrNull
                  ?.any((d) => d.courseId == course.id) ??
              false;
          return _DetailContent(
            course: course,
            saved: saved,
            onToggleSave: () => _toggleSaveOffline(course),
            onOpenPlayer: _openPlayer,
          );
        },
      ),
      bottomNavigationBar: async.maybeWhen(
        data: (course) => _CtaBar(
          course: course,
          busy: _enrolling,
          onEnroll: () => _enroll(course),
          onContinue: _openPlayer,
        ),
        orElse: () => null,
      ),
    );
  }
}

class _DetailContent extends StatelessWidget {
  const _DetailContent({
    required this.course,
    required this.saved,
    required this.onToggleSave,
    required this.onOpenPlayer,
  });
  final CourseDetailDto course;
  final bool saved;
  final VoidCallback onToggleSave;
  final VoidCallback onOpenPlayer;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final title = course.title.resolveFor(context);
    final subtitle = course.subtitle.resolveFor(context);
    final description = course.description.resolveFor(context);

    return CustomScrollView(
      slivers: [
        SliverAppBar(
          expandedHeight: 240,
          pinned: true,
          actions: [
            if (course.isEnrolled)
              IconButton(
                tooltip: saved ? 'Remove download' : 'Save for offline',
                icon: Icon(saved
                    ? Icons.download_done_rounded
                    : Icons.download_outlined,),
                onPressed: onToggleSave,
              ),
          ],
          flexibleSpace: FlexibleSpaceBar(
            background: _HeroImage(url: course.thumbnail, title: title),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          sliver: SliverList.list(
            children: [
              Text(title, style: text.headlineMedium),
              if (subtitle.isNotEmpty) ...[
                const SizedBox(height: AppSpacing.sm),
                Text(subtitle,
                    style: text.bodyLarge?.copyWith(color: colors.textSecondary),),
              ],
              const SizedBox(height: AppSpacing.lg),
              _MetaWrap(course: course),
              const SizedBox(height: AppSpacing.xl),
              if (course.instructor != null) ...[
                _InstructorCard(instructor: course.instructor!),
                const SizedBox(height: AppSpacing.xl),
              ],
              if (description.isNotEmpty) ...[
                Text('About this course', style: text.titleLarge),
                const SizedBox(height: AppSpacing.sm),
                Text(description,
                    style: text.bodyMedium
                        ?.copyWith(color: colors.textSecondary, height: 1.6),),
                const SizedBox(height: AppSpacing.xl),
              ],
              Text('Course content', style: text.titleLarge),
              const SizedBox(height: AppSpacing.xs),
              Text(
                '${course.sections.length} sections · ${course.lessonCount} lessons · ${Formatters.duration(course.totalDurationSeconds)}',
                style: text.bodySmall?.copyWith(color: colors.textMuted),
              ),
              const SizedBox(height: AppSpacing.md),
              CurriculumList(
                sections: course.sections,
                isEnrolled: course.isEnrolled,
                onLessonTap: (_, lesson) {
                  if (course.isEnrolled || lesson.isAccessiblePreview) {
                    onOpenPlayer();
                  }
                },
              ),
              const SizedBox(height: AppSpacing.xxl),
            ],
          ),
        ),
      ],
    );
  }
}

class _HeroImage extends StatelessWidget {
  const _HeroImage({required this.url, required this.title});
  final String? url;
  final String title;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final hasImage = url != null && url!.startsWith('http');
    return Stack(
      fit: StackFit.expand,
      children: [
        if (hasImage)
          CachedNetworkImage(
            imageUrl: url!,
            fit: BoxFit.cover,
            memCacheWidth:
                (MediaQuery.sizeOf(context).width * MediaQuery.devicePixelRatioOf(context))
                    .round(),
            errorWidget: (_, __, ___) =>
                DecoratedBox(decoration: BoxDecoration(gradient: colors.forestGradient)),
          )
        else
          DecoratedBox(decoration: BoxDecoration(gradient: colors.forestGradient)),
        const DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Colors.transparent, Colors.black38],
            ),
          ),
        ),
      ],
    );
  }
}

class _MetaWrap extends StatelessWidget {
  const _MetaWrap({required this.course});
  final CourseDetailDto course;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final chips = <(IconData, String)>[
      if (course.avgRating > 0)
        (Icons.star_rounded, '${course.avgRating.toStringAsFixed(1)} (${course.reviewCount})'),
      (Icons.people_alt_rounded, '${Formatters.compact(course.enrollmentCount)} enrolled'),
      (Icons.signal_cellular_alt_rounded, _title(course.level)),
      if (course.weeksDuration != null)
        (Icons.calendar_today_rounded, '${course.weeksDuration} weeks'),
    ];
    return Wrap(
      spacing: AppSpacing.sm,
      runSpacing: AppSpacing.sm,
      children: [
        for (final (icon, label) in chips)
          Container(
            padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md, vertical: AppSpacing.xs,),
            decoration: BoxDecoration(
              color: colors.surfaceMuted,
              borderRadius: AppRadii.rPill,
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, size: 14, color: colors.forestLight),
                const SizedBox(width: 4),
                Text(label, style: Theme.of(context).textTheme.labelSmall),
              ],
            ),
          ),
      ],
    );
  }

  static String _title(String s) =>
      s.isEmpty ? '' : s[0].toUpperCase() + s.substring(1).toLowerCase();
}

class _InstructorCard extends StatelessWidget {
  const _InstructorCard({required this.instructor});
  final CourseInstructorDto instructor;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final hasAvatar =
        instructor.avatar != null && instructor.avatar!.startsWith('http');
    return Row(
      children: [
        CircleAvatar(
          radius: 26,
          backgroundColor: colors.forestMid,
          backgroundImage: hasAvatar ? CachedNetworkImageProvider(instructor.avatar!) : null,
          child: hasAvatar
              ? null
              : Text(
                  instructor.name.isNotEmpty
                      ? instructor.name.characters.first.toUpperCase()
                      : '?',
                  style: const TextStyle(color: Colors.white),),
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Instructor',
                  style: text.bodySmall?.copyWith(color: colors.textMuted),),
              Text(instructor.name, style: text.titleMedium),
              if (instructor.church != null && instructor.church!.isNotEmpty)
                Text(instructor.church!,
                    style: text.bodySmall?.copyWith(color: colors.textSecondary),),
            ],
          ),
        ),
      ],
    );
  }
}

class _CtaBar extends StatelessWidget {
  const _CtaBar({
    required this.course,
    required this.busy,
    required this.onEnroll,
    required this.onContinue,
  });

  final CourseDetailDto course;
  final bool busy;
  final VoidCallback onEnroll;
  final VoidCallback onContinue;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;

    return SafeArea(
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          color: colors.surface,
          border: Border(top: BorderSide(color: colors.border)),
        ),
        child: Row(
          children: [
            if (!course.isEnrolled) ...[
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('Price',
                      style: text.labelSmall?.copyWith(color: colors.textMuted),),
                  Text(
                    Formatters.price(
                      amount: course.price,
                      currency: course.currency,
                      isFree: course.isFree,
                    ),
                    style: text.titleLarge?.copyWith(color: colors.goldDark),
                  ),
                ],
              ),
              const SizedBox(width: AppSpacing.lg),
            ],
            Expanded(
              child: PrimaryButton(
                label: course.isEnrolled ? 'Continue learning' : 'Enroll now',
                variant: ButtonVariant.gold,
                icon: course.isEnrolled
                    ? Icons.play_arrow_rounded
                    : Icons.school_rounded,
                isLoading: busy,
                onPressed: busy ? null : (course.isEnrolled ? onContinue : onEnroll),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DetailError extends StatelessWidget {
  const _DetailError({required this.onRetry});
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Center(
          child: ErrorBanner(
            message: "We couldn't load this course. Please try again.",
            onRetry: onRetry,
          ),
        ),
      ),
    );
  }
}

class _DetailSkeleton extends StatelessWidget {
  const _DetailSkeleton();
  @override
  Widget build(BuildContext context) {
    return const Center(child: CircularProgressIndicator());
  }
}

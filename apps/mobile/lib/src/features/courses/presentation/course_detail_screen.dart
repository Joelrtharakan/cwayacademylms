import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/i18n/app_translations.dart';
import '../../../core/i18n/i18n_extension.dart';
import '../../../core/localization/localized_text.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/router/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_dimens.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/error_banner.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../auth/application/auth_controller.dart';
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
    final user = ref.read(currentUserProvider);
    if (user == null) {
      final colors = context.colors;
      await showModalBottomSheet<void>(
        context: context,
        backgroundColor: colors.surface,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        builder: (ctx) => Padding(
          padding: const EdgeInsets.all(AppSpacing.xl),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                context.tr('mobile.detail.signInToEnroll'),
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: AppSpacing.xs),
              Text(
                context.tr('mobile.detail.signInPrompt', {'title': course.title.resolveFor(context)}),
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: colors.textSecondary,
                    ),
              ),
              const SizedBox(height: AppSpacing.xl),
              PrimaryButton(
                label: context.tr('mobile.detail.signInExisting'),
                variant: ButtonVariant.gold,
                onPressed: () {
                  Navigator.of(ctx).pop();
                  context.push('${AppRoutes.login}?pendingCourseId=${course.id}');
                },
              ),
              const SizedBox(height: AppSpacing.md),
              PrimaryButton(
                label: context.tr('mobile.detail.createNew'),
                variant: ButtonVariant.outline,
                onPressed: () {
                  Navigator.of(ctx).pop();
                  context.push('${AppRoutes.register}?pendingCourseId=${course.id}');
                },
              ),
              const SizedBox(height: AppSpacing.md),
            ],
          ),
        ),
      );
      return;
    }

    setState(() => _enrolling = true);
    try {
      await ref.read(coursesRepositoryProvider).enroll(course.id);
      ref.invalidate(courseDetailProvider(widget.courseId));
      ref.invalidate(dashboardControllerProvider);
      _snack(AppTranslations.tg('mobile.detail.enrolled'));
    } on ApiException catch (e) {
      _snack(e.message);
    } finally {
      if (mounted) setState(() => _enrolling = false);
    }
  }

  Future<void> _unenroll(CourseDetailDto course) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(context.tr('mobile.detail.unenrollTitle')),
        content: Text(
          context.tr('mobile.detail.unenrollPrompt', {'title': course.title.resolveFor(context)}),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: Text(context.tr('mobile.common.cancel')),
          ),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: Text(context.tr('mobile.detail.unenroll')),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    setState(() => _enrolling = true);
    try {
      await ref.read(coursesRepositoryProvider).unenroll(course.id);
      ref.invalidate(courseDetailProvider(widget.courseId));
      ref.invalidate(dashboardControllerProvider);
      _snack(AppTranslations.tg('mobile.detail.unenrolled'));
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
      _snack(AppTranslations.tg('mobile.downloads.removed'));
      return;
    }
    try {
      await ctrl.save(DownloadItem(
        courseId: course.id,
        title: course.title,
        thumbnail: course.thumbnail,
        savedAt: DateTime.now(),
      ),);
      _snack(AppTranslations.tg('mobile.downloads.saved'));
    } on Object {
      _snack(AppTranslations.tg('mobile.downloads.saveFailed'));
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
          onUnenroll: () => _unenroll(course),
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
          iconTheme: const IconThemeData(color: Colors.white),
          actionsIconTheme: const IconThemeData(color: Colors.white),
          leading: Padding(
            padding: const EdgeInsets.all(8.0),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.5),
                shape: BoxShape.circle,
              ),
              child: IconButton(
                icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
                tooltip: context.tr('mobile.common.back'),
                onPressed: () => context.pop(),
              ),
            ),
          ),
          actions: [
            if (course.isEnrolled)
              Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.5),
                    shape: BoxShape.circle,
                  ),
                  child: IconButton(
                    tooltip: saved
                        ? context.tr('mobile.detail.removeDownload')
                        : context.tr('mobile.detail.saveForOffline'),
                    icon: Icon(
                      saved
                          ? Icons.download_done_rounded
                          : Icons.download_outlined,
                      color: Colors.white,
                    ),
                    onPressed: onToggleSave,
                  ),
                ),
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
                Text(context.tr('mobile.detail.aboutCourse'), style: text.titleLarge),
                const SizedBox(height: AppSpacing.sm),
                Text(description,
                    style: text.bodyMedium
                        ?.copyWith(color: colors.textSecondary, height: 1.6),),
                const SizedBox(height: AppSpacing.xl),
              ],
              Text(context.tr('mobile.detail.courseContent'), style: text.titleLarge),
              const SizedBox(height: AppSpacing.xs),
              Text(
                context.tr('mobile.detail.contentSummary', {
                  'sections': course.sections.length,
                  'lessons': course.lessonCount,
                  'duration': Formatters.duration(course.totalDurationSeconds),
                }),
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
      (Icons.people_alt_rounded, context.tr('mobile.detail.enrolledCount', {'count': Formatters.compact(course.enrollmentCount)})),
      (Icons.signal_cellular_alt_rounded, _title(course.level)),
      if (course.weeksDuration != null)
        (Icons.calendar_today_rounded, context.tr('mobile.detail.weeks', {'count': course.weeksDuration})),
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
              Text(context.tr('student.player.instructor'),
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
    required this.onUnenroll,
    required this.onContinue,
  });

  final CourseDetailDto course;
  final bool busy;
  final VoidCallback onEnroll;
  final VoidCallback onUnenroll;
  final VoidCallback onContinue;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final text = Theme.of(context).textTheme;
    final isProgramCourse = course.programId != null && course.programId!.isNotEmpty;

    return SafeArea(
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          color: colors.surface,
          border: Border(top: BorderSide(color: colors.border)),
        ),
        child: Row(
          children: [
            if (!course.isEnrolled && !isProgramCourse) ...[
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(context.tr('mobile.detail.price'),
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
              child: isProgramCourse && !course.isEnrolled
                  ? PrimaryButton(
                      label: context.tr('mobile.detail.applyProgram'),
                      variant: ButtonVariant.gold,
                      icon: Icons.edit_note_rounded,
                      onPressed: () => context.push('/programs/${course.programId}/apply'),
                    )
                  : PrimaryButton(
                      label: course.isEnrolled
                          ? context.tr('mobile.detail.continueLearning')
                          : context.tr('mobile.detail.enrollNow'),
                      variant: ButtonVariant.gold,
                      icon: course.isEnrolled
                          ? Icons.play_arrow_rounded
                          : Icons.school_rounded,
                      isLoading: busy,
                      onPressed: busy ? null : (course.isEnrolled ? onContinue : onEnroll),
                    ),
            ),
            if (course.isEnrolled) ...[
              const SizedBox(width: 10),
              OutlinedButton.icon(
                onPressed: busy ? null : onUnenroll,
                icon: const Icon(Icons.logout_rounded, size: 18, color: Colors.red),
                label: Text(
                  context.tr('mobile.detail.unenroll'),
                  style: const TextStyle(
                    color: Colors.red,
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Colors.red),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                  minimumSize: const Size(0, 48),
                  maximumSize: const Size(130, 48),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ],
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
            message: context.tr('mobile.detail.loadError'),
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

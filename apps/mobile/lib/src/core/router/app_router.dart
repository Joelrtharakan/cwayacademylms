import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/admin/presentation/admin_users_screen.dart';
import '../../features/assignments/assignment_args.dart';
import '../../features/assignments/presentation/assignment_detail_screen.dart';
import '../../features/assignments/presentation/assignments_list_screen.dart';
import '../../features/auth/application/auth_controller.dart';
import '../../features/auth/presentation/forgot_password_screen.dart';
import '../../features/auth/presentation/lock_screen.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/register_screen.dart';
import '../../features/auth/presentation/verify_email_screen.dart';
import '../../features/certificates/data/certificate_dto.dart';
import '../../features/certificates/presentation/certificate_detail_screen.dart';
import '../../features/certificates/presentation/certificates_screen.dart';
import '../../features/courses/presentation/course_detail_screen.dart';
import '../../features/courses/presentation/courses_browse_screen.dart';
import '../../features/downloads/presentation/downloads_screen.dart';
import '../../features/instructor/presentation/grading_queue_screen.dart';
import '../../features/instructor/presentation/instructor_course_screen.dart';
import '../../features/learn/presentation/lesson_player_screen.dart';
import '../../features/notifications/presentation/notifications_screen.dart';
import '../../features/onboarding/presentation/apply_webview_screen.dart';
import '../../features/onboarding/presentation/welcome_screen.dart';
import '../../features/profile/presentation/profile_edit_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/programs/presentation/program_detail_screen.dart';
import '../../features/programs/presentation/programs_browse_screen.dart';
import '../../features/quiz/presentation/quiz_screen.dart';
import '../../features/quiz/quiz_args.dart';
import '../../features/settings/presentation/change_password_screen.dart';
import '../../features/settings/presentation/settings_screen.dart';
import '../../features/shell/presentation/home_shell.dart';
import '../../features/shell/presentation/role_home.dart';
import '../../features/splash/presentation/splash_screen.dart';
import '../env/app_env.dart';

/// Route path constants — referenced everywhere instead of raw strings.
class AppRoutes {
  const AppRoutes._();
  static const splash = '/';
  static const login = '/auth/login';
  static const register = '/auth/register';
  static const forgotPassword = '/auth/forgot-password';
  static const verifyEmail = '/auth/verify-email';
  static const lock = '/lock';
  static const home = '/home';
  static const courses = '/courses';
  static const notifications = '/notifications';
  static const profile = '/profile';
  static const profileEdit = '/profile/edit';
  static const settings = '/settings';
  static const changePassword = '/change-password';
  static const downloads = '/downloads';
  static const courseDetail = '/course/:id';
  static String courseDetailPath(String id) => '/course/$id';
  static const courseLearn = '/course/:id/learn';
  static String courseLearnPath(String courseId, {String? lessonId}) =>
      lessonId == null
          ? '/course/$courseId/learn'
          : '/course/$courseId/learn?lessonId=$lessonId';
  static const quiz = '/quiz/:quizId';
  static String quizPath(String quizId) => '/quiz/$quizId';
  static const assignments = '/assignments';
  static const assignmentDetail = '/assignment/:id';
  static String assignmentPath(String id) => '/assignment/$id';
  static const adminUsers = '/admin/users';
  static const grading = '/instructor/grading';
  static const instructorCourse = '/instructor/course/:id';
  static String instructorCoursePath(String id) => '/instructor/course/$id';
  static const certificates = '/certificates';
  static const certificateDetail = '/certificate/:id';
  static String certificatePath(String id) => '/certificate/$id';

  // ── Public onboarding (no authentication required) ──────────────────────────
  static const welcome = '/welcome';
  static const programsBrowse = '/programs';
  static const programDetail = '/programs/:id';
  static String programDetailPath(String id) => '/programs/$id';
  static const programApply = '/programs/:id/apply';
  static String programApplyPath(String id) => '/programs/$id/apply';
  static const apply = '/apply';
  static const coursesBrowse = '/courses-browse';

  static const _authRoutes = {login, register, forgotPassword, verifyEmail};
  static bool isAuthRoute(String location) =>
      _authRoutes.any(location.startsWith);

  /// Routes a prospective (unauthenticated) student may visit without signing in.
  static bool isPublic(String location) =>
      location == welcome ||
      location == apply ||
      location == coursesBrowse ||
      location.startsWith('/programs') ||
      location.startsWith('/courses') ||
      location.startsWith('/course/') ||
      isAuthRoute(location);
}

/// App router. Redirect is driven by [authControllerProvider]; a lightweight
/// ValueNotifier bridges Riverpod changes into GoRouter's refreshListenable.
final routerProvider = Provider<GoRouter>((ref) {
  final refresh = ValueNotifier<int>(0);
  ref.onDispose(refresh.dispose);
  ref.listen(authControllerProvider, (_, __) => refresh.value++);

  return GoRouter(
    initialLocation: AppRoutes.splash,
    debugLogDiagnostics: kDebugMode,
    refreshListenable: refresh,
    redirect: (context, state) {
      final auth = ref.read(authControllerProvider);
      final loc = state.matchedLocation;

      // Session resolving → hold seamlessly on matching dark background
      if (auth.isLoading || !auth.hasValue) {
        return loc == AppRoutes.splash ? null : AppRoutes.splash;
      }

      final status = auth.requireValue;
      final onAuthRoute = AppRoutes.isAuthRoute(loc);

      if (status.isLocked) {
        return loc == AppRoutes.lock ? null : AppRoutes.lock;
      }

      if (status.isAuthenticated) {
        if (loc == AppRoutes.splash ||
            loc == AppRoutes.lock ||
            loc == AppRoutes.welcome ||
            onAuthRoute) {
          return AppRoutes.home;
        }
        return null;
      }

      // Unauthenticated → if on splash, go directly to WelcomeScreen
      if (loc == AppRoutes.splash) {
        return AppRoutes.welcome;
      }

      // Allow prospective students to browse programs, apply, sign in
      if (AppRoutes.isPublic(loc)) return null;
      return AppRoutes.welcome;
    },
    routes: [
      GoRoute(
        path: AppRoutes.splash,
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: AppRoutes.welcome,
        builder: (context, state) => const WelcomeScreen(),
      ),
      GoRoute(
        path: AppRoutes.login,
        builder: (context, state) => LoginScreen(
          pendingCourseId: state.uri.queryParameters['pendingCourseId'],
        ),
      ),
      GoRoute(
        path: AppRoutes.register,
        builder: (context, state) => RegisterScreen(
          pendingCourseId: state.uri.queryParameters['pendingCourseId'],
        ),
      ),
      GoRoute(
        path: AppRoutes.forgotPassword,
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      GoRoute(
        path: AppRoutes.verifyEmail,
        builder: (context, state) =>
            VerifyEmailScreen(email: state.extra as String?),
      ),
      GoRoute(
        path: AppRoutes.lock,
        builder: (context, state) => const LockScreen(),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) =>
            HomeShell(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.home,
                builder: (context, state) => const RoleHome(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.courses,
                builder: (context, state) {
                  final tabStr = state.uri.queryParameters['tab'];
                  final initialTab = tabStr == '1' ? 1 : 0;
                  return RoleCoursesTab(initialTabIndex: initialTab);
                },
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.notifications,
                builder: (context, state) => const NotificationsScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.profile,
                builder: (context, state) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),
      GoRoute(
        path: AppRoutes.courseDetail,
        pageBuilder: (context, state) => NoTransitionPage(
          key: state.pageKey,
          child: CourseDetailScreen(courseId: state.pathParameters['id']!),
        ),
      ),
      GoRoute(
        path: AppRoutes.courseLearn,
        pageBuilder: (context, state) => NoTransitionPage(
          key: state.pageKey,
          child: LessonPlayerScreen(
            courseId: state.pathParameters['id']!,
            initialLessonId: state.uri.queryParameters['lessonId'],
          ),
        ),
      ),
      GoRoute(
        path: AppRoutes.quiz,
        builder: (context, state) => QuizScreen(
          quizId: state.pathParameters['quizId']!,
          args: state.extra as QuizArgs?,
        ),
      ),
      GoRoute(
        path: AppRoutes.assignments,
        builder: (context, state) => const AssignmentsListScreen(),
      ),
      GoRoute(
        path: AppRoutes.assignmentDetail,
        builder: (context, state) => AssignmentDetailScreen(
          assignmentId: state.pathParameters['id']!,
          args: state.extra as AssignmentArgs?,
        ),
      ),
      GoRoute(
        path: AppRoutes.adminUsers,
        builder: (context, state) => const AdminUsersScreen(),
      ),
      GoRoute(
        path: AppRoutes.grading,
        builder: (context, state) => const GradingQueueScreen(),
      ),
      GoRoute(
        path: AppRoutes.instructorCourse,
        builder: (context, state) => InstructorCourseScreen(
          courseId: state.pathParameters['id']!,
          courseTitle: state.extra as String?,
        ),
      ),
      GoRoute(
        path: AppRoutes.certificates,
        builder: (context, state) => const CertificatesScreen(),
      ),
      GoRoute(
        path: AppRoutes.certificateDetail,
        builder: (context, state) => CertificateDetailScreen(
          certificateId: state.pathParameters['id']!,
          certificate: state.extra as CertificateDto?,
        ),
      ),
      GoRoute(
        path: AppRoutes.profileEdit,
        builder: (context, state) => const ProfileEditScreen(),
      ),
      GoRoute(
        path: AppRoutes.settings,
        builder: (context, state) => const SettingsScreen(),
      ),
      GoRoute(
        path: AppRoutes.changePassword,
        builder: (context, state) => const ChangePasswordScreen(),
      ),
      GoRoute(
        path: AppRoutes.programsBrowse,
        builder: (context, state) => const ProgramsBrowseScreen(),
      ),
      GoRoute(
        path: AppRoutes.coursesBrowse,
        builder: (context, state) => const CoursesBrowseScreen(),
      ),
      GoRoute(
        path: AppRoutes.programDetail,
        builder: (context, state) => ProgramDetailScreen(
          programId: state.pathParameters['id']!,
        ),
      ),
      // Applying stays on the website — opened in an in-app WebView.
      GoRoute(
        path: AppRoutes.programApply,
        builder: (context, state) => ApplyWebViewScreen(
          url: AppEnv.programApplyUrl(state.pathParameters['id']!),
          title: 'Apply',
        ),
      ),
      GoRoute(
        path: AppRoutes.apply,
        builder: (context, state) => ApplyWebViewScreen(
          url: AppEnv.applicationUrl,
          title: 'Apply',
        ),
      ),
      GoRoute(
        path: AppRoutes.downloads,
        builder: (context, state) => const DownloadsScreen(),
      ),
    ],
  );
});

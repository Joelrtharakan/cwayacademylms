import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/application/auth_controller.dart';
import '../../courses/presentation/catalog_screen.dart';
import '../../courses/presentation/my_courses_screen.dart';
import '../../courses/presentation/student_courses_screen.dart';
import '../../dashboard/presentation/admin_dashboard_screen.dart';
import '../../dashboard/presentation/dashboard_screen.dart';
import '../../dashboard/presentation/instructor_dashboard_screen.dart';

/// Renders the correct Home surface for the signed-in user's role.
class RoleHome extends ConsumerWidget {
  const RoleHome({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    if (user?.isAdmin ?? false) return const AdminDashboardScreen();
    if (user?.isInstructor ?? false) return const InstructorDashboardScreen();
    return const DashboardScreen();
  }
}

/// Renders the correct "Courses" tab for the user:
/// - Unauthenticated users see the public catalog.
/// - Signed-in students see StudentCoursesScreen (showing Program name & Standalone courses separately).
/// - Instructors/Admins see MyCoursesScreen (course management).
class RoleCoursesTab extends ConsumerWidget {
  const RoleCoursesTab({super.key, this.initialTabIndex = 0});

  final int initialTabIndex;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    if (user == null) {
      return CatalogScreen(initialTabIndex: initialTabIndex);
    }
    final manages = user.isAdmin || user.isInstructor;
    return manages ? const MyCoursesScreen() : const StudentCoursesScreen();
  }
}

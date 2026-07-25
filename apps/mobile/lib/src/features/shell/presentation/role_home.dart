import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/application/auth_controller.dart';
import '../../courses/presentation/catalog_screen.dart';
import '../../courses/presentation/my_courses_screen.dart';
import '../../dashboard/presentation/admin_dashboard_screen.dart';
import '../../dashboard/presentation/dashboard_screen.dart';
import '../../dashboard/presentation/instructor_dashboard_screen.dart';

/// Renders the correct Home surface for the signed-in user's role.
///
/// Role is a display concern here only — every underlying screen consumes
/// backend endpoints that independently enforce authorization. Hiding a
/// surface never grants or withholds data on its own.
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

/// Renders the correct "Courses" tab for the signed-in user's role:
/// students browse the public catalog; instructors/admins manage owned courses.
class RoleCoursesTab extends ConsumerWidget {
  const RoleCoursesTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final manages = (user?.isAdmin ?? false) || (user?.isInstructor ?? false);
    return manages ? const MyCoursesScreen() : const CatalogScreen();
  }
}

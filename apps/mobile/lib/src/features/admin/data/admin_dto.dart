/// Platform-wide statistics — `GET /admin/stats`.
class AdminStatsDto {
  const AdminStatsDto({
    required this.totalUsers,
    required this.totalStudents,
    required this.totalInstructors,
    required this.totalCourses,
    required this.publishedCourses,
    required this.pendingApprovals,
    required this.totalEnrollments,
    required this.enrollmentsThisMonth,
    required this.certificatesIssued,
  });

  final int totalUsers;
  final int totalStudents;
  final int totalInstructors;
  final int totalCourses;
  final int publishedCourses;
  final int pendingApprovals;
  final int totalEnrollments;
  final int enrollmentsThisMonth;
  final int certificatesIssued;

  static int _i(dynamic v) => (v as num?)?.toInt() ?? 0;

  factory AdminStatsDto.fromJson(Map<String, dynamic> json) => AdminStatsDto(
        totalUsers: _i(json['totalUsers']),
        totalStudents: _i(json['totalStudents']),
        totalInstructors: _i(json['totalInstructors']),
        totalCourses: _i(json['totalCourses']),
        publishedCourses: _i(json['publishedCourses']),
        pendingApprovals: _i(json['pendingApprovals']),
        totalEnrollments: _i(json['totalEnrollments']),
        enrollmentsThisMonth: _i(json['enrollmentsThisMonth']),
        certificatesIssued: _i(json['certificatesIssued']),
      );
}

/// A user row in the admin directory — `GET /admin/users` → `data.users[]`.
class AdminUserDto {
  const AdminUserDto({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.isBanned,
    required this.isVerified,
    this.avatar,
    this.church,
    this.enrollmentsCount = 0,
    this.coursesCreatedCount = 0,
  });

  final String id;
  final String name;
  final String email;
  final String role;
  final bool isBanned;
  final bool isVerified;
  final String? avatar;
  final String? church;
  final int enrollmentsCount;
  final int coursesCreatedCount;

  factory AdminUserDto.fromJson(Map<String, dynamic> json) {
    final count = json['_count'] as Map<String, dynamic>? ?? const {};
    return AdminUserDto(
      id: json['id'] as String,
      name: json['name'] as String? ?? 'Unnamed',
      email: json['email'] as String? ?? '',
      role: json['role'] as String? ?? 'STUDENT',
      isBanned: json['isBanned'] as bool? ?? false,
      isVerified: json['isVerified'] as bool? ?? false,
      avatar: json['avatar'] as String?,
      church: json['church'] as String?,
      enrollmentsCount: (count['enrollments'] as num?)?.toInt() ?? 0,
      coursesCreatedCount: (count['coursesCreated'] as num?)?.toInt() ?? 0,
    );
  }
}

class AdminUsersPageDto {
  const AdminUsersPageDto({required this.users, required this.total});
  final List<AdminUserDto> users;
  final int total;

  factory AdminUsersPageDto.fromJson(Map<String, dynamic> json) {
    final list = json['users'] as List? ?? const [];
    return AdminUsersPageDto(
      users: list
          .whereType<Map<String, dynamic>>()
          .map(AdminUserDto.fromJson)
          .toList(),
      total: (json['total'] as num?)?.toInt() ?? 0,
    );
  }
}

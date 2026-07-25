import 'package:freezed_annotation/freezed_annotation.dart';

part 'notification_dto.freezed.dart';
part 'notification_dto.g.dart';

/// `GET /student/notifications` → `data`.
@freezed
class NotificationsData with _$NotificationsData {
  const factory NotificationsData({
    @Default(<NotificationDto>[]) List<NotificationDto> notifications,
    @Default(0) int unreadCount,
  }) = _NotificationsData;

  factory NotificationsData.fromJson(Map<String, dynamic> json) =>
      _$NotificationsDataFromJson(json);
}

@freezed
class NotificationDto with _$NotificationDto {
  const NotificationDto._();

  const factory NotificationDto({
    required String id,
    @Default('') String type,
    @Default('') String title,
    @Default('') String body,
    String? link,
    @Default(false) bool isRead,
    DateTime? createdAt,
  }) = _NotificationDto;

  factory NotificationDto.fromJson(Map<String, dynamic> json) =>
      _$NotificationDtoFromJson(json);

  bool get hasLink => link != null && link!.isNotEmpty && link != '#';
}

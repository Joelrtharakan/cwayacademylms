import 'package:flutter/widgets.dart';

import '../../../core/i18n/i18n_extension.dart';
import '../data/notification_dto.dart';

/// System notifications are generated on the backend as pre-rendered **English**
/// strings (the DB stores no structured params). To show alerts in the user's
/// language, we re-localize them at render time by [NotificationDto.type]:
/// the dynamic tokens (course titles, names, grades) are parsed out of the
/// English text and re-rendered from the `mobile.notif.*` catalog.
///
/// Anything we can't confidently parse — admin BROADCASTs, free-form message
/// bodies, unknown types, or reworded strings — falls back to the server text,
/// so nothing is ever lost. Resolving here (not at fetch time) means switching
/// language instantly re-localizes the whole alerts list.
({String title, String body}) localizeNotification(
  BuildContext context,
  NotificationDto n,
) {
  String tr(String key, [Map<String, Object?> p = const {}]) => context.tr(key, p);

  // Returns the first capture group of [re] against [source], or null.
  String? cap(RegExp re, String source) => re.firstMatch(source)?.group(1);

  switch (n.type.toUpperCase()) {
    case 'COURSE_APPROVED':
      final course = cap(RegExp(r"^'(.*)' is now live"), n.body);
      return (
        title: tr('mobile.notif.courseApproved.title'),
        body: course == null
            ? n.body
            : tr('mobile.notif.courseApproved.body', {'course': course}),
      );

    case 'COURSE_REJECTED':
      // Body is a free-form revision reason — keep it verbatim.
      return (title: tr('mobile.notif.courseRejected.title'), body: n.body);

    case 'COURSE_INVITATION':
      final course = cap(RegExp(r'invitation: "(.*)"$'), n.body) ??
          cap(RegExp(r"created '(.*)' and assigned"), n.body);
      return (
        title: tr('mobile.notif.courseInvitation.title'),
        body: course == null
            ? n.body
            : tr('mobile.notif.courseInvitation.body', {'course': course}),
      );

    case 'COURSE_PENDING_REVIEW':
      final name = cap(RegExp(r'^(.*) submitted a course for review$'), n.title);
      final course = cap(RegExp(r"^'(.*)' is awaiting"), n.body);
      return (
        title: name == null
            ? n.title
            : tr('mobile.notif.coursePending.title', {'name': name}),
        body: course == null
            ? n.body
            : tr('mobile.notif.coursePending.body', {'course': course}),
      );

    case 'ASSIGNMENT_GRADED':
      final m = RegExp(r"^You scored (.*)/(.*) on '(.*)'$").firstMatch(n.body);
      return (
        title: tr('mobile.notif.assignmentGraded.title'),
        body: m == null
            ? n.body
            : tr('mobile.notif.assignmentGraded.body', {
                'grade': m.group(1),
                'max': m.group(2),
                'title': m.group(3),
              }),
      );

    case 'FORUM_REPLY':
      final title = cap(RegExp(r"post: '(.*)'$"), n.body);
      return (
        title: tr('mobile.notif.forumReply.title'),
        body: title == null
            ? n.body
            : tr('mobile.notif.forumReply.body', {'title': title}),
      );

    case 'NEW_MESSAGE':
      final name = cap(RegExp(r'^New message from (.*)$'), n.title);
      // Body is the message preview — keep it verbatim.
      return (
        title: name == null
            ? n.title
            : tr('mobile.notif.newMessage.title', {'name': name}),
        body: n.body,
      );

    case 'QUIZ_PASSED':
      final quiz = cap(RegExp(r"^You passed '(.*)'!$"), n.title);
      final score = cap(RegExp(r'^You scored (.*)%\.$'), n.body);
      return (
        // Localize either the named title or the generic "You passed a quiz!".
        title: quiz == null
            ? tr('mobile.notif.quizPassed.titleGeneric')
            : tr('mobile.notif.quizPassed.title', {'quiz': quiz}),
        body: score == null
            ? n.body
            : tr('mobile.notif.quizPassed.body', {'score': score}),
      );

    case 'NEW_SUBMISSION':
      final title = cap(RegExp(r"^A student submitted '(.*)'$"), n.body);
      return (
        title: tr('mobile.notif.newSubmission.title'),
        body: title == null
            ? n.body
            : tr('mobile.notif.newSubmission.body', {'title': title}),
      );

    case 'COURSE_COMPLETED':
      final course = cap(RegExp(r"You completed '(.*)'!$"), n.title);
      final program =
          cap(RegExp(r"^You've completed the (.*) program!"), n.body);
      final String body;
      if (program != null) {
        body = tr('mobile.notif.courseCompleted.bodyProgram', {'program': program});
      } else if (RegExp(r'certificate is ready to download').hasMatch(n.body)) {
        body = tr('mobile.notif.courseCompleted.bodyCertificate');
      } else {
        body = n.body;
      }
      return (
        title: course == null
            ? n.title
            : tr('mobile.notif.courseCompleted.title', {'course': course}),
        body: body,
      );

    case 'STUDENT_COMPLETED':
      final name = cap(RegExp(r'^(.*) completed your course$'), n.title);
      final bm = RegExp(r"^(.*) has just finished '(.*)'\.$").firstMatch(n.body);
      return (
        title: name == null
            ? n.title
            : tr('mobile.notif.studentCompleted.title', {'name': name}),
        body: bm == null
            ? n.body
            : tr('mobile.notif.studentCompleted.body',
                {'name': bm.group(1), 'course': bm.group(2)},),
      );

    default:
      // BROADCAST and anything unrecognized: admin-authored / free-form.
      return (title: n.title, body: n.body);
  }
}

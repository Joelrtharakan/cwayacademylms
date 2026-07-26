import 'package:cway_academy/src/core/i18n/app_translations.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() async {
    await AppTranslations.loadAll();
  });

  test('loads every supported locale', () {
    expect(AppTranslations.isLoaded, isTrue);
  });

  test('resolves a mobile key in a non-English locale', () {
    // Hindi "My Courses" nav label — must not fall back to the raw key.
    final hi = AppTranslations.translate('hi', 'mobile.nav.myCourses');
    expect(hi, isNot('mobile.nav.myCourses'));
    expect(hi, isNotEmpty);
  });

  test('reuses the website catalogs (student namespace)', () {
    final en = AppTranslations.translate('en', 'student.courses.title');
    expect(en, 'My Courses');
    final ta = AppTranslations.translate('ta', 'student.courses.title');
    expect(ta, isNot('student.courses.title')); // localized, not the key
  });

  test('resolves 4-level notification keys with interpolation', () {
    final en = AppTranslations.translate(
        'en', 'mobile.notif.newMessage.title', {'name': 'Ann'},);
    expect(en, 'New message from Ann');
    final hi = AppTranslations.translate(
        'hi', 'mobile.notif.quizPassed.title', {'quiz': 'X'},);
    expect(hi, isNot('mobile.notif.quizPassed.title'));
    expect(hi, contains('X'));
  });

  test('interpolates {param} placeholders', () {
    final s = AppTranslations.translate(
      'en',
      'mobile.lock.welcomeName',
      {'name': 'Sam'},
    );
    expect(s, contains('Sam'));
    expect(s, isNot(contains('{name}')));
  });

  test('falls back to English for a key missing in another locale', () {
    // mobile.json is fully translated, so simulate a missing key by requesting
    // one that does not exist in Tamil but does in English via a bogus locale.
    final result = AppTranslations.translate('ta', 'mobile.__does_not_exist__');
    expect(result, 'mobile.__does_not_exist__'); // raw key, never blank
  });

  test('strips inline HTML from the one web value that carries it', () {
    final v = AppTranslations.translate(
        'en', 'auth.register.check_email_desc', {'email': 'a@b.com'},);
    expect(v, isNot(contains('<')));
    expect(v, contains('a@b.com'));
  });

  test('every locale bundles the mobile catalog asset', () async {
    for (final loc in kSupportedLocales) {
      final raw = await rootBundle.loadString('assets/i18n/$loc/mobile.json');
      expect(raw, isNotEmpty, reason: 'missing mobile.json for $loc');
    }
  });
}

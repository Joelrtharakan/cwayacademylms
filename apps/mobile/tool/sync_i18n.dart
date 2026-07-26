// Syncs the website's translation catalogs into the mobile app's assets so the
// two clients share ONE source of truth. The website (apps/web) owns the
// canonical next-intl message files; running this script mirrors them into
// apps/mobile/assets/i18n so future web translation updates propagate with a
// single command.
//
//   dart run tool/sync_i18n.dart
//
// The mobile-only `mobile.json` catalog (strings with no web equivalent) is
// authored directly in assets/i18n and is intentionally NEVER overwritten here.
import 'dart:io';

/// Web namespaces reused verbatim by the mobile app.
const _namespaces = [
  'common',
  'auth',
  'public',
  'admin',
  'instructor',
  'student',
  'landing',
];

const _locales = ['en', 'hi', 'ta', 'te', 'ml', 'kn'];

void main() {
  final scriptDir = File(Platform.script.toFilePath()).parent; // apps/mobile/tool
  final mobileRoot = scriptDir.parent; // apps/mobile
  final webMessages = Directory('${mobileRoot.parent.path}/web/messages');
  final destRoot = Directory('${mobileRoot.path}/assets/i18n');

  if (!webMessages.existsSync()) {
    stderr.writeln('web messages dir not found: ${webMessages.path}');
    exit(1);
  }

  var copied = 0;
  for (final locale in _locales) {
    final destDir = Directory('${destRoot.path}/$locale')..createSync(recursive: true);
    for (final ns in _namespaces) {
      final src = File('${webMessages.path}/$locale/$ns.json');
      if (!src.existsSync()) {
        stderr.writeln('  skip (missing): ${src.path}');
        continue;
      }
      src.copySync('${destDir.path}/$ns.json');
      copied++;
    }
  }
  stdout.writeln('Synced $copied translation files into ${destRoot.path}');
  stdout.writeln('(mobile.json catalogs were left untouched)');
}

import '../i18n/app_translations.dart';

/// Form validators returning `null` when valid or a localized message when
/// invalid. Messages resolve against the active locale via [AppTranslations.tg]
/// (context-free, since validators are plain function references).
class Validators {
  const Validators._();

  static final _emailRe = RegExp(r'^[\w.+-]+@[\w-]+\.[\w.-]+$');

  static String? email(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return AppTranslations.tg('mobile.validation.emailRequired');
    if (!_emailRe.hasMatch(v)) return AppTranslations.tg('mobile.validation.emailInvalid');
    return null;
  }

  static String? password(String? value) {
    final v = value ?? '';
    if (v.isEmpty) return AppTranslations.tg('mobile.validation.passwordRequired');
    if (v.length < 8) return AppTranslations.tg('auth.register.pass_length');
    return null;
  }

  static String? required(String? value, {String? field}) {
    if ((value?.trim() ?? '').isEmpty) {
      return AppTranslations.tg('mobile.validation.fieldRequired', {
        'field': field ?? AppTranslations.tg('mobile.validation.thisField'),
      });
    }
    return null;
  }

  static String? Function(String?) confirm(String Function() other) {
    return (value) {
      if ((value ?? '') != other()) return AppTranslations.tg('auth.register.pass_match');
      return null;
    };
  }
}

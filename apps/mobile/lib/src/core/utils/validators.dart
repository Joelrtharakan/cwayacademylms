/// Form validators returning `null` when valid or a message when invalid.
///
/// Messages are English for now; they move to ARB catalogs in the Multilingual
/// module (the call sites won't change — only the returned strings).
class Validators {
  const Validators._();

  static final _emailRe = RegExp(r'^[\w.+-]+@[\w-]+\.[\w.-]+$');

  static String? email(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return 'Email is required';
    if (!_emailRe.hasMatch(v)) return 'Enter a valid email address';
    return null;
  }

  static String? password(String? value) {
    final v = value ?? '';
    if (v.isEmpty) return 'Password is required';
    if (v.length < 8) return 'Password must be at least 8 characters';
    return null;
  }

  static String? required(String? value, {String field = 'This field'}) {
    if ((value?.trim() ?? '').isEmpty) return '$field is required';
    return null;
  }

  static String? Function(String?) confirm(String Function() other) {
    return (value) {
      if ((value ?? '') != other()) return 'Passwords do not match';
      return null;
    };
  }
}

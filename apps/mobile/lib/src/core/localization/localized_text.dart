import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:json_annotation/json_annotation.dart';

/// Value object for the backend's localized `Json` fields (course/program
/// titles, descriptions …), stored as `{ "en": "...", "hi": "...", ... }`.
///
/// Resolution order: requested locale → English → first non-empty → ''. Also
/// tolerates legacy plain-string values by treating them as English.
@immutable
class LocalizedText {
  const LocalizedText(this.values);

  final Map<String, String> values;

  static const empty = LocalizedText(<String, String>{});

  factory LocalizedText.fromJson(dynamic json) {
    if (json == null) return empty;
    if (json is String) return LocalizedText({'en': json});
    if (json is Map) {
      return LocalizedText({
        for (final entry in json.entries)
          entry.key.toString(): (entry.value ?? '').toString(),
      });
    }
    return empty;
  }

  Map<String, dynamic> toJson() => values;

  bool get isEmpty => values.values.every((v) => v.trim().isEmpty);

  /// [locale] is a language code like `en`, `hi`, `ta`.
  String resolve(String locale) {
    final direct = values[locale];
    if (direct != null && direct.trim().isNotEmpty) return direct;
    final english = values['en'] ?? values['ENGLISH'];
    if (english != null && english.trim().isNotEmpty) return english;
    for (final v in values.values) {
      if (v.trim().isNotEmpty) return v;
    }
    return '';
  }

  @override
  bool operator ==(Object other) =>
      other is LocalizedText && mapEquals(other.values, values);

  @override
  int get hashCode => Object.hashAll(values.entries.map((e) => Object.hash(e.key, e.value)));
}

extension LocalizedTextContext on LocalizedText {
  /// Resolves against the active app locale.
  String resolveFor(BuildContext context) =>
      resolve(Localizations.localeOf(context).languageCode);
}

/// Resolves a value that may be a localized `Json` map, a plain string, or null
/// (e.g. quiz answer text, which is localized, vs. a typed short answer).
String resolveDynamicLocalized(Object? value, String locale) {
  if (value == null) return '';
  if (value is String) return value;
  if (value is Map) return LocalizedText.fromJson(value).resolve(locale);
  return value.toString();
}

extension DynamicLocalizedContext on Object? {
  String resolveDynamicFor(BuildContext context) =>
      resolveDynamicLocalized(this, Localizations.localeOf(context).languageCode);
}

/// Lets Freezed/json_serializable models declare `LocalizedText` fields directly.
class LocalizedTextConverter implements JsonConverter<LocalizedText, dynamic> {
  const LocalizedTextConverter();

  @override
  LocalizedText fromJson(dynamic json) => LocalizedText.fromJson(json);

  @override
  dynamic toJson(LocalizedText object) => object.toJson();
}

import 'package:intl/intl.dart';

/// Presentation helpers for prices and durations, kept framework-agnostic.
class Formatters {
  const Formatters._();

  static final _dateFmt = DateFormat('d MMM yyyy');
  static final _dateTimeFmt = DateFormat('d MMM yyyy, h:mm a');

  static String date(DateTime? d) => d == null ? '—' : _dateFmt.format(d.toLocal());
  static String dateTime(DateTime? d) =>
      d == null ? '—' : _dateTimeFmt.format(d.toLocal());

  /// Human "due" phrasing relative to now.
  static String due(DateTime? d) {
    if (d == null) return 'No due date';
    final now = DateTime.now();
    final diff = d.difference(now);
    if (diff.isNegative) return 'Overdue · ${date(d)}';
    if (diff.inDays == 0) return 'Due today';
    if (diff.inDays == 1) return 'Due tomorrow';
    if (diff.inDays < 7) return 'Due in ${diff.inDays} days';
    return 'Due ${date(d)}';
  }

  static bool isOverdue(DateTime? d) =>
      d != null && d.difference(DateTime.now()).isNegative;

  /// Compact "time ago" like "2m", "3h", "5d", or a date beyond a week.
  static String timeAgo(DateTime? d) {
    if (d == null) return '';
    final diff = DateTime.now().difference(d.toLocal());
    if (diff.inSeconds < 60) return 'now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m';
    if (diff.inHours < 24) return '${diff.inHours}h';
    if (diff.inDays < 7) return '${diff.inDays}d';
    return date(d);
  }

  static const _currencySymbols = {
    'INR': '₹',
    'USD': r'$',
    'EUR': '€',
    'GBP': '£',
  };

  static String price({
    required double amount,
    String currency = 'INR',
    bool isFree = false,
  }) {
    if (isFree || amount <= 0) return 'Free';
    final symbol = _currencySymbols[currency.toUpperCase()] ?? '$currency ';
    final rounded = amount == amount.roundToDouble()
        ? amount.toStringAsFixed(0)
        : amount.toStringAsFixed(2);
    return '$symbol$rounded';
  }

  /// Formats a duration given in seconds as "1h 20m" / "45m" / "30s".
  static String duration(int seconds) {
    if (seconds <= 0) return '—';
    final h = seconds ~/ 3600;
    final m = (seconds % 3600) ~/ 60;
    if (h > 0) return m > 0 ? '${h}h ${m}m' : '${h}h';
    if (m > 0) return '${m}m';
    return '${seconds}s';
  }

  /// Compact count, e.g. 1200 → "1.2k".
  static String compact(int value) {
    if (value < 1000) return '$value';
    if (value < 1000000) {
      final k = value / 1000;
      return '${k == k.roundToDouble() ? k.toStringAsFixed(0) : k.toStringAsFixed(1)}k';
    }
    final m = value / 1000000;
    return '${m == m.roundToDouble() ? m.toStringAsFixed(0) : m.toStringAsFixed(1)}M';
  }
}

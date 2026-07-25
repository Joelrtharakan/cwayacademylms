import 'src/bootstrap.dart';

/// Entry point. All initialization lives in bootstrap() so it can be reused by
/// integration tests and future flavor-specific entry points (main_dev.dart …).
Future<void> main() => bootstrap();

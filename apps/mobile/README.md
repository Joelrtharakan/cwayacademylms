# CWAY Academy — Mobile

The official Flutter client for the CWAY Academy LMS. It is **not** a second LMS:
it consumes the same backend (`apps/api`) as the website (`apps/web`). The API is
the single source of truth — no duplicated auth, business logic, or data models.

## Status

| Module | State |
|---|---|
| 1. Project Setup | ✅ Done |
| 2. Design System | ✅ Done |
| 3. Authentication | ✅ Done (login, register, verify-email, reset, biometric lock) |
| 4. Dashboard | ✅ Done (stats, continue-learning, courses, skeleton/empty/error, pull-to-refresh, resume-revalidate) |
| 5. Courses | ✅ Done (catalog search/filter/sort/infinite-scroll, detail + curriculum, enroll, bottom-nav shell) |
| 6. Lesson Player | ✅ Done (YouTube IFrame player, resume, watched-seconds sync, mark-complete, lesson nav) |
| 7. Quizzes | ✅ Done (attempt, timer, MCQ/TF/short-answer, submit + scored review, retake, lesson auto-complete on pass) |
| 8. Assignments | ✅ Done (list, detail, text+file submit, unsubmit, graded view + feedback, due/overdue, attachments) |
| 9. Certificates | ✅ Done (gallery, branded preview, PDF download + share) |
| 10. Notifications | ✅ Done (center, unread badge, mark read/all, **live SSE** + polling fallback) |
| 11. Profile | ✅ Done (identity, avatar upload, edit profile, theme/biometric, sign out; Profile tab) |
| 12. Settings + Multilingual | ✅ Done (ARB l10n en/hi/ta/te/kn/ml, runtime language switch + persistence, change password, about/version) |
| 13. Offline + Downloads | ✅ Done (Hive JSON cache, connectivity banner, stale-while-offline, save-course-for-offline + Downloads screen) |
| 14. Performance | ✅ Done (transient-GET retry+backoff, image decode caps, bounded image cache; pagination/lazy already in) |
| 15. Production Hardening | ✅ Done (crash guards, friendly error UI, opt-in cert pinning; native/push/release documented below) |

**All 15 modules complete.** Remaining production tasks (below) need the native
project + external services, which can't be generated in this sandbox.

### Performance
- `RetryInterceptor`: retries idempotent GETs on timeout/connection errors with exponential backoff (after auth, skips streams/401s).
- Network images decode at ~display resolution (`memCacheWidth`) and the global image cache is bounded (120 MB / 400 entries).
- Catalog uses lazy `SliverGrid` + infinite-scroll pagination; SSE connects after the first notifications fetch to keep startup light.

### Offline
- `JsonCache` (Hive box, JSON envelopes) — durable cache; startup evicts stale unpinned entries. (Switched from Isar to Hive: Isar 3.x pins an old analyzer that conflicts with Freezed on Dart 3.9.)
- Dashboard / course-detail / learn repos cache on success and **serve stale on network failure**.
- `connectivityProvider` (`connectivity_plus`) drives an offline banner in the shell.
- **Downloads**: "Save for offline" on an enrolled course pins its learn payload + detail (`Downloads` screen, swipe-to-remove). YouTube video itself isn't downloadable (ToS) — offline covers curriculum/metadata/progress views.

Bottom nav: **Learn · Courses · Alerts · Profile** (`StatefulShellRoute`, 4 branches).

### Multilingual
- ARB catalogs in `lib/l10n/` (6 languages) → generated `AppLocalizations` (`flutter pub get` runs gen-l10n; `generate: true`).
- `LocaleController`: runtime switch + local persistence, initialized from the user's `preferredLanguage`; system-default option; RTL-ready via `MaterialApp.locale`.
- **All backend content re-localizes instantly** on switch because every title/label resolves via `LocalizedText.resolveFor(context)`.
- UI-chrome ARB currently covers nav + settings; remaining screens fall back to English (gen-l10n template fallback) and should be filled from the web's reviewed `apps/web/messages/*` catalogs. Indic UI strings here are AI-drafted — **have a native speaker review before release** (see localization QA notes).

> **Real-time (SSE):** an additive backend route `GET /api/v1/stream/notifications`
> (`apps/api/src/routes/sse.routes.ts`) server-side-polls and pushes new
> notifications over a single held connection. It sets `Cache-Control: no-transform`
> (so the compression middleware skips it) and `X-Accel-Buffering: no` (nginx
> passthrough) — no other backend/nginx changes. The app consumes it via a Dio
> streamed request; **REST polling (30s + on-refresh) is always the fallback**, so
> notifications work even if SSE is unavailable.

> **Video** uses the YouTube IFrame player (`youtube_player_iframe`) keyed off
> `lesson.videoUrl` — the same source the website embeds. Resume uses each
> lesson's `watchedSeconds`; position is reported every 5s and saved (throttled)
> to `.../lessons/:id/progress`, which auto-completes the lesson at 80%.
>
> **Platform setup** (after `flutter create . --platforms=android,ios` to generate
> native folders): Android needs `INTERNET` permission (default) + minSdk 21;
> iOS needs `io.flutter.embedded_views_preview=YES` and no ATS block on
> `youtube.com` (standard HTTPS is fine).

> `LocalizedText` (`core/localization/`) resolves the backend's localized `Json`
> fields (course/program titles) by active locale — reused by every content module.

## Prerequisites

Flutter is **not** installed in the CI/analysis sandbox. On a dev machine:

```bash
flutter --version           # Flutter 3.24+ / Dart 3.5+
cd apps/mobile
flutter pub get
```

Code generation (Freezed / json_serializable) is used from the
data modules onward:

```bash
dart run build_runner build --delete-conflicting-outputs
```

## Running

Config is injected with `--dart-define` (no secrets in source):

```bash
# Dev (Android emulator reaches host API at 10.0.2.2:4000)
flutter run --dart-define=FLAVOR=dev

# iOS simulator (uses localhost)
flutter run --dart-define=FLAVOR=dev --dart-define=API_BASE_URL=http://localhost:4000/api/v1

# Production build
flutter build apk --dart-define=FLAVOR=prod
```

## Architecture

Feature-first + Clean Architecture, Riverpod for state, GoRouter for navigation.

```
lib/
├── main.dart                      # entry → bootstrap()
└── src/
    ├── bootstrap.dart             # async init + ProviderScope overrides (composition root)
    ├── app.dart                   # MaterialApp.router, themes, localization delegates
    ├── core/
    │   ├── env/app_env.dart       # flavor + base URLs (--dart-define)
    │   ├── network/               # Dio, cookie-based refresh, ApiException
    │   ├── storage/               # secure token storage, shared prefs
    │   ├── router/app_router.dart # GoRouter + route constants
    │   └── theme/                 # colors, typography, dimens, ThemeData (design system)
    ├── shared/widgets/            # reusable UI (PrimaryButton, AppCard, AppShimmer …)
    └── features/
        ├── <feature>/
        │   ├── data/              # DTOs, remote/local sources, repository impl
        │   ├── domain/            # entities, repository interfaces
        │   ├── application/       # Riverpod controllers/providers
        │   └── presentation/      # screens + widgets
```

### Auth = web-identical, zero backend change

- `POST /auth/login` returns `{ accessToken, user }`; the refresh token arrives as
  an **httpOnly cookie** `cway_refresh`.
- Access token (15 min) → `flutter_secure_storage`, sent as `Authorization: Bearer`.
- Refresh token (7 day) → persisted **cookie jar** (`PersistCookieJar`), auto-sent to
  `POST /auth/refresh`. On any 401 the `AuthInterceptor` single-flights a refresh and
  replays queued requests; on failure it clears the session and signals the router.

### Design tokens

Mirrored 1:1 from `apps/web/src/app/globals.css` — forest greens, gold accents,
cream surfaces; Fraunces (serif display) + Jost (sans) via `google_fonts`. Access
brand colors anywhere with `context.colors.goldPrimary`.

### Sync strategy (decided)

Optimistic writes + offline queue + revalidate-on-focus now, **plus an additive
server-sent-events (SSE) endpoint** on the backend for true real-time push — to be
introduced with the Notifications/sync module (kept backward-compatible).

## Localization

`en, hi, ta, te, kn, ml` — declared in `app.dart`. ARB catalogs and per-language
Noto font fallbacks land in the Multilingual module. Runtime switching + locale
persistence supported.

## Production hardening (Module 15)

Implemented in code:
- **Crash guards** — `runZonedGuarded` + `FlutterError.onError` in `bootstrap.dart`; wire a crash reporter (Sentry/Crashlytics) at the marked spots.
- **Friendly error UI** — `AppErrorWidget` replaces the red screen in release (`ErrorWidget.builder`).
- **Certificate pinning (opt-in)** — off by default; enable with
  `--dart-define=CERT_PINS=<sha256-leaf-fingerprint>[,<second-pin>]`. Only matching
  leaf certs are accepted (`buildDio` → `_applyCertificatePinning`).
- **Secure by design** — access token in Keychain/EncryptedSharedPreferences;
  refresh token in an httpOnly cookie jar; no secrets in source (all via `--dart-define`).

### Native project setup (run once)
```bash
cd apps/mobile
flutter create . --org com.cwayacademy --platforms=android,ios
flutter pub get
dart run build_runner build --delete-conflicting-outputs
```
Then apply:
- **Android** (`android/app/build.gradle`): `minSdkVersion 23` (biometrics/secure storage).
  `AndroidManifest.xml` already gets `INTERNET`; `file_picker`/`share_plus` add their own.
- **iOS** (`ios/Runner/Info.plist`): usage strings —
  `NSFaceIDUsageDescription`, `NSPhotoLibraryUsageDescription` (avatar/file pick),
  `NSCameraUsageDescription` (optional). Set deployment target ≥ 12.0.
- **App icons / splash**: add `flutter_launcher_icons` + `flutter_native_splash`
  configs (forest/gold brand) — art not bundled here.

### Push notifications (additive — not yet wired)
In-app real-time already works via **SSE** (Module 10). True background push needs:
1. `firebase_messaging` + `google-services.json` / `GoogleService-Info.plist`.
2. An **additive** backend endpoint to register device tokens (e.g.
   `POST /student/devices { token, platform }`) and a send step in the notification
   create path (mirrors the SSE approach).
3. A client `PushService` requesting permission, registering the token on login,
   and routing taps through GoRouter (deep links).
Documented rather than stubbed to avoid dead code.

### Accessibility checklist (verify on device)
- Semantics labels present on icon-only/tappable widgets (buttons, avatar, cards,
  progress) — added throughout; audit with the Accessibility Scanner / VoiceOver.
- Dynamic Type: text scaling clamped to 1.0–1.4 in `app.dart` (layouts stay intact).
- Touch targets ≥ 48dp (`AppSizes.minTouchTarget`); primary buttons 52dp.
- Reduced motion: shimmer honors `MediaQuery.disableAnimations`.
- Contrast: verify gold-on-forest and muted text meet WCAG AA on device.

### Release checklist
- [ ] `flutter analyze` clean (strict lints in `analysis_options.yaml`).
- [ ] `flutter test` (add widget/golden tests for critical flows).
- [ ] Localization reviewed by native speakers (Indic UI strings are AI-drafted).
- [ ] `flutter build appbundle --dart-define=FLAVOR=prod` / `flutter build ipa ...`.
- [ ] Signing configured (`android/key.properties`, iOS provisioning) — git-ignored.
- [ ] Crash reporter + analytics keys injected via `--dart-define`.
- [ ] SSE endpoint reachable through nginx in prod (`X-Accel-Buffering: no` respected).

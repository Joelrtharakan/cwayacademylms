import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

export default getRequestConfig(async ({requestLocale}) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: {
      ...((await import(`../../messages/${locale}/common.json`)).default),
      landing: (await import(`../../messages/${locale}/landing.json`)).default,
      auth: (await import(`../../messages/${locale}/auth.json`)).default,
      public: (await import(`../../messages/${locale}/public.json`)).default,
      admin: (await import(`../../messages/${locale}/admin.json`)).default,
      instructor: (await import(`../../messages/${locale}/instructor.json`)).default,
      student: (await import(`../../messages/${locale}/student.json`)).default
    }
  };
});

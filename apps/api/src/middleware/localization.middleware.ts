import { Request, Response, NextFunction } from 'express';
import { deepResolveTranslations, DEFAULT_LOCALE } from '../utils/localization';

export const localizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Extract language from header, query param, or default
  let locale = req.headers['x-language'] as string;
  
  if (!locale) {
    locale = req.query.lang as string;
  }
  
  if (!locale) {
    locale = DEFAULT_LOCALE;
  }
  
  // Attach it to request object for any manual usage in controllers
  (req as any).locale = locale;

  // Intercept res.json to automatically resolve translations
  const originalJson = res.json;
  
  res.json = function (body) {
    if (body) {
      // Deeply resolve any JSON fields in the response payload
      body = deepResolveTranslations(body, locale);
    }
    // Call the original res.json
    return originalJson.call(this, body);
  };

  next();
};

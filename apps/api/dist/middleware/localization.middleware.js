"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.localizationMiddleware = void 0;
const localization_1 = require("../utils/localization");
const localizationMiddleware = (req, res, next) => {
    // Extract language from header, query param, or default
    let locale = req.headers['x-language'];
    if (!locale) {
        locale = req.query.lang;
    }
    if (!locale) {
        locale = localization_1.DEFAULT_LOCALE;
    }
    // Attach it to request object for any manual usage in controllers
    req.locale = locale;
    // Intercept res.json to automatically resolve translations
    const originalJson = res.json;
    res.json = function (body) {
        if (body) {
            // Deeply resolve any JSON fields in the response payload
            body = (0, localization_1.deepResolveTranslations)(body, locale);
        }
        // Call the original res.json
        return originalJson.call(this, body);
    };
    next();
};
exports.localizationMiddleware = localizationMiddleware;

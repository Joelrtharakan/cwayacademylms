"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransString = void 0;
const getTransString = (val, lang = 'en') => {
    if (!val)
        return '';
    if (typeof val === 'string')
        return val;
    if (typeof val === 'object') {
        if (val[lang])
            return String(val[lang]);
        if (val['en'])
            return String(val['en']);
        const keys = Object.keys(val);
        if (keys.length > 0)
            return String(val[keys[0]]);
    }
    return String(val);
};
exports.getTransString = getTransString;

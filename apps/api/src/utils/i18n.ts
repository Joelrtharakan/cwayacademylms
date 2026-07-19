export const getTransString = (val: any, lang: string = 'en'): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    if (val[lang]) return String(val[lang]);
    if (val['en']) return String(val['en']);
    const keys = Object.keys(val);
    if (keys.length > 0) return String(val[keys[0]]);
  }
  return String(val);
};

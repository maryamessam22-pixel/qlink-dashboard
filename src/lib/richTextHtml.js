 
export function isEmptyRichTextHtml(html) {
  if (html == null) return true;
  const t = String(html).trim();
  if (!t) return true;
  const textOnly = t.replace(/<[^>]+>/g, '').replace(/\u00a0/g, ' ').trim();
  if (textOnly.length > 0) return false;
  return /^(?:<p[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>\s*)+$/i.test(t);
}

export function normalizeRichTextHtml(html) {
  return isEmptyRichTextHtml(html) ? '' : String(html);
}

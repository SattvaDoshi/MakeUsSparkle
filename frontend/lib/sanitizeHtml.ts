import DOMPurify from 'dompurify';

/**
 * Cleans admin-authored HTML (product descriptions, policies) before it is injected into the page.
 * Runs in the browser only; on the server it returns '' so unsafe markup is never rendered unsanitised.
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined' || !html) return '';
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style', 'form', 'input', 'button', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['style', 'srcdoc'],
  });
}


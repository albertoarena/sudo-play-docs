/*
  Loads Google Analytics, and only after an explicit accept. Ported from
  laravel-truss-docs, whose header explains the choice.

  This is stricter than the usual Consent Mode setup. That loads gtag.js at
  once with consent denied, which sets no cookie but still sends a request
  with the visitor's IP to Google before anyone agreed to anything. Here
  nothing Google related enters the page until the visitor accepts. Two
  things follow, both on purpose:
    - `analytics_storage` is simply granted: a visitor who has not accepted
      never reaches this code, so there is no denied case to express
    - there is no `wait_for_update`, which holds an already loaded tag while
      a choice is pending. Nothing is loaded here to hold
*/

export const GA_SCRIPT_ORIGIN = 'https://www.googletagmanager.com';

// The ID from the environment, or '' to switch analytics off. Anything that
// is not a GA4 ID throws, so a typo fails the build instead of shipping.
export function measurementId(raw: string | undefined): string {
  const id = (raw ?? '').trim();
  if (id !== '' && !/^G-[A-Z0-9]+$/.test(id)) {
    throw new Error(`"${id}" is not a GA4 measurement ID`);
  }
  return id;
}

export function gtagUrl(id: string): string {
  return `${GA_SCRIPT_ORIGIN}/gtag/js?id=${encodeURIComponent(id)}`;
}

// Consent Mode v2 signals. Advertising stays denied for ever: the site has
// none and should never acquire any.
export function consentSignals() {
  return {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  };
}

type Gtag = { dataLayer?: IArguments[] };

// Appends and starts gtag. A second call does nothing, so a stored accept
// and a click cannot load the script or count the page view twice.
export function loadAnalytics({ id, doc = document, win = window }: { id: string; doc?: Document; win?: Window }): void {
  if (!id) return;
  if (doc.querySelector(`script[src^="${GA_SCRIPT_ORIGIN}"]`)) return;

  const target = win as Window & Gtag;
  target.dataLayer = target.dataLayer || [];
  // gtag reads `arguments`, not an array, so this cannot be an arrow function.
  const gtag = function (..._args: unknown[]) {
    target.dataLayer!.push(arguments);
  };

  // Consent first, so the signals apply before config sends the first hit.
  gtag('consent', 'default', consentSignals());
  gtag('js', new Date());
  gtag('config', id);

  const script = doc.createElement('script');
  script.async = true;
  script.src = gtagUrl(id);
  doc.head.appendChild(script);
}

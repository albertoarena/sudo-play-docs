import { measurementId } from '../scripts/analytics';

// The GA4 measurement ID, read from PUBLIC_GA_MEASUREMENT_ID at build time.
// It is the switch for the whole feature: unset means no banner, no footer
// control and no script, so no visitor is asked to agree to a tag that is
// not there.
//
// The ID is public, not a secret: it is in the page source of every site that
// uses it. It comes from the environment so that local builds and previews
// never send hits to the real property.
export const gaMeasurementId = measurementId(import.meta.env.PUBLIC_GA_MEASUREMENT_ID);

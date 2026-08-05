// Stores ?ref=<value> from the URL so it can be attached to an enrollment
// submitted later in the session. Renders nothing; runs on first load and on
// every SPA route change (same pattern as ScrollToTop).
//
// Only the "ref" param is read - no UTM, fbclid, gclid or document.referrer.

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { captureRefFromSearch } from '@/lib/refSource';

export function RefSourceCapture() {
  const { search } = useLocation();

  useEffect(() => {
    captureRefFromSearch(search);
  }, [search]);

  return null;
}

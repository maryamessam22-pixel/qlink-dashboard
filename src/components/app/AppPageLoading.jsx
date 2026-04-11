import React from 'react';
import { Loader2 } from 'lucide-react';
export default function AppPageLoading({ message = 'Loading...' }) {
  return (
    <div className="app-page-loading" role="status" aria-live="polite" aria-busy="true">
      <Loader2 className="app-page-loading-icon" size={44} strokeWidth={2.25} aria-hidden />
      <p className="app-page-loading-text">{message}</p>
    </div>
  );
}

import React from 'react';
import { FileDown, FileUp } from 'lucide-react';
import { saveFormDraft, loadFormDraft } from '../../lib/formDraft';

/**
 * Local browser backup only — does not replace Save Changes (Supabase).
 */
const FormDraftToolbar = ({ storageKey, capture, apply, disabled = false, className = '' }) => {
  const handleSaveDraft = () => {
    try {
      const data = capture();
      if (!saveFormDraft(storageKey, data)) {
        window.alert('Could not save draft (storage full or blocked).');
        return;
      }
      window.alert('Draft saved in this browser. Use Save Changes to publish to the database.');
    } catch (e) {
      console.error(e);
      window.alert('Could not save draft.');
    }
  };

  const handleRestoreDraft = () => {
    const data = loadFormDraft(storageKey);
    if (data == null) {
      window.alert('No draft found for this page.');
      return;
    }
    if (
      !window.confirm(
        'Replace the current form with your saved draft? This does not undo database data until you save again.'
      )
    ) {
      return;
    }
    try {
      apply(data);
      window.alert('Draft restored.');
    } catch (e) {
      console.error(e);
      window.alert('Could not apply draft.');
    }
  };

  return (
    <div className={className} style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
      <button
        type="button"
        className="btn-secondary"
        disabled={disabled}
        onClick={handleSaveDraft}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
      >
        <FileDown size={16} aria-hidden />
        Save draft
      </button>
      <button
        type="button"
        className="btn-secondary"
        disabled={disabled}
        onClick={handleRestoreDraft}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
      >
        <FileUp size={16} aria-hidden />
        Restore draft
      </button>
    </div>
  );
};

export default FormDraftToolbar;

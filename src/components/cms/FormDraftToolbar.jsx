import React from 'react';
import { FileDown, FileUp } from 'lucide-react';
import { saveFormDraft, loadFormDraft } from '../../lib/formDraft';
import './FormDraftToolbar.css';

/**
 * Local browser backup only — does not replace Save Changes (Supabase).
 */
const FormDraftToolbar = ({
  storageKey,
  capture,
  apply,
  disabled = false,
  className = '',
  compact = false,
}) => {
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
      window.alert(
        'Draft restored into the form. Review the fields, then use Save Changes on this page to publish to the database.'
      );
    } catch (e) {
      console.error(e);
      window.alert('Could not apply draft.');
    }
  };

  const rootClass = [
    'form-draft-toolbar',
    compact ? 'form-draft-toolbar--compact' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      <div className="form-draft-toolbar__actions">
        <button
          type="button"
          className="form-draft-toolbar__btn form-draft-toolbar__btn--save"
          disabled={disabled}
          onClick={handleSaveDraft}
          title="Save a backup of this form in your browser only"
        >
          <FileDown size={compact ? 15 : 16} aria-hidden />
          Save draft
        </button>
        <span className="form-draft-toolbar__divider" aria-hidden />
        <button
          type="button"
          className="form-draft-toolbar__btn form-draft-toolbar__btn--restore"
          disabled={disabled}
          onClick={handleRestoreDraft}
          title="Load your saved browser backup into the form"
        >
          <FileUp size={compact ? 15 : 16} aria-hidden />
          Restore draft
        </button>
      </div>
      {!compact ? (
        <p className="form-draft-toolbar__hint">
          Drafts stay in this browser only. Open this same screen anytime and use{' '}
          <strong>Restore draft</strong>, then <strong>Save Changes</strong> to publish live to the site.
        </p>
      ) : null}
    </div>
  );
};

export default FormDraftToolbar;

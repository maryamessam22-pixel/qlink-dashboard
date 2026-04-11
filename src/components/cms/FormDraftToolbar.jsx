import React from 'react';
import { FileDown, FileUp } from 'lucide-react';
import { saveFormDraft, loadFormDraft } from '../../lib/formDraft';
import './FormDraftToolbar.css';

/**
 * Local browser backup only — does not replace Save / Publish (Supabase).
 * @param {'default' | 'compact'} variant — compact groups actions for footers (e.g. product editor).
 */
const FormDraftToolbar = ({
  storageKey,
  capture,
  apply,
  disabled = false,
  className = '',
  variant = 'default',
}) => {
  const handleSaveDraft = () => {
    try {
      const data = capture();
      if (!saveFormDraft(storageKey, data)) {
        window.alert('Could not save draft (storage full or blocked).');
        return;
      }
      window.dispatchEvent(
        new CustomEvent('qlink-draft-saved', { detail: { key: storageKey } })
      );
      window.alert(
        'Draft saved in this browser. On the product catalog it appears in the Draft column until you publish.'
      );
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
        'Replace the current form with your saved draft? This does not change the live website until you publish.'
      )
    ) {
      return;
    }
    try {
      apply(data);
      window.alert(
        'Draft restored. Use Publish / Save Changes on this page to push it to the database and the storefront.'
      );
    } catch (e) {
      console.error(e);
      window.alert('Could not apply draft.');
    }
  };

  const rootClass =
    `form-draft-toolbar form-draft-toolbar--${variant}${className ? ` ${className}` : ''}`.trim();

  const hintDefault =
    'Drafts stay in this browser until you publish. Open this same page, use Restore if needed, then Save / Publish to push live.';

  const hintCompact =
    'Saved only in this browser. Publish sends the product to your database and storefront.';

  return (
    <div className={rootClass}>
      <p className="form-draft-toolbar__hint">
        {variant === 'compact' ? hintCompact : hintDefault}
      </p>
      <div className="form-draft-toolbar__actions" role="group" aria-label="Local draft backup">
        <button
          type="button"
          className="form-draft-toolbar__btn"
          disabled={disabled}
          onClick={handleSaveDraft}
        >
          <FileDown size={16} aria-hidden />
          Save draft
        </button>
        <button
          type="button"
          className="form-draft-toolbar__btn"
          disabled={disabled}
          onClick={handleRestoreDraft}
        >
          <FileUp size={16} aria-hidden />
          Restore draft
        </button>
      </div>
    </div>
  );
};

export default FormDraftToolbar;

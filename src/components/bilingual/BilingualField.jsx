import React from 'react';
import './BilingualField.css';

export const BilingualTextInput = ({
  labelEn,
  labelAr,
  valueEn,
  valueAr,
  onChangeEn,
  onChangeAr,
  type = 'text',
  placeholderEn,
  placeholderAr,
}) => (
  <div className="bilingual-row">
    <div className="bilingual-field">
      <label className="field-label">{labelEn}</label>
      <input
        type={type}
        className="field-input"
        dir="ltr"
        value={valueEn}
        onChange={(e) => onChangeEn(e.target.value)}
        placeholder={placeholderEn}
      />
    </div>
    <div className="bilingual-field">
      <label className="field-label">{labelAr}</label>
      <input
        type={type}
        className="field-input"
        dir="rtl"
        lang="ar"
        value={valueAr}
        onChange={(e) => onChangeAr(e.target.value)}
        placeholder={placeholderAr}
      />
    </div>
  </div>
);

export const BilingualTextarea = ({
  labelEn,
  labelAr,
  valueEn,
  valueAr,
  onChangeEn,
  onChangeAr,
  rows = 4,
  placeholderEn,
  placeholderAr,
}) => (
  <div className="bilingual-row">
    <div className="bilingual-field">
      <label className="field-label">{labelEn}</label>
      <textarea
        className="field-input field-textarea"
        dir="ltr"
        rows={rows}
        value={valueEn}
        onChange={(e) => onChangeEn(e.target.value)}
        placeholder={placeholderEn}
      />
    </div>
    <div className="bilingual-field">
      <label className="field-label">{labelAr}</label>
      <textarea
        className="field-input field-textarea"
        dir="rtl"
        lang="ar"
        rows={rows}
        value={valueAr}
        onChange={(e) => onChangeAr(e.target.value)}
        placeholder={placeholderAr}
      />
    </div>
  </div>
);

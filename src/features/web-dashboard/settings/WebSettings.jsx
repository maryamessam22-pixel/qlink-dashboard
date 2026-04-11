import React, { useEffect, useState } from 'react';
import { Search, Save } from 'lucide-react';
import PageMeta from '../../../components/seo/PageMeta';
import SeoSection from '../../../components/seo/SeoSection';
import RichTextEditor from '../../../components/rich-text/RichTextEditor';
import myPic from '../../../assets/imges/my-pic.png';
import { saveFormDraft, clearFormDraft } from '../../../lib/formDraft';
import FormDraftToolbar from '../../../components/cms/FormDraftToolbar';
import '../../../styles/web-dashboard-pages.css';
import './WebSettings.css';

const PROFILE_KEY = 'qlink_web_settings_profile_v1';

const DEFAULT_PROFILE = {
  name: 'M.Farid',
  title: 'Founder & CEO',
  email: 'admin@qlink.com',
  bioEn: '<p>Profile bio for the storefront team page (EN).</p>',
  bioAr: '<p>نبذة للملف في صفحة الفريق (AR).</p>',
  seo: {
    slug: 'project-slug',
    metaTitle: 'SEO title displayed in Google Search',
    metaDescription: 'Brief summary for search engines…',
    keywords: 'qlink, profile, team',
    featuredImageAlt: 'Describe the image for accessibility and SEO',
  },
};

const WebSettings = () => {
  const [name, setName] = useState(DEFAULT_PROFILE.name);
  const [title, setTitle] = useState(DEFAULT_PROFILE.title);
  const [email, setEmail] = useState(DEFAULT_PROFILE.email);
  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [bioEn, setBioEn] = useState(DEFAULT_PROFILE.bioEn);
  const [bioAr, setBioAr] = useState(DEFAULT_PROFILE.bioAr);
  const [seo, setSeo] = useState(DEFAULT_PROFILE.seo);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const p = parsed?.data != null ? parsed.data : parsed;
      if (p.name != null) setName(p.name);
      if (p.title != null) setTitle(p.title);
      if (p.email != null) setEmail(p.email);
      if (p.bioEn != null) setBioEn(p.bioEn);
      if (p.bioAr != null) setBioAr(p.bioAr);
      if (p.seo && typeof p.seo === 'object') setSeo((s) => ({ ...s, ...p.seo }));
    } catch {
      /* ignore */
    }
  }, []);

  const captureDraft = () => ({ name, title, email, bioEn, bioAr, seo });

  const applyDraft = (d) => {
    if (!d || typeof d !== 'object') return;
    if (d.name !== undefined) setName(d.name);
    if (d.title !== undefined) setTitle(d.title);
    if (d.email !== undefined) setEmail(d.email);
    if (d.bioEn !== undefined) setBioEn(d.bioEn);
    if (d.bioAr !== undefined) setBioAr(d.bioAr);
    if (d.seo && typeof d.seo === 'object') setSeo((s) => ({ ...s, ...d.seo }));
  };

  const saveProfile = () => {
    saveFormDraft(PROFILE_KEY, { name, title, email, bioEn, bioAr, seo });
    alert('Profile saved in this browser (password fields are never stored).');
  };

  const resetProfile = () => {
    if (!window.confirm('Reset profile and SEO to defaults and clear the saved browser draft?')) return;
    clearFormDraft(PROFILE_KEY);
    setName(DEFAULT_PROFILE.name);
    setTitle(DEFAULT_PROFILE.title);
    setEmail(DEFAULT_PROFILE.email);
    setBioEn(DEFAULT_PROFILE.bioEn);
    setBioAr(DEFAULT_PROFILE.bioAr);
    setSeo({ ...DEFAULT_PROFILE.seo });
  };

  return (
    <div className="web-page settings-page">
      <PageMeta title="Settings" description={seo.metaDescription} keywords={seo.keywords} />

      <div className="web-page-header">
        <div>
          <h1 className="web-page-title">Settings</h1>
          <p className="web-page-sub">Manage profile settings.</p>
        </div>
      </div>

      <section className="web-card settings-profile-card">
        <div className="settings-profile-head">
          <div className="settings-profile-who">
            <img src={myPic} alt="" className="settings-avatar" />
            <div>
              <h2 className="settings-inline-name">{name}</h2>
              <p className="settings-inline-role">{title}</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <FormDraftToolbar storageKey={PROFILE_KEY} capture={captureDraft} apply={applyDraft} />
            <button type="button" className="btn-secondary" onClick={resetProfile}>
              Reset / clear draft
            </button>
            <button
              type="button"
              className="btn-publish"
              onClick={saveProfile}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </div>

        <div className="settings-field">
          <label className="field-label">Full name</label>
          <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div className="settings-field">
          <label className="field-label">Job title</label>
          <input className="field-input" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div className="settings-field">
          <label className="field-label">Email address (login)</label>
          <input className="field-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%' }} />
        </div>

        <div style={{ marginTop: 24 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>Public bio (EN)</label>
          <RichTextEditor value={bioEn} onChange={setBioEn} />
        </div>
        <div style={{ marginTop: 16 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>السيرة (AR)</label>
          <RichTextEditor value={bioAr} onChange={setBioAr} rtl />
        </div>
      </section>

      <section className="web-card">
        <h2 className="web-card-title" style={{ marginBottom: 16 }}>Security</h2>
        <div className="settings-field">
          <label className="field-label">Current password</label>
          <input className="field-input" type="password" value={curPass} onChange={(e) => setCurPass(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div className="settings-pass-row">
          <div className="settings-field">
            <label className="field-label">New password</label>
            <input className="field-input" type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} style={{ width: '100%' }} />
          </div>
          <div className="settings-field">
            <label className="field-label">Confirm password</label>
            <input className="field-input" type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} style={{ width: '100%' }} />
          </div>
        </div>
      </section>

      <div className="settings-seo-wrap">
        <div className="settings-seo-head">
          <Search size={18} className="settings-seo-icon" />
          <h2 className="web-card-title" style={{ margin: 0 }}>Profile SEO</h2>
          <span className="seo-badge">Global requirement</span>
        </div>
        <SeoSection
          title=""
          slugPrefix="mariamfarid.com/"
          slugSuffixHint="project-slug"
          value={seo}
          onChange={setSeo}
          showFeaturedAlt
        />
      </div>
    </div>
  );
};

export default WebSettings;

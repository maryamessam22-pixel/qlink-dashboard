import React, { useState } from 'react';
import { Search } from 'lucide-react';
import PageMeta from '../../../components/seo/PageMeta';
import SeoSection from '../../../components/seo/SeoSection';
import RichTextEditor from '../../../components/rich-text/RichTextEditor';
import myPic from '../../../assets/imges/my-pic.png';
import '../../../styles/web-dashboard-pages.css';
import './WebSettings.css';

const WebSettings = () => {
  const [name, setName] = useState('M.Farid');
  const [title, setTitle] = useState('Founder & CEO');
  const [email, setEmail] = useState('admin@qlink.com');
  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [bioEn, setBioEn] = useState('<p>Profile bio for the storefront team page (EN).</p>');
  const [bioAr, setBioAr] = useState('<p>نبذة للملف في صفحة الفريق (AR).</p>');
  const [seo, setSeo] = useState({
    slug: 'project-slug',
    metaTitle: 'SEO title displayed in Google Search',
    metaDescription: 'Brief summary for search engines…',
    keywords: 'qlink, profile, team',
    featuredImageAlt: 'Describe the image for accessibility and SEO',
  });

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
          <button type="button" className="btn-primary">Save changes</button>
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

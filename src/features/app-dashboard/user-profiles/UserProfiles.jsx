import React, { useState } from 'react';
import PageMeta from '../../../components/seo/PageMeta';
import SeoSection from '../../../components/seo/SeoSection';
import '../../../styles/web-dashboard-pages.css';

const UserProfiles = () => {
  const [seo, setSeo] = useState({
    slug: 'user-profiles',
    metaTitle: 'User profiles',
    metaDescription: 'App user profiles.',
    keywords: 'profiles, app, qlink',
    featuredImageAlt: 'Profiles',
  });

  return (
    <div className="web-page">
      <PageMeta title="App · User profiles" description={seo.metaDescription} keywords={seo.keywords} />
      <h1 className="web-page-title">User profiles</h1>
      <p className="web-page-sub">Placeholder — ready for profile management UI.</p>
      <SeoSection title="Profiles SEO" slugPrefix="admin.qlink.com/app/user-profiles/" value={seo} onChange={setSeo} badge="Internal" />
    </div>
  );
};

export default UserProfiles;

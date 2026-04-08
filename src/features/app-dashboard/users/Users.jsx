import React, { useState } from 'react';
import PageMeta from '../../../components/seo/PageMeta';
import SeoSection from '../../../components/seo/SeoSection';
import '../../../styles/web-dashboard-pages.css';

const Users = () => {
  const [seo, setSeo] = useState({
    slug: 'users',
    metaTitle: 'App users',
    metaDescription: 'Manage app users.',
    keywords: 'users, app, qlink',
    featuredImageAlt: 'Users',
  });

  return (
    <div className="web-page">
      <PageMeta title="App · Users" description={seo.metaDescription} keywords={seo.keywords} />
      <h1 className="web-page-title">Users</h1>
      <p className="web-page-sub">Placeholder — ready for your app user table.</p>
      <SeoSection title="Users SEO" slugPrefix="admin.qlink.com/app/users/" value={seo} onChange={setSeo} badge="Internal" />
    </div>
  );
};

export default Users;

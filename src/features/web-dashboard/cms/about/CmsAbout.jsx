import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import PageMeta from '../../../../components/seo/PageMeta';
import RichTextEditor from '../../../../components/rich-text/RichTextEditor';
import { BilingualTextInput } from '../../../../components/bilingual/BilingualField';
import SeoSection from '../../../../components/seo/SeoSection';
import '../../../../styles/web-dashboard-pages.css';

const CmsAbout = () => {
  const [missionRteEn, setMissionRteEn] = useState('<p>Our mission is to make emergency medical data accessible in seconds.</p>');
  const [missionRteAr, setMissionRteAr] = useState('<p>مهمتنا جعل البيانات الطبية الطارئة متاحة في ثوانٍ.</p>');
  const [founderNameEn, setFounderNameEn] = useState('M. Farid');
  const [founderNameAr, setFounderNameAr] = useState('م. فريد');
  const [founderTitleEn, setFounderTitleEn] = useState('Founder & CEO');
  const [founderTitleAr, setFounderTitleAr] = useState('المؤسس والرئيس التنفيذي');
  const [visionHeadEn, setVisionHeadEn] = useState('Our Vision');
  const [visionHeadAr, setVisionHeadAr] = useState('رؤيتنا');
  const [visionRteEn, setVisionRteEn] = useState('<p>A world where every scan saves time and lives.</p>');
  const [visionRteAr, setVisionRteAr] = useState('<p>عالم حيث كل مسح يوفر الوقت والأرواح.</p>');
  const [teamHeadEn, setTeamHeadEn] = useState('Our Team');
  const [teamHeadAr, setTeamHeadAr] = useState('فريقنا');
  const [teamSubEn, setTeamSubEn] = useState('The people building Qlink.');
  const [teamSubAr, setTeamSubAr] = useState('الفريق الذي يبني كيو لينك.');
  const [members, setMembers] = useState([
    { nameEn: 'Malak Y.', nameAr: 'ملك ي.', roleEn: 'Product', roleAr: 'المنتج', imageUrl: 'https://placehold.co/96x96/png' },
  ]);
  const [seo, setSeo] = useState({
    slug: 'about',
    metaTitle: 'About Qlink',
    metaDescription: 'Meet the team behind Qlink medical safety wearables.',
    keywords: 'about, qlink, team',
    featuredImageAlt: 'Qlink team',
  });

  useEffect(() => {
    const onAdd = () => {
      setMembers((m) => [...m, { nameEn: '', nameAr: '', roleEn: '', roleAr: '', imageUrl: '' }]);
    };
    window.addEventListener('cms:add-section', onAdd);
    return () => window.removeEventListener('cms:add-section', onAdd);
  }, []);

  const updateMember = (i, key, val) => {
    setMembers((prev) => {
      const n = [...prev];
      n[i] = { ...n[i], [key]: val };
      return n;
    });
  };

  return (
    <div>
      <PageMeta title="CMS · About" description={seo.metaDescription} keywords={seo.keywords} />

      <section className="web-card">
        <h2 className="web-card-title" style={{ marginBottom: 16 }}>Founder mission</h2>
        <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>Sub-headline description (EN)</label>
        <RichTextEditor value={missionRteEn} onChange={setMissionRteEn} />
        <div style={{ marginTop: 16 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>الوصف (AR)</label>
          <RichTextEditor value={missionRteAr} onChange={setMissionRteAr} rtl />
        </div>
        <div style={{ marginTop: 16 }}>
          <BilingualTextInput
            labelEn="Founder name (EN)"
            labelAr="اسم المؤسس (AR)"
            valueEn={founderNameEn}
            valueAr={founderNameAr}
            onChangeEn={setFounderNameEn}
            onChangeAr={setFounderNameAr}
          />
        </div>
        <div style={{ marginTop: 16 }}>
          <BilingualTextInput
            labelEn="Founder title (EN)"
            labelAr="منصب المؤسس (AR)"
            valueEn={founderTitleEn}
            valueAr={founderTitleAr}
            onChangeEn={setFounderTitleEn}
            onChangeAr={setFounderTitleAr}
          />
        </div>
      </section>

      <section className="web-card">
        <h2 className="web-card-title" style={{ marginBottom: 16 }}>Our vision</h2>
        <BilingualTextInput
          labelEn="Vision headline (EN)"
          labelAr="عنوان الرؤية (AR)"
          valueEn={visionHeadEn}
          valueAr={visionHeadAr}
          onChangeEn={setVisionHeadEn}
          onChangeAr={setVisionHeadAr}
        />
        <div style={{ marginTop: 16 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>Vision text (EN)</label>
          <RichTextEditor value={visionRteEn} onChange={setVisionRteEn} />
        </div>
        <div style={{ marginTop: 16 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>نص الرؤية (AR)</label>
          <RichTextEditor value={visionRteAr} onChange={setVisionRteAr} rtl />
        </div>
      </section>

      <section className="web-card">
        <div className="web-card-head">
          <h2 className="web-card-title">Our team</h2>
          <button type="button" className="btn-primary" onClick={() => setMembers((m) => [...m, { nameEn: '', nameAr: '', roleEn: '', roleAr: '', imageUrl: '' }])}>
            <Plus size={18} />
            Add member
          </button>
        </div>
        <BilingualTextInput
          labelEn="Section headline (EN)"
          labelAr="عنوان القسم (AR)"
          valueEn={teamHeadEn}
          valueAr={teamHeadAr}
          onChangeEn={setTeamHeadEn}
          onChangeAr={setTeamHeadAr}
        />
        <div style={{ marginTop: 16 }}>
          <BilingualTextInput
            labelEn="Section sub-headline (EN)"
            labelAr="العنوان الفرعي (AR)"
            valueEn={teamSubEn}
            valueAr={teamSubAr}
            onChangeEn={setTeamSubEn}
            onChangeAr={setTeamSubAr}
          />
        </div>
        <div className="about-team-grid">
          {members.map((mem, i) => (
            <div key={i} className="about-team-card">
              <button type="button" className="about-team-remove" aria-label="Remove member" onClick={() => setMembers((prev) => prev.filter((_, j) => j !== i))}>
                <Trash2 size={16} />
              </button>
              <div className="about-team-avatar-wrap">
                <img src={mem.imageUrl || 'https://placehold.co/96x96/png'} alt="" className="about-team-avatar" />
              </div>
              <BilingualTextInput
                labelEn="Name (EN)"
                labelAr="الاسم (AR)"
                valueEn={mem.nameEn}
                valueAr={mem.nameAr}
                onChangeEn={(v) => updateMember(i, 'nameEn', v)}
                onChangeAr={(v) => updateMember(i, 'nameAr', v)}
              />
              <div style={{ marginTop: 12 }}>
                <BilingualTextInput
                  labelEn="Role (EN)"
                  labelAr="الدور (AR)"
                  valueEn={mem.roleEn}
                  valueAr={mem.roleAr}
                  onChangeEn={(v) => updateMember(i, 'roleEn', v)}
                  onChangeAr={(v) => updateMember(i, 'roleAr', v)}
                />
              </div>
              <div style={{ marginTop: 12 }}>
                <label className="field-label">Image URL</label>
                <input className="field-input" type="url" value={mem.imageUrl} onChange={(e) => updateMember(i, 'imageUrl', e.target.value)} style={{ width: '100%', marginTop: 8 }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <SeoSection title="About page SEO" slugPrefix="qlink.com/about/" value={seo} onChange={setSeo} />
    </div>
  );
};

export default CmsAbout;

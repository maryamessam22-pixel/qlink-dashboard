import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Loader2, Save } from 'lucide-react';
import PageMeta from '../../../../components/seo/PageMeta';
import RichTextEditor from '../../../../components/rich-text/RichTextEditor';
import { BilingualTextInput } from '../../../../components/bilingual/BilingualField';
import SeoSection from '../../../../components/seo/SeoSection';
import { supabase } from '../../../../lib/supabase';
import '../../../../styles/web-dashboard-pages.css';

const CmsAbout = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [founderNameEn, setFounderNameEn] = useState('');
  const [founderNameAr, setFounderNameAr] = useState('');
  const [founderTitleEn, setFounderTitleEn] = useState('');
  const [founderTitleAr, setFounderTitleAr] = useState('');
  const [missionRteEn, setMissionRteEn] = useState('');
  const [missionRteAr, setMissionRteAr] = useState('');

  const [visionHeadEn, setVisionHeadEn] = useState('');
  const [visionHeadAr, setVisionHeadAr] = useState('');
  const [visionRteEn, setVisionRteEn] = useState('');
  const [visionRteAr, setVisionRteAr] = useState('');

  const [teamHeadEn, setTeamHeadEn] = useState('Our Team');
  const [teamHeadAr, setTeamHeadAr] = useState('فريقنا');
  const [teamSubEn, setTeamSubEn] = useState('The people building Qlink.');
  const [teamSubAr, setTeamSubAr] = useState('الفريق الذي يبني كيو لينك.');
  const [members, setMembers] = useState([]);

  const [seo, setSeo] = useState({
    slug: 'about/our-story',
    metaTitle: 'About Qlink',
    metaDescription: 'Meet the team behind Qlink medical safety wearables.',
    keywords: 'about, qlink, team',
    featuredImageAlt: 'Qlink team',
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        const { data: cmsData } = await supabase
          .from('cms_content')
          .select('*')
          .in('section_key', ['about_founder', 'about_vision']);

        if (cmsData) {
          cmsData.forEach(row => {
            if (row.section_key === 'about_founder') {
              setFounderNameEn(row.title_en || '');
              setFounderNameAr(row.title_ar || '');
              setFounderTitleEn(row.subtitle_en || '');
              setFounderTitleAr(row.subtitle_ar || '');
              setMissionRteEn(row.content_en || '');
              setMissionRteAr(row.content_ar || '');
            } else if (row.section_key === 'about_vision') {
              setVisionHeadEn(row.title_en || '');
              setVisionHeadAr(row.title_ar || '');
              setVisionRteEn(row.content_en || '');
              setVisionRteAr(row.content_ar || '');
            }
          });
        }

        const { data: teamData } = await supabase
          .from('team_members')
          .select('*')
          .order('display_order', { ascending: true });

        if (teamData) {
          setMembers(teamData);
        }

        const { data: seoData } = await supabase
          .from('seo')
          .select('*')
          .eq('slug', 'about/our-story')
          .single();

        if (seoData) {
          setSeo({
            slug: seoData.slug,
            metaTitle: seoData.title_en || '',
            metaDescription: seoData.description_en || '',
            keywords: seoData.keywords || 'about, qlink, team',
            featuredImageAlt: seoData.featured_image_alt || 'Qlink team',
          });
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const updateMember = (i, key, val) => {
    setMembers((prev) => {
      const n = [...prev];
      n[i] = { ...n[i], [key]: val };
      return n;
    });
  };

  const addMember = () => {
    setMembers((m) => [...m, { 
      name: '', role_en: '', role_ar: '', image_url: '', display_order: m.length + 1 
    }]);
  };

  const removeMember = async (index, id) => {
    if (id) {
       await supabase.from('team_members').delete().eq('id', id);
    }
    setMembers((prev) => prev.filter((_, j) => j !== index));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const now = new Date().toISOString();

      await supabase.from('cms_content').update({
        title_en: founderNameEn,
        title_ar: founderNameAr,
        subtitle_en: founderTitleEn,
        subtitle_ar: founderTitleAr,
        content_en: missionRteEn,
        content_ar: missionRteAr,
        updated_at: now
      }).eq('section_key', 'about_founder');

      await supabase.from('cms_content').update({
        title_en: visionHeadEn,
        title_ar: visionHeadAr,
        content_en: visionRteEn,
        content_ar: visionRteAr,
        updated_at: now
      }).eq('section_key', 'about_vision');

      await supabase.from('seo').update({
        title_en: seo.metaTitle,
        description_en: seo.metaDescription,
      }).eq('slug', 'about/our-story');

      if (members.length > 0) {
        const teamPayload = members.map((m, i) => ({
          ...(m.id ? { id: m.id } : {}), 
          name: m.name || '',
          role_en: m.role_en || '',
          role_ar: m.role_ar || '',
          image_url: m.image_url || '',
          display_order: i + 1
        }));
        await supabase.from('team_members').upsert(teamPayload);
      }

      alert('About page content saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#8b949e' }}>Loading CMS data...</div>;
  }

  return (
    <div>
      <PageMeta title="CMS · About" description={seo.metaDescription} keywords={seo.keywords} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="web-page-title" style={{ margin: 0 }}>About CMS</h1>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="btn-publish" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

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
          <button type="button" className="btn-primary" onClick={addMember}>
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
        <div className="about-team-grid" style={{ marginTop: '24px'}}>
          {members.map((mem, i) => (
            <div key={i} className="about-team-card">
              <button type="button" className="about-team-remove" aria-label="Remove member" onClick={() => removeMember(i, mem.id)}>
                <Trash2 size={16} />
              </button>
              <div className="about-team-avatar-wrap">
                <img src={mem.image_url || 'https://placehold.co/96x96/png'} alt="" className="about-team-avatar" />
              </div>
              <div style={{ marginTop: 12 }}>
                <label className="field-label">Name (EN & AR)</label>
                <input className="field-input" type="text" value={mem.name} onChange={(e) => updateMember(i, 'name', e.target.value)} style={{ width: '100%', marginTop: 8 }} />
              </div>
              <div style={{ marginTop: 12 }}>
                <BilingualTextInput
                  labelEn="Role (EN)"
                  labelAr="الدور (AR)"
                  valueEn={mem.role_en}
                  valueAr={mem.role_ar}
                  onChangeEn={(v) => updateMember(i, 'role_en', v)}
                  onChangeAr={(v) => updateMember(i, 'role_ar', v)}
                />
              </div>
              <div style={{ marginTop: 12 }}>
                <label className="field-label">Image URL</label>
                <input className="field-input" type="url" value={mem.image_url} onChange={(e) => updateMember(i, 'image_url', e.target.value)} style={{ width: '100%', marginTop: 8 }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <SeoSection title="About page SEO" slugPrefix="qlink.com/about/our-story" value={seo} onChange={setSeo} badge="Global" />
    </div>
  );
};

export default CmsAbout;
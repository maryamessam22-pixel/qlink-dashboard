import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Loader2, Save } from 'lucide-react';
import PageMeta from '../../../../components/seo/PageMeta';
import RichTextEditor from '../../../../components/rich-text/RichTextEditor';
import { BilingualTextInput } from '../../../../components/bilingual/BilingualField';
import SeoSection from '../../../../components/seo/SeoSection';
import { supabase } from '../../../../lib/supabase';
import { upsertSeoBySlug } from '../../../../lib/seoUpsert';
import { normalizeRichTextHtml } from '../../../../lib/richTextHtml';
import FormDraftToolbar from '../../../../components/cms/FormDraftToolbar';
import '../../../../styles/web-dashboard-pages.css';

const SECTION_FOUNDER = 'about_founder';
const DRAFT_KEY = 'qlink_draft_cms_about_v1';
const SECTION_VISION = 'about_vision';
const SEO_SLUG = 'about/our-story';

const CmsAbout = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState('');

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
    slug: SEO_SLUG,
    metaTitle: 'Our Story',
    metaTitleAr: 'قصتنا',
    metaDescription: 'Discover the story behind Qlink.',
    metaDescriptionAr: 'تعرف على قصة كيو لينك.',
    keywords: 'about, qlink, our story, team',
    featuredImageAlt: 'Qlink team',
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setFetchError('');

        const { data: cmsData, error: cmsError } = await supabase
          .from('cms_content')
          .select('*')
          .in('section_key', [SECTION_FOUNDER, SECTION_VISION]);

        if (cmsError) {
          console.error('cms_content fetch:', cmsError);
          setFetchError(cmsError.message || 'Failed to load About content from cms_content.');
        } else if (cmsData?.length) {
          cmsData.forEach((row) => {
            if (row.section_key === SECTION_FOUNDER) {
              setFounderNameEn(row.title_en || '');
              setFounderNameAr(row.title_ar || '');
              setFounderTitleEn(row.subtitle_en || '');
              setFounderTitleAr(row.subtitle_ar || '');
              setMissionRteEn(row.content_en || '');
              setMissionRteAr(row.content_ar || '');
            } else if (row.section_key === SECTION_VISION) {
              setVisionHeadEn(row.title_en || '');
              setVisionHeadAr(row.title_ar || '');
              setVisionRteEn(row.content_en || '');
              setVisionRteAr(row.content_ar || '');
            }
          });
        }

        const { data: teamData, error: teamError } = await supabase
          .from('team_members')
          .select('*')
          .order('display_order', { ascending: true });

        if (teamError) {
          console.error('team_members fetch:', teamError);
          setFetchError((prev) => prev || teamError.message || 'Failed to load team.');
        } else if (teamData) {
          setMembers(teamData);
        }

        const { data: seoData, error: seoError } = await supabase
          .from('seo')
          .select('*')
          .eq('slug', SEO_SLUG)
          .maybeSingle();

        if (seoError) {
          console.error('seo fetch:', seoError);
          setFetchError((prev) => prev || seoError.message || 'Failed to load SEO.');
        }
        if (seoData) {
          setSeo({
            slug: seoData.slug || SEO_SLUG,
            metaTitle: seoData.title_en || '',
            metaTitleAr: seoData.title_ar || '',
            metaDescription: seoData.description_en || '',
            metaDescriptionAr: seoData.description_ar || '',
            keywords: seoData.keywords || 'about, qlink, team',
            featuredImageAlt: seoData.featured_image_alt || 'Qlink team',
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setFetchError(error?.message || 'Failed to load About page data.');
      } finally {
        setLoading(false);
      }
    };

    const onAdd = () => {
      setMembers((m) => [...m, { 
        name: 'New Member', role_en: '', role_ar: '', image_url: '', display_order: m.length + 1 
      }]);
    };
    window.addEventListener('cms:add-section', onAdd);

    fetchAllData();

    return () => window.removeEventListener('cms:add-section', onAdd);
  }, []);

  const captureDraft = () => ({
    founderNameEn,
    founderNameAr,
    founderTitleEn,
    founderTitleAr,
    missionRteEn,
    missionRteAr,
    visionHeadEn,
    visionHeadAr,
    visionRteEn,
    visionRteAr,
    teamHeadEn,
    teamHeadAr,
    teamSubEn,
    teamSubAr,
    members,
    seo,
  });

  const applyDraft = (d) => {
    if (!d || typeof d !== 'object') return;
    if (d.founderNameEn !== undefined) setFounderNameEn(d.founderNameEn);
    if (d.founderNameAr !== undefined) setFounderNameAr(d.founderNameAr);
    if (d.founderTitleEn !== undefined) setFounderTitleEn(d.founderTitleEn);
    if (d.founderTitleAr !== undefined) setFounderTitleAr(d.founderTitleAr);
    if (d.missionRteEn !== undefined) setMissionRteEn(d.missionRteEn);
    if (d.missionRteAr !== undefined) setMissionRteAr(d.missionRteAr);
    if (d.visionHeadEn !== undefined) setVisionHeadEn(d.visionHeadEn);
    if (d.visionHeadAr !== undefined) setVisionHeadAr(d.visionHeadAr);
    if (d.visionRteEn !== undefined) setVisionRteEn(d.visionRteEn);
    if (d.visionRteAr !== undefined) setVisionRteAr(d.visionRteAr);
    if (d.teamHeadEn !== undefined) setTeamHeadEn(d.teamHeadEn);
    if (d.teamHeadAr !== undefined) setTeamHeadAr(d.teamHeadAr);
    if (d.teamSubEn !== undefined) setTeamSubEn(d.teamSubEn);
    if (d.teamSubAr !== undefined) setTeamSubAr(d.teamSubAr);
    if (Array.isArray(d.members)) setMembers(d.members);
    if (d.seo && typeof d.seo === 'object') setSeo((s) => ({ ...s, ...d.seo }));
  };

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

      const { error: errFounder } = await supabase
        .from('cms_content')
        .update({
          title_en: founderNameEn,
          title_ar: founderNameAr,
          subtitle_en: founderTitleEn,
          subtitle_ar: founderTitleAr,
          content_en: normalizeRichTextHtml(missionRteEn),
          content_ar: normalizeRichTextHtml(missionRteAr),
          updated_at: now,
        })
        .eq('section_key', SECTION_FOUNDER);
      if (errFounder) throw errFounder;

      const { error: errVision } = await supabase
        .from('cms_content')
        .update({
          title_en: visionHeadEn,
          title_ar: visionHeadAr,
          content_en: normalizeRichTextHtml(visionRteEn),
          content_ar: normalizeRichTextHtml(visionRteAr),
          updated_at: now,
        })
        .eq('section_key', SECTION_VISION);
      if (errVision) throw errVision;

      const seoSlug = (seo.slug || SEO_SLUG).trim() || SEO_SLUG;
      await upsertSeoBySlug(supabase, seoSlug, {
        title_en: seo.metaTitle,
        title_ar: seo.metaTitleAr,
        description_en: seo.metaDescription,
        description_ar: seo.metaDescriptionAr,
      });

      // التعديل السحري هنا:
      if (members.length > 0) {
        for (let i = 0; i < members.length; i++) {
          const m = members[i];
          const payload = {
            name: m.name || '',
            role_en: m.role_en || '',
            role_ar: m.role_ar || '',
            image_url: m.image_url || '',
            display_order: i + 1
          };

          if (m.id) {
            await supabase.from('team_members').update(payload).eq('id', m.id);
          } else {
            await supabase.from('team_members').insert([payload]);
          }
        }
      }

      const { data: updatedTeam } = await supabase
        .from('team_members')
        .select('*')
        .order('display_order', { ascending: true });
      if (updatedTeam) setMembers(updatedTeam);

      alert('About page content saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="web-page-loading" style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <Loader2 className="animate-spin" size={48} style={{ color: '#e03232' }} />
        <p style={{ color: '#8b949e', fontSize: '16px' }}>Loading about page data...</p>
      </div>
    );
  }

  return (
    <div>
      <PageMeta title="CMS · About" description={seo.metaDescription} keywords={seo.keywords} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: '24px' }}>
        <h1 className="web-page-title" style={{ margin: 0 }}>About CMS</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <FormDraftToolbar storageKey={DRAFT_KEY} capture={captureDraft} apply={applyDraft} disabled={saving} />
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
      </div>

      {fetchError ? (
        <p className="field-label" style={{ color: '#f87171', marginBottom: 16 }}>
          {fetchError}
        </p>
      ) : null}

      <section className="web-card">
        <h2 className="web-card-title" style={{ marginBottom: 16 }}>
          Mission &amp; vision — <code style={{ fontSize: 13, color: '#94a3b8' }}>{SECTION_VISION}</code>
        </h2>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#8b949e' }}>
          Storefront: main mission title + quote (glass box).
        </p>
        <BilingualTextInput
          labelEn="Mission headline (EN)"
          labelAr="عنوان المهمة (AR)"
          valueEn={visionHeadEn}
          valueAr={visionHeadAr}
          onChangeEn={setVisionHeadEn}
          onChangeAr={setVisionHeadAr}
        />
        <div style={{ marginTop: 16 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>Mission body (EN)</label>
          <RichTextEditor value={visionRteEn} onChange={setVisionRteEn} />
        </div>
        <div style={{ marginTop: 16 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>نص المهمة (AR)</label>
          <RichTextEditor value={visionRteAr} onChange={setVisionRteAr} rtl />
        </div>
      </section>

      <section className="web-card">
        <h2 className="web-card-title" style={{ marginBottom: 16 }}>
          Founder — <code style={{ fontSize: 13, color: '#94a3b8' }}>{SECTION_FOUNDER}</code>
        </h2>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#8b949e' }}>
          Storefront: secondary paragraph under the mission, then name and role in the footer.
        </p>
        <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>Founder story (EN)</label>
        <RichTextEditor value={missionRteEn} onChange={setMissionRteEn} />
        <div style={{ marginTop: 16 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>قصة المؤسس (AR)</label>
          <RichTextEditor value={missionRteAr} onChange={setMissionRteAr} rtl />
        </div>
        <div style={{ marginTop: 16 }}>
          <BilingualTextInput
            labelEn="Founder name (EN) — title_en"
            labelAr="اسم المؤسس (AR) — title_ar"
            valueEn={founderNameEn}
            valueAr={founderNameAr}
            onChangeEn={setFounderNameEn}
            onChangeAr={setFounderNameAr}
          />
        </div>
        <div style={{ marginTop: 16 }}>
          <BilingualTextInput
            labelEn="Founder role (EN) — subtitle_en"
            labelAr="منصب المؤسس (AR) — subtitle_ar"
            valueEn={founderTitleEn}
            valueAr={founderTitleAr}
            onChangeEn={setFounderTitleEn}
            onChangeAr={setFounderTitleAr}
          />
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
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#8b949e' }}>
          Headlines below are local to the dashboard only; the live site uses i18n for team titles. Member rows sync to{' '}
          <code style={{ color: '#cbd5e1' }}>team_members</code>.
        </p>
        <BilingualTextInput
          labelEn="Section headline (EN) — not saved to DB"
          labelAr="عنوان القسم (AR)"
          valueEn={teamHeadEn}
          valueAr={teamHeadAr}
          onChangeEn={setTeamHeadEn}
          onChangeAr={setTeamHeadAr}
        />
        <div style={{ marginTop: 16 }}>
          <BilingualTextInput
            labelEn="Section sub-headline (EN) — not saved to DB"
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
                <img src={mem.image_url || 'https://placehold.co/96x96/png'} alt={mem.name || 'Team member'} className="about-team-avatar" />
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

      <SeoSection
        title="About page SEO"
        slugPrefix="qlink.com/"
        slugSuffixHint="about/our-story"
        value={seo}
        onChange={setSeo}
        badge="Live"
      />
      <section className="web-card" style={{ marginTop: 20 }}>
        <h3 className="web-card-title" style={{ marginBottom: 16, fontSize: 15 }}>
          Arabic SEO (<code style={{ fontSize: 12, color: '#94a3b8' }}>title_ar</code>,{' '}
          <code style={{ fontSize: 12, color: '#94a3b8' }}>description_ar</code>)
        </h3>
        <div style={{ marginBottom: 14 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>
            Meta title (AR)
          </label>
          <input
            className="field-input"
            type="text"
            style={{ width: '100%' }}
            value={seo.metaTitleAr}
            onChange={(e) => setSeo((s) => ({ ...s, metaTitleAr: e.target.value }))}
          />
        </div>
        <div>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>
            Meta description (AR)
          </label>
          <textarea
            className="field-input"
            rows={3}
            style={{ width: '100%', resize: 'vertical' }}
            value={seo.metaDescriptionAr}
            onChange={(e) => setSeo((s) => ({ ...s, metaDescriptionAr: e.target.value }))}
          />
        </div>
      </section>
    </div>
  );
};

export default CmsAbout;
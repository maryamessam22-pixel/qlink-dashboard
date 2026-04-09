import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import PageMeta from "../../../components/seo/PageMeta";
import SeoSection from "../../../components/seo/SeoSection";
import myPic from "../../../assets/imges/my-pic.png";
import { supabase } from "../../../lib/supabase";
import "./AppSettings.css";

const AppSettings = () => {
  const [profileId, setProfileId] = useState("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [curPass, setCurPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [seo, setSeo] = useState({
    slug: "project-slug",
    metaTitle: "SEO title displayed in Google Search",
    metaDescription: "Brief summary for search engines...",
    keywords: "profile, qlink, app settings",
    featuredImageAlt: "Describe the image for accessibility and SEO",
  });

  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      setLoading(true);
      setFetchError("");
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, job_title, email, avatar_url, seo_slug, meta_title_en, meta_description_en, featured_image_alt_en, created_at")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!mounted) return;
      if (error) {
        setFetchError(error.message || "Failed to load profile.");
        setLoading(false);
        return;
      }

      if (data) {
        setProfileId(data.id || "");
        setName(data.full_name || "");
        setTitle(data.job_title || "");
        setEmail(data.email || "");
        setAvatarUrl(data.avatar_url || "");
        setSeo((prev) => ({
          ...prev,
          slug: data.seo_slug || prev.slug,
          metaTitle: data.meta_title_en || prev.metaTitle,
          metaDescription: data.meta_description_en || prev.metaDescription,
          featuredImageAlt: data.featured_image_alt_en || prev.featuredImageAlt,
        }));
      }
      setLoading(false);
    };
    fetchProfile();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async () => {
    if (!profileId) {
      setSaveMessage("Profile id is missing, cannot save.");
      return;
    }

    if ((newPass || confirmPass || curPass) && newPass !== confirmPass) {
      setSaveMessage("New password and confirm password do not match.");
      return;
    }

    setSaving(true);
    setSaveMessage("");

    const payload = {
      full_name: name,
      job_title: title,
      email,
      seo_slug: seo.slug,
      meta_title_en: seo.metaTitle,
      meta_description_en: seo.metaDescription,
      featured_image_alt_en: seo.featuredImageAlt,
    };

    if (newPass && confirmPass) {
      payload.password = newPass;
    }

    const { error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", profileId);

    if (error) {
      setSaveMessage(error.message || "Failed to save changes.");
      setSaving(false);
      return;
    }

    setSaveMessage("Changes saved successfully.");
    setCurPass("");
    setNewPass("");
    setConfirmPass("");
    setSaving(false);
  };

  return (
    <div className="app-settings-page">
      <PageMeta title="App · Settings" description={seo.metaDescription} keywords={seo.keywords} />

      <div className="app-settings-head">
        <h1 className="app-settings-title">Settings</h1>
        <p className="app-settings-sub">Manage Profile Settings</p>
      </div>

      <section className="app-settings-card">
        <div className="app-settings-profile-head">
          <div className="app-settings-profile-who">
            <img src={avatarUrl || myPic} alt="" className="app-settings-avatar" />
            <div>
              <h2 className="app-settings-inline-name">{name}</h2>
              <p className="app-settings-inline-role">{title}</p>
            </div>
          </div>
          <button type="button" className="app-settings-save-btn" onClick={handleSave} disabled={saving || loading}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        <div className="app-settings-field">
          <label>Full Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="app-settings-field">
          <label>Job Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="app-settings-field">
          <label>Email Address (Login)</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </section>

      {fetchError ? <p className="app-settings-note app-settings-note--error">{fetchError}</p> : null}
      {loading ? <p className="app-settings-note app-settings-note--loading">Loading profile data...</p> : null}
      {saveMessage ? (
        <p className={`app-settings-note ${saveMessage.includes("successfully") ? "app-settings-note--success" : "app-settings-note--error"}`}>
          {saveMessage}
        </p>
      ) : null}

      <section className="app-settings-card">
        <h2 className="app-settings-card-title">Security</h2>
        <div className="app-settings-field">
          <label>Current password</label>
          <input type="password" value={curPass} onChange={(e) => setCurPass(e.target.value)} />
        </div>
        <div className="app-settings-pass-row">
          <div className="app-settings-field">
            <label>New password</label>
            <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
          </div>
          <div className="app-settings-field">
            <label>Confirm password</label>
            <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />
          </div>
        </div>
      </section>

      <div className="app-settings-seo-wrap">
        <div className="app-settings-seo-head">
          <Search size={18} className="app-settings-seo-icon" />
          <h2 className="app-settings-card-title" style={{ margin: 0 }}>
            Edit Profile SEO
          </h2>
          <span className="seo-badge">Global Requirement</span>
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

export default AppSettings;

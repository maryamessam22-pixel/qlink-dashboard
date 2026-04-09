import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Plus, X } from "lucide-react";
import PageMeta from "../../../components/seo/PageMeta";
import SeoSection from "../../../components/seo/SeoSection";
import RichTextEditor from "../../../components/rich-text/RichTextEditor";
import { getAppProfilesList } from "../../../data/appProfiles";
import "./EditUserProfile.css";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const EditUserProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profileId } = useParams();

  const fallbackProfiles = useMemo(() => getAppProfilesList(15).rows, []);
  const selectedProfile = useMemo(() => {
    const fromState = location.state?.profile;
    if (fromState && fromState.id) return fromState;
    return fallbackProfiles.find((p) => p.id === profileId) || fallbackProfiles[0];
  }, [location.state, fallbackProfiles, profileId]);

  const [fullName, setFullName] = useState(selectedProfile?.fullName || "");
  const [relationship, setRelationship] = useState("Guardian");
  const [birthYear, setBirthYear] = useState(String(new Date().getFullYear() - (selectedProfile?.age || 22)));
  const [primaryPhone, setPrimaryPhone] = useState("01000000000");
  const [contacts, setContacts] = useState(["01000000000"]);
  const [allergies, setAllergies] = useState("e.g. Penicilin, Peanut, Shrimp");
  const [safetyNotes, setSafetyNotes] = useState("e.g. ADD/ADHD safety instructions");
  const [bloodType, setBloodType] = useState(selectedProfile?.bloodType || "AB+");
  const [medicalNotesEn, setMedicalNotesEn] = useState("<p>e.g. diabetic</p>");
  const [medicalNotesAr, setMedicalNotesAr] = useState("<p>مثال: مريض سكري</p>");

  const [seo, setSeo] = useState({
    slug: `profile-${(selectedProfile?.fullName || "user").toLowerCase().replace(/\s+/g, "-")}`,
    metaTitle: `${selectedProfile?.fullName || "Profile"} | Medical details`,
    metaDescription: "Update patient information and medical details.",
    keywords: "profile, medical, guardian, qlink",
    featuredImageAlt: "Patient profile",
  });

  const addContact = () => setContacts((c) => [...c, ""]);
  const updateContact = (idx, value) => {
    setContacts((c) => c.map((item, i) => (i === idx ? value : item)));
  };
  const removeContact = (idx) => {
    setContacts((c) => c.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    window.alert("Profile changes saved (demo). Connect to API to persist.");
    navigate("/app/user-profiles");
  };

  return (
    <div className="app-edit-profile-page">
      <PageMeta title="App · Edit Profile" description={seo.metaDescription} keywords={seo.keywords} />

      <div className="app-edit-profile-head">
        <div>
          <h1 className="app-edit-profile-title">Edit Profile</h1>
          <p className="app-edit-profile-sub">Update patient information and medical details</p>
        </div>
        <button type="button" className="app-edit-profile-close" onClick={() => navigate("/app/user-profiles")} aria-label="Close">
          <X size={18} />
        </button>
      </div>

      <section className="app-edit-card">
        <h2 className="app-edit-section-title">Identity Information</h2>
        <p className="app-edit-step">Step 1 of 3</p>

        <div className="app-edit-field">
          <label>Patient&apos;s Full Name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Mariam Essam" />
        </div>

        <div className="app-edit-field">
          <label>Relationship to You</label>
          <input value={relationship} onChange={(e) => setRelationship(e.target.value)} placeholder="e.g. Guardian" />
        </div>

        <div className="app-edit-field">
          <label>Birth Year</label>
          <input value={birthYear} onChange={(e) => setBirthYear(e.target.value)} placeholder="e.g. 1987" />
        </div>

        <div className="app-edit-field">
          <label>EMERGENCY CONTACT * (Primary Guardian Phone)</label>
          <input value={primaryPhone} onChange={(e) => setPrimaryPhone(e.target.value)} placeholder="e.g. 01111000000" />
        </div>

        <div className="app-edit-field">
          <label>Additional Contacts</label>
          {contacts.map((contact, idx) => (
            <div key={idx} className="app-edit-inline-row">
              <input value={contact} onChange={(e) => updateContact(idx, e.target.value)} placeholder="additional phone number" />
              {contacts.length > 1 ? (
                <button type="button" className="app-edit-inline-remove" onClick={() => removeContact(idx)} aria-label="Remove contact">
                  <X size={14} />
                </button>
              ) : null}
            </div>
          ))}
          <button type="button" className="app-edit-link-btn" onClick={addContact}>
            <Plus size={14} />
            Add More Contact Number
          </button>
        </div>

        <h2 className="app-edit-section-title" style={{ marginTop: 26 }}>Medical Information</h2>
        <p className="app-edit-step">Step 2 of 3</p>

        <div className="app-edit-field">
          <label>Safety Notes</label>
          <input value={safetyNotes} onChange={(e) => setSafetyNotes(e.target.value)} />
        </div>

        <div className="app-edit-field">
          <label>Allergies</label>
          <input value={allergies} onChange={(e) => setAllergies(e.target.value)} />
        </div>

        <div className="app-edit-field">
          <label>Blood Type</label>
          <div className="app-edit-blood-grid">
            {BLOOD_TYPES.map((bt) => (
              <button
                key={bt}
                type="button"
                className={`app-edit-blood-btn ${bloodType === bt ? "active" : ""}`}
                onClick={() => setBloodType(bt)}
              >
                {bt}
              </button>
            ))}
          </div>
        </div>

        <div className="app-edit-field">
          <label>Medical Notes</label>
          <RichTextEditor value={medicalNotesEn} onChange={setMedicalNotesEn} placeholder="Medical notes in English..." />
        </div>

        <div className="app-edit-field">
          <label style={{ direction: "rtl", textAlign: "right", display: "block" }}>ملاحظات طبية</label>
          <RichTextEditor value={medicalNotesAr} onChange={setMedicalNotesAr} rtl placeholder="ملاحظات طبية..." />
        </div>

        <div className="app-edit-actions">
          <button type="button" className="app-edit-save-btn" onClick={handleSave}>
            Save Changes
          </button>
          <Link to="/app/user-profiles" className="app-edit-cancel-btn">
            Cancel
          </Link>
        </div>
      </section>

      <div className="app-edit-seo-wrap">
        <SeoSection
          title="Edit Profile SEO"
          slugPrefix="mariamfarid.com/"
          slugSuffixHint="patient-slug"
          value={seo}
          onChange={setSeo}
          badge="Global Requirement"
        />
      </div>
    </div>
  );
};

export default EditUserProfile;

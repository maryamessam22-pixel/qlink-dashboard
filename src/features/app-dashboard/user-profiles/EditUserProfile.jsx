import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Plus, X } from "lucide-react";
import PageMeta from "../../../components/seo/PageMeta";
import SeoSection from "../../../components/seo/SeoSection";
import RichTextEditor from "../../../components/rich-text/RichTextEditor";
import { supabase } from "../../../lib/supabase";
import "./EditUserProfile.css";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromTime(nowMs = Date.now()) {
  const bucket = Math.floor(nowMs / 60000);
  return mulberry32((bucket % 2147483647) + 3);
}

const FIRST = ["Mariam", "Mohamed", "Karma", "Yousef", "Leila", "Hoda", "Ola", "Zeinab", "Rania", "Farah", "Tamer", "Nada", "Ibrahim", "Rami", "Nour", "Jana"];
const LAST = ["Essam", "Saber", "Ahmed", "Mansour", "Wahba", "Mostafa", "Hassan", "Kamel", "Mahmoud", "Farid", "Saad", "Nabil"];

function pick(arr, next) {
  return arr[Math.floor(next() * arr.length)];
}

function getFallbackProfiles(count = 15, nowMs = Date.now()) {
  const next = seedFromTime(nowMs);
  const rows = [];
  for (let i = 0; i < count; i += 1) {
    const fullName = `${pick(FIRST, next)} ${pick(LAST, next)}`;
    const age = Math.floor(next() * 85) + 1;
    rows.push({
      id: `PRF-${1200 + Math.floor(next() * 8000)}`,
      fullName,
      age,
      bloodType: BLOOD_TYPES[Math.floor(next() * BLOOD_TYPES.length)],
    });
  }
  return rows;
}

const EditUserProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profileId } = useParams();
  const isNew = !profileId || profileId === "new";

  const fallbackProfiles = useMemo(() => getFallbackProfiles(15), []);
  const selectedProfile = useMemo(() => {
    if (isNew) return null;
    const fromState = location.state?.profile;
    if (fromState && fromState.id) return fromState;
    return fallbackProfiles.find((p) => p.id === profileId) || null;
  }, [location.state, fallbackProfiles, profileId, isNew]);

  const [fullName, setFullName] = useState(selectedProfile?.fullName || "");
  const [relationship, setRelationship] = useState(selectedProfile?.relationship || "Guardian");
  const [birthYear, setBirthYear] = useState(selectedProfile?.age ? String(new Date().getFullYear() - selectedProfile.age) : "2000");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [contacts, setContacts] = useState([""]);
  const [allergies, setAllergies] = useState("");
  const [safetyNotes, setSafetyNotes] = useState("");
  const [bloodType, setBloodType] = useState(selectedProfile?.bloodType || "O+");
  const [medicalNotesEn, setMedicalNotesEn] = useState("");
  const [medicalNotesAr, setMedicalNotesAr] = useState("");

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

  const handleSave = async () => {
    if (!fullName) {
      window.alert("Please enter a full name.");
      return;
    }
    try {
      const payload = {
        profile_name: fullName,
        relationship_to_guardian: relationship,
        birth_year: parseInt(birthYear) || null,
        blood_type: bloodType,
        status: true
      };

      if (isNew) {
        const { error } = await supabase.from('patient_profiles').insert([payload]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('patient_profiles').update(payload).eq('id', selectedProfile.id);
        if (error) throw error;
      }

      navigate("/app/user-profiles");
    } catch (error) {
      window.alert("Error: " + error.message);
    }
  };

  return (
    <div className="app-edit-profile-page">
      <PageMeta title="App · Edit Profile" description={seo.metaDescription} keywords={seo.keywords} />

      <div className="app-edit-profile-head">
        <div>
          <h1 className="app-edit-profile-title">{isNew ? "Add New Profile" : "Edit Profile"}</h1>
          <p className="app-edit-profile-sub">{isNew ? "Create a new patient profile and medical record" : "Update patient information and medical details"}</p>
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
            {isNew ? "Create Profile" : "Save Changes"}
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
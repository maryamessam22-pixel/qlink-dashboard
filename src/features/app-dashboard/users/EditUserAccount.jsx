import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import PageMeta from "../../../components/seo/PageMeta";
import { supabase } from "../../../lib/supabase";
import "./EditUserAccount.css";

const EditUserAccount = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("guardian");
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!fullName || !email) {
      window.alert("Please fill in the full name and email.");
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').insert([
        {
          full_name: fullName,
          email: email,
          role: role,
          job_title: jobTitle,
          status: true,
          registration_date: new Date().toISOString().split('T')[0]
        }
      ]);

      if (error) throw error;
      navigate("/app/users");
    } catch (error) {
      window.alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-edit-user-page">
      <PageMeta title="App · Add User" description="Create a new user account." />

      <div className="app-edit-user-head">
        <div>
          <h1 className="app-edit-user-title">Add New User</h1>
          <p className="app-edit-user-sub">Create a new guardian or patient account manually.</p>
        </div>
        <button type="button" className="app-edit-user-close" onClick={() => navigate("/app/users")} aria-label="Close">
          <X size={18} />
        </button>
      </div>

      <section className="app-edit-card">
        <div className="app-edit-field">
          <label>Full Name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Ahmed Saber" />
        </div>

        <div className="app-edit-field">
          <label>Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. ahmed@example.com" />
        </div>

        <div className="app-edit-field">
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="app-edit-select">
            <option value="guardian">Guardian</option>
            <option value="patient">Patient</option>
          </select>
        </div>

        <div className="app-edit-field">
          <label>Job Title (Optional)</label>
          <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Doctor" />
        </div>

        <div className="app-edit-actions">
          <button type="button" className="app-edit-save-btn" onClick={handleSave} disabled={loading}>
            {loading ? "Creating..." : "Create User"}
          </button>
          <Link to="/app/users" className="app-edit-cancel-btn">
            Cancel
          </Link>
        </div>
      </section>
    </div>
  );
};

export default EditUserAccount;

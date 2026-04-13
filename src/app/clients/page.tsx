"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import type { ClientProfile } from "@/types";

const emptyForm = {
  firstName: "",
  lastName: "",
  age: "",
  gender: "",
  education: "",
  occupation: "",
  referralReason: "",
  culturalBackground: "",
  languages: "",
  dateOfBirth: "",
};

export default function ClientsPage() {
  const { state, addClient, dispatch, logAudit } = useStore();
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = addClient({
      firstName: form.firstName,
      lastName: form.lastName,
      age: Number(form.age) || 0,
      gender: form.gender,
      education: form.education,
      occupation: form.occupation,
      referralReason: form.referralReason,
      culturalBackground: form.culturalBackground,
      languages: form.languages.split(",").map((l) => l.trim()).filter(Boolean),
      dateOfBirth: form.dateOfBirth,
    });
    logAudit("CREATE_CLIENT", "client", id);
    setForm(emptyForm);
    setShowForm(false);
  };

  const setActive = (id: string) => {
    dispatch({ type: "SET_ACTIVE_CLIENT", payload: id });
    logAudit("SET_ACTIVE_CLIENT", "client", id);
  };

  const field = (label: string, key: keyof typeof form, type = "text", required = false) => (
    <label className="block" key={key}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        required={required}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="mt-1 block w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary-400 focus:ring-1 focus:ring-primary-300 outline-none"
      />
    </label>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Client Management</h1>
          <p className="text-sm text-slate-500">Register and manage clients for projective testing</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          {showForm ? "Cancel" : "+ New Client"}
        </button>
      </div>

      {/* New Client Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-6 mb-6">
          <h2 className="font-semibold text-primary-800 mb-4">New Client Registration</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {field("First Name *", "firstName", "text", true)}
            {field("Last Name *", "lastName", "text", true)}
            {field("Age *", "age", "number", true)}
            {field("Gender", "gender")}
            {field("Date of Birth", "dateOfBirth", "date")}
            {field("Education", "education")}
            {field("Occupation", "occupation")}
            {field("Cultural Background", "culturalBackground")}
            {field("Languages (comma-separated)", "languages")}
          </div>
          <label className="block mt-4">
            <span className="text-sm font-medium text-slate-700">Referral Reason *</span>
            <textarea
              required
              value={form.referralReason}
              onChange={(e) => setForm({ ...form, referralReason: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary-400 focus:ring-1 focus:ring-primary-300 outline-none"
            />
          </label>
          <button
            type="submit"
            className="mt-4 px-6 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            Register Client
          </button>
        </form>
      )}

      {/* Client List */}
      {state.clients.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg">No clients registered yet</p>
          <p className="text-sm mt-1">Click &quot;+ New Client&quot; to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {state.clients.map((c: ClientProfile) => {
            const sessions = state.sessions.filter((s) => s.clientId === c.id);
            const isActive = state.activeClientId === c.id;
            return (
              <div
                key={c.id}
                className={`rounded-xl border p-4 flex items-center justify-between cursor-pointer transition-colors ${
                  isActive ? "border-primary-400 bg-primary-50" : "border-border bg-white hover:bg-slate-50"
                }`}
                onClick={() => setActive(c.id)}
              >
                <div>
                  <h3 className="font-semibold text-primary-900">
                    {c.firstName} {c.lastName}
                    {isActive && <span className="ml-2 text-xs bg-primary-200 text-primary-800 px-2 py-0.5 rounded-full">Active</span>}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {c.age}y · {c.gender || "—"} · {c.occupation || "—"} · {c.referralReason.slice(0, 60)}
                    {c.referralReason.length > 60 ? "..." : ""}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>{sessions.length} session{sessions.length !== 1 ? "s" : ""}</p>
                  <p className="mt-0.5">{new Date(c.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

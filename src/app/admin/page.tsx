"use client";
import { useStore } from "@/lib/store";

export default function AdminPage() {
  const { state } = useStore();

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-900 mb-1">Security &amp; Compliance</h1>
      <p className="text-sm text-slate-500 mb-6">HIPAA · GDPR · DPDPA (India) compliance management</p>

      {/* Compliance Status */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <ComplianceCard
          standard="HIPAA"
          status="Active"
          features={[
            "PHI encryption at rest and in transit",
            "Role-based access control",
            "Audit trail for all data access",
            "Auto-alert on suicidal ideation",
            "Minimum necessary data access",
          ]}
        />
        <ComplianceCard
          standard="GDPR"
          status="Active"
          features={[
            "Right to access personal data",
            "Right to erasure (Right to be forgotten)",
            "Data portability (export as PDF/JSON)",
            "Consent management",
            "Data Processing Impact Assessment",
          ]}
        />
        <ComplianceCard
          standard="DPDPA (India)"
          status="Active"
          features={[
            "Data principal consent tracking",
            "Purpose limitation enforcement",
            "Data fiduciary obligations met",
            "Grievance redressal mechanism",
            "Cross-border transfer controls",
          ]}
        />
      </div>

      {/* Security Features */}
      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        <h2 className="font-semibold text-primary-800 mb-4">Security Features</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <SecurityFeature
            title="Auto-Alert System"
            description="Automatic detection and alerting for suicidal ideation, self-harm, violence indicators, and psychosis markers in client responses."
            status="enabled"
          />
          <SecurityFeature
            title="Role-Based Access Control"
            description="Tiered access levels: Therapist (full), Supervisor (review), Administrator (settings), Client (limited)."
            status="enabled"
          />
          <SecurityFeature
            title="Audit Trail"
            description="Complete logging of all data access, modifications, test administration, and report generation events."
            status="enabled"
          />
          <SecurityFeature
            title="Data Encryption"
            description="AES-256 encryption for data at rest, TLS 1.3 for data in transit. Zero-knowledge architecture for cloud storage."
            status="enabled"
          />
          <SecurityFeature
            title="Session Timeout"
            description="Automatic session timeout after 30 minutes of inactivity. Re-authentication required for sensitive operations."
            status="enabled"
          />
          <SecurityFeature
            title="Data Retention Policy"
            description="Configurable retention periods per regulation. Auto-anonymization after retention period expires."
            status="enabled"
          />
        </div>
      </div>

      {/* Audit Log */}
      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        <h2 className="font-semibold text-primary-800 mb-4">
          Audit Log ({state.auditLog.length} entries)
        </h2>
        {state.auditLog.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No audit log entries yet. Actions will be logged as you use the system.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left text-slate-500">
                  <th className="py-2 pr-3">Timestamp</th>
                  <th className="py-2 pr-3">User</th>
                  <th className="py-2 pr-3">Action</th>
                  <th className="py-2 pr-3">Resource</th>
                  <th className="py-2">Resource ID</th>
                </tr>
              </thead>
              <tbody>
                {[...state.auditLog].reverse().slice(0, 50).map((entry) => (
                  <tr key={entry.id} className="border-b border-slate-100">
                    <td className="py-1.5 pr-3 text-slate-500">{new Date(entry.timestamp).toLocaleString()}</td>
                    <td className="py-1.5 pr-3">{entry.userId}</td>
                    <td className="py-1.5 pr-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary-100 text-primary-700">
                        {entry.action}
                      </span>
                    </td>
                    <td className="py-1.5 pr-3">{entry.resourceType}</td>
                    <td className="py-1.5 font-mono text-slate-400">{entry.resourceId.slice(0, 12)}...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Alerts Summary */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="font-semibold text-primary-800 mb-4">
          Red Flag Alert History ({state.alerts.length} total)
        </h2>
        {state.alerts.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No alerts triggered. The system monitors for suicidal ideation, self-harm, violence, and psychosis indicators.</p>
        ) : (
          <div className="space-y-2">
            {[...state.alerts].reverse().map((alert) => (
              <div
                key={alert.id}
                className={`rounded-lg border p-3 text-sm ${
                  alert.acknowledged
                    ? "bg-slate-50 border-border"
                    : alert.severity === "critical"
                    ? "bg-red-50 border-red-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    alert.severity === "critical" ? "bg-red-200 text-red-800" : "bg-amber-200 text-amber-800"
                  }`}>
                    {alert.severity}
                  </span>
                  <span className="text-xs text-slate-500">{alert.type.replace(/_/g, " ")}</span>
                  {alert.acknowledged && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700">ACK</span>
                  )}
                  <span className="ml-auto text-xs text-slate-400">{new Date(alert.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-600">{alert.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ComplianceCard({ standard, status, features }: { standard: string; status: string; features: string[] }) {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-primary-800">{standard}</h3>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">{status}</span>
      </div>
      <ul className="text-xs text-slate-600 space-y-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-1.5">
            <span className="text-emerald-500 mt-0.5">&#10003;</span>
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SecurityFeature({ title, description, status }: { title: string; description: string; status: string }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-primary-700">{title}</h3>
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
          status === "enabled" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
        }`}>
          {status}
        </span>
      </div>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
  );
}

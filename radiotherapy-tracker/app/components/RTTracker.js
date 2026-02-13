"use client";
import { useState, useMemo, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════
// DATA & CONFIG
// ═══════════════════════════════════════════════════════
const MODES = ["Cash", "GPay", "PhonePe", "Card", "NEFT", "Cheque", "UPI", "Other"];
const MODE_COLORS = { Cash: "#10b981", GPay: "#6366f1", PhonePe: "#8b5cf6", Card: "#f59e0b", NEFT: "#0ea5e9", Cheque: "#ec4899", UPI: "#14b8a6", Other: "#94a3b8" };

const fmt = (v) => { const n = parseFloat(v); return isNaN(n) ? "₹0" : "₹" + n.toLocaleString("en-IN"); };
const fmtDate = (v) => { if (!v) return "—"; try { return new Date(v + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); } catch { return v; } };

// ═══════════════════════════════════════════════════════
// MINI BAR CHART COMPONENT
// ═══════════════════════════════════════════════════════
function MiniBarChart({ data, height = 140 }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const barW = Math.min(42, Math.floor((280) / data.length) - 8);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height, padding: "0 4px" }}>
      {data.map((d, i) => {
        const h = Math.max(4, (d.value / max) * (height - 28));
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>{d.value > 0 ? fmt(d.value) : ""}</span>
            <div style={{
              width: barW, height: h, borderRadius: "6px 6px 3px 3px",
              background: `linear-gradient(180deg, ${d.color}dd, ${d.color}88)`,
              transition: "height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
              boxShadow: `0 2px 8px ${d.color}33`,
            }} />
            <span style={{ fontSize: 8, fontWeight: 600, color: "#94a3b8", marginTop: 4, textAlign: "center", lineHeight: 1.1 }}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// DONUT CHART COMPONENT
// ═══════════════════════════════════════════════════════
function DonutChart({ open, closed, size = 120 }) {
  const total = open + closed;
  const openPct = total > 0 ? open / total : 0;
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="14" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f59e0b" strokeWidth="14"
          strokeDasharray={`${circ * openPct} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)" }} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#10b981" strokeWidth="14"
          strokeDasharray={`${circ * (1 - openPct)} ${circ}`}
          strokeDashoffset={`${-circ * openPct}`}
          strokeLinecap="round"
          style={{ transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: "#1e293b", letterSpacing: "-0.5px" }}>{total}</span>
        <span style={{ fontSize: 8, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>Total</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SPARKLINE COMPONENT
// ═══════════════════════════════════════════════════════
function Sparkline({ data, color = "#6366f1", width = 120, height = 32 }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 4) - 2}`).join(" ");
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
      <circle cx={width} cy={parseFloat(points.split(" ").pop().split(",")[1])} r="3" fill={color} />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════
export default function App() {
  const [role, setRole] = useState(null);
  const [userName, setUserName] = useState("");
  const [loginUser, setLoginUser] = useState("");
  const [pw, setPw] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loginShake, setLoginShake] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortField, setSortField] = useState("receiptDate");
  const [sortDir, setSortDir] = useState("desc");
  const [toast, setToast] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedRec, setSelectedRec] = useState(null);

  const empty = { regNo: "", opDate: "", ipNo: "", name: "", amount: "", mode: "GPay", receiptDate: "", txnNo: "", billClosed: "" };
  const [form, setForm] = useState({ ...empty });
  const [formErrors, setFormErrors] = useState({});
  const [editRec, setEditRec] = useState(null);
  const [billCloseRec, setBillCloseRec] = useState(null);
  const [billCloseDate, setBillCloseDate] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/records");
      if (res.ok) { const data = await res.json(); setRecords(data); }
      else notify("Failed to load records", "error");
    } catch { notify("Network error loading records", "error"); }
    setLoading(false);
  };

  useEffect(() => { if (role) fetchRecords(); }, [role]);

  const notify = (msg, type) => { setToast({ msg, type: type || "success" }); setTimeout(() => setToast(null), 3000); };

  const doLogin = async () => {
    if (!loginUser.trim() || !pw.trim()) {
      setLoginErr("Enter username and password");
      setLoginShake(true); setTimeout(() => setLoginShake(false), 500);
      return;
    }
    setLoginLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUser.trim(), password: pw }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRole(data.role);
        setUserName(data.name || data.username);
        setLoginErr("");
      } else {
        setLoginErr(data.error || "Invalid credentials");
        setLoginShake(true); setTimeout(() => setLoginShake(false), 500);
      }
    } catch {
      setLoginErr("Network error. Please try again.");
      setLoginShake(true); setTimeout(() => setLoginShake(false), 500);
    }
    setLoginLoading(false);
    setPw("");
  };

  const filtered = useMemo(() => {
    let d = [...records];
    if (search.trim()) { const s = search.toLowerCase(); d = d.filter(r => r.fields.name.toLowerCase().includes(s) || r.fields.regNo.toLowerCase().includes(s) || r.fields.ipNo.toLowerCase().includes(s) || String(r.fields.amount).includes(s)); }
    if (filterMode !== "All") d = d.filter(r => r.fields.mode === filterMode);
    if (filterStatus === "Open") d = d.filter(r => !r.fields.billClosed);
    if (filterStatus === "Closed") d = d.filter(r => !!r.fields.billClosed);
    d.sort((a, b) => { let va = a.fields[sortField] || "", vb = b.fields[sortField] || ""; if (sortField === "amount") { va = parseFloat(va) || 0; vb = parseFloat(vb) || 0; } return va < vb ? (sortDir === "asc" ? -1 : 1) : va > vb ? (sortDir === "asc" ? 1 : -1) : 0; });
    return d;
  }, [records, search, filterMode, filterStatus, sortField, sortDir]);

  const stats = useMemo(() => {
    const o = records.filter(r => !r.fields.billClosed), c = records.filter(r => !!r.fields.billClosed);
    const tA = records.reduce((s, r) => s + (parseFloat(r.fields.amount) || 0), 0);
    const oA = o.reduce((s, r) => s + (parseFloat(r.fields.amount) || 0), 0);
    const cA = c.reduce((s, r) => s + (parseFloat(r.fields.amount) || 0), 0);
    const byMode = {};
    records.forEach(r => { const m = r.fields.mode; if (!byMode[m]) byMode[m] = { count: 0, amount: 0 }; byMode[m].count++; byMode[m].amount += parseFloat(r.fields.amount) || 0; });
    const recent = [...records].sort((a, b) => (b.created || "").localeCompare(a.created || "")).slice(0, 5);
    const amountTrend = records.map(r => parseFloat(r.fields.amount) || 0);
    return { total: records.length, open: o.length, closed: c.length, tA, oA, cA, byMode, recent, amountTrend };
  }, [records]);

  const toggleSort = (f) => { if (sortField === f) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortField(f); setSortDir("asc"); } };

  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    const e = {};
    if (!form.regNo.trim()) e.regNo = true; if (!form.opDate) e.opDate = true;
    if (!form.name.trim()) e.name = true;
    if (!form.amount || parseFloat(form.amount) <= 0) e.amount = true; if (!form.receiptDate) e.receiptDate = true;
    if (form.mode !== "Cash" && !form.txnNo.trim()) e.txnNo = true;
    setFormErrors(e); if (Object.keys(e).length) return;
    setSaving(true);
    try {
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: { ...form, amount: parseFloat(form.amount), billClosed: form.billClosed || "" } }),
      });
      if (res.ok) {
        const newRec = await res.json();
        setRecords(p => [...p, newRec]);
        setForm({ ...empty }); setFormErrors({}); setView("table"); notify("Record added successfully!");
      } else notify("Failed to add record", "error");
    } catch { notify("Network error", "error"); }
    setSaving(false);
  };

  const handleSaveEdit = async () => {
    if (!editRec) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/records/${editRec.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: { ...editRec.fields, amount: parseFloat(editRec.fields.amount) || 0 } }),
      });
      if (res.ok) {
        const updated = await res.json();
        setRecords(p => p.map(r => r.id === editRec.id ? updated : r));
        setEditRec(null); notify("Record updated!");
      } else notify("Failed to update record", "error");
    } catch { notify("Network error", "error"); }
    setSaving(false);
  };

  const handleBillClose = async () => {
    if (!billCloseRec || !billCloseDate) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/records/${billCloseRec.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: { billClosed: billCloseDate } }),
      });
      if (res.ok) {
        const updated = await res.json();
        setRecords(p => p.map(r => r.id === billCloseRec.id ? updated : r));
        setBillCloseRec(null); setBillCloseDate(""); notify("Bill closed successfully!");
      } else notify("Failed to close bill", "error");
    } catch { notify("Network error", "error"); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/records/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        setRecords(p => p.filter(r => r.id !== deleteId));
        setDeleteId(null); notify("Record deleted.");
      } else notify("Failed to delete record", "error");
    } catch { notify("Network error", "error"); }
    setSaving(false);
  };

  const exportCSV = () => {
    const h = "Registration Number,OP Visit Date,IP Number,Patient Name,Amount,Mode,Transaction Number,Date of Receipt,Bill Closed Date";
    const rows = filtered.map(r => { const f = r.fields; return [f.regNo, f.opDate, f.ipNo, f.name, f.amount, f.mode, f.txnNo, f.receiptDate, f.billClosed].map(v => `"${v || ""}"`).join(","); });
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([[h, ...rows].join("\n")], { type: "text/csv" }));
    a.download = `rt_advances_${new Date().toISOString().slice(0,10)}.csv`; a.click(); notify("CSV exported!");
  };

  const printReceipt = (rec) => {
    const f = rec.fields;
    const w = window.open("", "_blank", "width=440,height=650");
    if (!w) { notify("Allow popups to print", "error"); return; }
    w.document.write(`<html><head><title>Receipt - ${f.regNo}</title><style>
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'DM Sans',sans-serif;padding:32px;color:#1e293b;max-width:400px;margin:0 auto}
      .hdr{text-align:center;padding-bottom:16px;margin-bottom:20px;border-bottom:2px solid #0f766e}
      .hdr h2{font-size:16px;color:#0f766e;letter-spacing:1px;text-transform:uppercase}
      .hdr p{font-size:10px;color:#94a3b8;margin-top:4px}
      .regbadge{display:inline-block;background:#f0fdfa;color:#0f766e;padding:4px 14px;border-radius:20px;font-size:13px;font-weight:700;margin:10px 0}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0}
      .cell{padding:10px;background:#f8fafc;border-radius:8px}
      .cell .lbl{font-size:9px;text-transform:uppercase;letter-spacing:0.5px;color:#94a3b8;font-weight:600}
      .cell .val{font-size:13px;font-weight:600;color:#1e293b;margin-top:2px}
      .amt{font-size:28px;text-align:center;color:#0f766e;font-weight:800;margin:20px 0;letter-spacing:-0.5px}
      .sts{text-align:center;padding:10px;border-radius:8px;font-weight:700;font-size:12px;margin:14px 0;letter-spacing:0.5px}
      .open{background:#fef3c7;color:#92400e}.closed{background:#d1fae5;color:#065f46}
      .ftr{text-align:center;margin-top:28px;padding-top:14px;border-top:1px dashed #e2e8f0;font-size:9px;color:#94a3b8}
      @media print{body{padding:16px}}
    </style></head><body>
      <div class="hdr"><h2>Radiotherapy Advance Receipt</h2><p>Patient Advance Payment Record</p></div>
      <div style="text-align:center"><span class="regbadge">${f.regNo}</span></div>
      <div class="grid">
        <div class="cell"><div class="lbl">Patient Name</div><div class="val">${f.name}</div></div>
        <div class="cell"><div class="lbl">IP Number</div><div class="val">${f.ipNo}</div></div>
        <div class="cell"><div class="lbl">OP Visit Date</div><div class="val">${fmtDate(f.opDate)}</div></div>
        <div class="cell"><div class="lbl">Payment Mode</div><div class="val">${f.mode}</div></div>
      </div>
      ${f.txnNo ? `<div style="text-align:center;margin:8px 0"><div style="font-size:9px;text-transform:uppercase;letter-spacing:0.5px;color:#94a3b8;font-weight:600">Transaction Number</div><div style="font-size:14px;font-weight:700;color:#334155;margin-top:2px">${f.txnNo}</div></div>` : ""}
      <div class="amt">${fmt(f.amount)}</div>
      <div class="grid">
        <div class="cell"><div class="lbl">Receipt Date</div><div class="val">${fmtDate(f.receiptDate)}</div></div>
        <div class="cell"><div class="lbl">Bill Status</div><div class="val">${f.billClosed ? "Closed" : "Open"}</div></div>
      </div>
      <div class="sts ${f.billClosed ? "closed" : "open"}">${f.billClosed ? "BILL CLOSED — " + fmtDate(f.billClosed) : "BILL OPEN — Advance Pending Settlement"}</div>
      <div class="ftr"><p>Generated: ${new Date().toLocaleString("en-IN")}</p><p>Computer-generated receipt • No signature required</p></div>
    </body></html>`);
    w.document.close(); setTimeout(() => w.print(), 300);
  };

  // ═══════════════════════════════════════════════════════
  // STYLES
  // ═══════════════════════════════════════════════════════
  const globalCSS = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
    @keyframes toastIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes shimmer { from { background-position: -200% center; } to { background-position: 200% center; } }
    @keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
    .hover-lift { transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
    .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.08); }
    .hover-row { transition: all 0.15s; }
    .hover-row:hover { background: #f0fdf9 !important; }
    .btn-press { transition: all 0.12s; }
    .btn-press:active { transform: scale(0.96); }
    input:focus, select:focus { outline: none; border-color: #0f766e !important; box-shadow: 0 0 0 3px rgba(15,118,110,0.1) !important; }
  `;

  // ═══════════════════════════════════════════════════════
  // LOGIN SCREEN
  // ═══════════════════════════════════════════════════════
  if (!role) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit', sans-serif", padding: 20, position: "relative", overflow: "hidden" }}>
        <style>{globalCSS}</style>
        {/* Animated background orbs */}
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(15,118,110,0.15), transparent 70%)", top: "-10%", left: "-5%", animation: "pulse 4s infinite" }} />
        <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.1), transparent 70%)", bottom: "-5%", right: "-5%", animation: "pulse 5s infinite 1s" }} />
        <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(245,158,11,0.08), transparent 70%)", top: "40%", right: "20%", animation: "pulse 6s infinite 2s" }} />

        <div style={{
          background: "rgba(255,255,255,0.03)", backdropFilter: "blur(40px)",
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "52px 40px",
          width: "100%", maxWidth: 420, position: "relative", zIndex: 1,
          animation: mounted ? "fadeUp 0.6s ease-out" : "none",
          boxShadow: "0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20, margin: "0 auto 18px",
              background: "linear-gradient(135deg, #0f766e, #14b8a6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 32px rgba(15,118,110,0.3)",
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <h1 style={{ color: "#f1f5f9", fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px" }}>RT Advance Tracker</h1>
            <p style={{ color: "#64748b", fontSize: 13, marginTop: 6, fontWeight: 400 }}>Radiotherapy Patient Advance Management System</p>
          </div>

          <div style={{ marginBottom: 16, animation: loginShake ? "shake 0.4s" : "none" }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: "1px" }}>Username</label>
            <input type="text" value={loginUser} onChange={e => setLoginUser(e.target.value)}
              onKeyDown={e => e.key === "Enter" && doLogin()}
              placeholder="Enter your username"
              style={{
                width: "100%", padding: "14px 18px", background: "rgba(255,255,255,0.05)",
                border: `1.5px solid ${loginErr ? "#ef4444" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 12, fontSize: 14, color: "#f1f5f9", outline: "none",
                transition: "all 0.2s", boxSizing: "border-box",
              }}
              onFocus={e => e.target.style.borderColor = "#14b8a6"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: "1px" }}>Password</label>
            <input type="password" value={pw} onChange={e => setPw(e.target.value)}
              onKeyDown={e => e.key === "Enter" && doLogin()}
              placeholder="Enter your password"
              style={{
                width: "100%", padding: "14px 18px", background: "rgba(255,255,255,0.05)",
                border: `1.5px solid ${loginErr ? "#ef4444" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 12, fontSize: 14, color: "#f1f5f9", outline: "none",
                transition: "all 0.2s", boxSizing: "border-box",
              }}
              onFocus={e => e.target.style.borderColor = "#14b8a6"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
            {loginErr && <p style={{ color: "#f87171", fontSize: 12, marginTop: 8, fontWeight: 500 }}>{loginErr}</p>}
          </div>

          <button onClick={doLogin} disabled={loginLoading} className="btn-press" style={{
            width: "100%", padding: 15, border: "none", borderRadius: 12, cursor: loginLoading ? "wait" : "pointer",
            background: "linear-gradient(135deg, #0f766e, #14b8a6)", color: "#fff",
            fontSize: 15, fontWeight: 700, letterSpacing: "0.3px", fontFamily: "'Outfit', sans-serif",
            boxShadow: "0 4px 16px rgba(15,118,110,0.3)", opacity: loginLoading ? 0.7 : 1,
          }}>
            {loginLoading ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // APP SHELL
  // ═══════════════════════════════════════════════════════
  const navItems = [
    { k: "dashboard", icon: "◉", label: "Dashboard" },
    { k: "table", icon: "☰", label: "Records" },
    { k: "add", icon: "+", label: "Add Record" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafb", fontFamily: "'DM Sans', sans-serif", color: "#1e293b", display: "flex" }}>
      <style>{globalCSS}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, padding: "14px 24px", borderRadius: 14, background: toast.type === "error" ? "#ef4444" : "#0f766e", color: "#fff", fontWeight: 600, fontSize: 13, boxShadow: "0 12px 32px rgba(0,0,0,0.15)", animation: "toastIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)", fontFamily: "'Outfit', sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>{toast.type === "error" ? "✕" : "✓"}</span> {toast.msg}
        </div>
      )}

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 220 : 64, minHeight: "100vh", background: "#0f172a",
        borderRight: "1px solid rgba(255,255,255,0.06)", padding: "20px 0",
        display: "flex", flexDirection: "column", transition: "width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        position: "sticky", top: 0, flexShrink: 0, overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{ padding: "0 16px", marginBottom: 32, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setSidebarOpen(p => !p)}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #0f766e, #14b8a6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          {sidebarOpen && <span style={{ fontSize: 14, fontWeight: 800, color: "#f1f5f9", fontFamily: "'Outfit', sans-serif", whiteSpace: "nowrap", letterSpacing: "-0.3px" }}>RT Tracker</span>}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "0 8px" }}>
          {navItems.map(n => {
            const active = view === n.k;
            return (
              <button key={n.k} className="btn-press"
                onClick={() => { setView(n.k); if (n.k === "add") { setForm({...empty}); setFormErrors({}); } }}
                style={{
                  width: "100%", padding: sidebarOpen ? "10px 14px" : "10px 0", border: "none", borderRadius: 10, cursor: "pointer",
                  background: active ? "rgba(15,118,110,0.15)" : "transparent",
                  color: active ? "#14b8a6" : "#64748b", display: "flex", alignItems: "center",
                  gap: 10, fontSize: 13, fontWeight: active ? 700 : 500, marginBottom: 4,
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                  fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
                }}>
                <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{n.icon}</span>
                {sidebarOpen && <span style={{ whiteSpace: "nowrap" }}>{n.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User section */}
        <div style={{ padding: "0 8px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
          {sidebarOpen && (
            <div style={{ padding: "8px 10px", marginBottom: 6 }}>
              <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", background: role === "admin" ? "rgba(239,68,68,0.12)" : "rgba(15,118,110,0.12)", color: role === "admin" ? "#f87171" : "#14b8a6" }}>
                {role}
              </span>
            </div>
          )}
          <button className="btn-press" onClick={() => { setRole(null); setView("dashboard"); setPw(""); setLoginUser(""); setUserName(""); setRecords([]); }}
            style={{ width: "100%", padding: "8px 14px", border: "none", borderRadius: 8, cursor: "pointer", background: "rgba(255,255,255,0.04)", color: "#64748b", display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 500, justifyContent: sidebarOpen ? "flex-start" : "center", fontFamily: "'DM Sans', sans-serif" }}>
            <span>⏻</span>{sidebarOpen && "Logout"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: 28, overflow: "auto", minHeight: "100vh" }}>

        {/* ═══ DASHBOARD ═══ */}
        {view === "dashboard" && (
          <div style={{ animation: "fadeUp 0.4s ease-out" }}>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.5px", color: "#0f172a" }}>Dashboard</h1>
              <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Radiotherapy patient advance overview</p>
            </div>

            {loading && <div style={{ textAlign: "center", padding: 40, color: "#64748b", fontSize: 14 }}>Loading records...</div>}

            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
              {[
                { label: "Total Advances", count: stats.total, amt: stats.tA, color: "#0f766e", bg: "linear-gradient(135deg, #f0fdfa, #ccfbf1)", border: "#99f6e4", icon: "₹" },
                { label: "Open / Pending", count: stats.open, amt: stats.oA, color: "#d97706", bg: "linear-gradient(135deg, #fffbeb, #fef3c7)", border: "#fde68a", icon: "◔" },
                { label: "Closed / Settled", count: stats.closed, amt: stats.cA, color: "#059669", bg: "linear-gradient(135deg, #ecfdf5, #d1fae5)", border: "#a7f3d0", icon: "✓" },
              ].map((s, i) => (
                <div key={s.label} className="hover-lift" style={{
                  background: s.bg, borderRadius: 16, padding: 22, border: `1px solid ${s.border}`,
                  animation: `fadeUp 0.4s ease-out ${i * 0.1}s both`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px" }}>{s.label}</p>
                      <div style={{ fontSize: 36, fontWeight: 900, color: s.color, marginTop: 6, fontFamily: "'Outfit', sans-serif", letterSpacing: "-1px" }}>{s.count}</div>
                    </div>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: s.color, fontWeight: 800 }}>{s.icon}</div>
                  </div>
                  <div style={{ marginTop: 12, padding: "6px 12px", background: "rgba(255,255,255,0.7)", borderRadius: 8, fontSize: 14, fontWeight: 800, color: s.color, display: "inline-block", fontFamily: "'Outfit', sans-serif" }}>
                    {fmt(s.amt)}
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              {/* Donut + Legend */}
              <div className="hover-lift" style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e2e8f0", animation: "fadeUp 0.4s ease-out 0.3s both" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 18, fontFamily: "'Outfit', sans-serif" }}>Bill Status</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
                  <DonutChart open={stats.open} closed={stats.closed} />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
                      <span style={{ fontSize: 12, color: "#64748b" }}>Open</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: "#d97706", marginLeft: "auto" }}>{stats.open}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981" }} />
                      <span style={{ fontSize: 12, color: "#64748b" }}>Closed</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: "#059669", marginLeft: "auto" }}>{stats.closed}</span>
                    </div>
                    <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
                      <Sparkline data={stats.amountTrend} color="#0f766e" />
                      <span style={{ fontSize: 9, color: "#94a3b8", marginTop: 2, display: "block" }}>Amount trend</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Mode Chart */}
              <div className="hover-lift" style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e2e8f0", animation: "fadeUp 0.4s ease-out 0.4s both" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 18, fontFamily: "'Outfit', sans-serif" }}>By Payment Mode</h3>
                <MiniBarChart data={Object.entries(stats.byMode).map(([m, d]) => ({ label: m, value: d.amount, color: MODE_COLORS[m] || "#94a3b8" }))} />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="hover-lift" style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e2e8f0", animation: "fadeUp 0.4s ease-out 0.5s both" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#334155", fontFamily: "'Outfit', sans-serif" }}>Recent Activity</h3>
                <button className="btn-press" onClick={() => setView("table")} style={{ border: "none", background: "#f0fdfa", color: "#0f766e", padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  View All →
                </button>
              </div>
              {stats.recent.map((rec, i) => (
                <div key={rec.id} style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: i < stats.recent.length - 1 ? "1px solid #f1f5f9" : "none", gap: 12, animation: `fadeUp 0.3s ease-out ${0.5 + i * 0.05}s both` }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: rec.fields.billClosed ? "#d1fae5" : "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                    {rec.fields.billClosed ? "✓" : "◔"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{rec.fields.name}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{rec.fields.regNo} • {fmtDate(rec.fields.receiptDate)}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#0f766e", fontFamily: "'Outfit', sans-serif" }}>{fmt(rec.fields.amount)}</div>
                    <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: `${MODE_COLORS[rec.fields.mode] || "#94a3b8"}15`, color: MODE_COLORS[rec.fields.mode] || "#94a3b8", fontWeight: 600 }}>{rec.fields.mode}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ TABLE VIEW ═══ */}
        {view === "table" && (
          <div style={{ animation: "fadeUp 0.4s ease-out" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.5px", color: "#0f172a" }}>Records</h1>
                <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{records.length} total advance records</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-press" onClick={fetchRecords} disabled={loading} style={{ border: "1px solid #e2e8f0", background: "#fff", color: "#475569", padding: "9px 16px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                  {loading ? "Refreshing..." : "↻ Refresh"}
                </button>
                <button className="btn-press" onClick={exportCSV} style={{ border: "1px solid #e2e8f0", background: "#fff", color: "#475569", padding: "9px 16px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export CSV
                </button>
                <button className="btn-press" onClick={() => { setView("add"); setForm({...empty}); setFormErrors({}); }} style={{ border: "none", background: "linear-gradient(135deg, #0f766e, #14b8a6)", color: "#fff", padding: "9px 18px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 12px rgba(15,118,110,0.25)" }}>
                  + New Record
                </button>
              </div>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ position: "relative", flex: "1 1 240px", maxWidth: 300 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" placeholder="Search patients, reg no, IP..." value={search} onChange={e => setSearch(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px 10px 36px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 13, background: "#fff", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" }} />
              </div>
              <select value={filterMode} onChange={e => setFilterMode(e.target.value)}
                style={{ padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 12, background: "#fff", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                <option value="All">All Modes</option>
                {MODES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                style={{ padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 12, background: "#fff", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                <option value="All">All Status</option>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
              {(search || filterMode !== "All" || filterStatus !== "All") && (
                <button className="btn-press" onClick={() => { setSearch(""); setFilterMode("All"); setFilterStatus("All"); }}
                  style={{ border: "none", background: "#fef2f2", color: "#ef4444", padding: "8px 14px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  ✕ Clear
                </button>
              )}
            </div>

            {/* Table */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                      {[
                        { k: "regNo", l: "Reg No." }, { k: "opDate", l: "OP Date" }, { k: "ipNo", l: "IP No." },
                        { k: "name", l: "Patient Name" }, { k: "amount", l: "Amount" }, { k: "mode", l: "Mode" },
                        { k: "txnNo", l: "Txn No." }, { k: "receiptDate", l: "Receipt Date" }, { k: "billClosed", l: "Status" },
                      ].map(c => (
                        <th key={c.k} onClick={() => toggleSort(c.k)} style={{ padding: "12px 14px", textAlign: "left", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.8px", color: sortField === c.k ? "#0f766e" : "#94a3b8", cursor: "pointer", whiteSpace: "nowrap", userSelect: "none", transition: "color 0.15s", fontFamily: "'Outfit', sans-serif" }}>
                          {c.l} {sortField === c.k ? (sortDir === "asc" ? "↑" : "↓") : ""}
                        </th>
                      ))}
                      <th style={{ padding: "12px 14px", textAlign: "center", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.8px", color: "#94a3b8", fontFamily: "'Outfit', sans-serif" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={10} style={{ textAlign: "center", padding: 48, color: "#94a3b8" }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>∅</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>No records found</div>
                        <div style={{ fontSize: 12, marginTop: 4 }}>Try adjusting your filters</div>
                      </td></tr>
                    ) : filtered.map((rec, idx) => {
                      const f = rec.fields, isOpen = !f.billClosed;
                      return (
                        <tr key={rec.id} className="hover-row" style={{ borderBottom: "1px solid #f1f5f9", animation: `fadeUp 0.3s ease-out ${idx * 0.03}s both` }}>
                          <td style={{ padding: "12px 14px" }}>
                            <span style={{ fontWeight: 700, color: "#0f766e", fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>{f.regNo}</span>
                          </td>
                          <td style={{ padding: "12px 14px", color: "#64748b" }}>{fmtDate(f.opDate)}</td>
                          <td style={{ padding: "12px 14px", fontWeight: 500 }}>{f.ipNo}</td>
                          <td style={{ padding: "12px 14px", fontWeight: 600, color: "#1e293b" }}>{f.name}</td>
                          <td style={{ padding: "12px 14px", fontWeight: 800, color: "#0f766e", fontFamily: "'Outfit', sans-serif", fontSize: 13 }}>{fmt(f.amount)}</td>
                          <td style={{ padding: "12px 14px" }}>
                            <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: `${MODE_COLORS[f.mode] || "#94a3b8"}12`, color: MODE_COLORS[f.mode] || "#94a3b8", letterSpacing: "0.3px" }}>{f.mode}</span>
                          </td>
                          <td style={{ padding: "12px 14px", fontWeight: 500, color: "#475569", fontSize: 11 }}>{f.txnNo || "—"}</td>
                          <td style={{ padding: "12px 14px", color: "#64748b" }}>{fmtDate(f.receiptDate)}</td>
                          <td style={{ padding: "12px 14px" }}>
                            {isOpen ? (
                              <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: "#fef3c7", color: "#92400e", letterSpacing: "0.3px" }}>● Open</span>
                            ) : (
                              <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: "#d1fae5", color: "#065f46", letterSpacing: "0.3px" }}>✓ {fmtDate(f.billClosed)}</span>
                            )}
                          </td>
                          <td style={{ padding: "10px 14px", textAlign: "center" }}>
                            <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                              <button className="btn-press" onClick={() => printReceipt(rec)} title="Print Receipt"
                                style={{ border: "none", padding: "6px 10px", borderRadius: 8, background: "#f1f5f9", color: "#475569", cursor: "pointer", fontSize: 10, fontWeight: 600, fontFamily: "'DM Sans'" }}>🖨</button>
                              {isOpen && (
                                <button className="btn-press" onClick={() => { setBillCloseRec(rec); setBillCloseDate(new Date().toISOString().split("T")[0]); }} title="Close Bill"
                                  style={{ border: "none", padding: "6px 10px", borderRadius: 8, background: "#ecfdf5", color: "#059669", cursor: "pointer", fontSize: 10, fontWeight: 600, fontFamily: "'DM Sans'" }}>Close</button>
                              )}
                              {role === "admin" && (
                                <button className="btn-press" onClick={() => setEditRec({ ...rec, fields: { ...rec.fields } })} title="Edit"
                                  style={{ border: "none", padding: "6px 10px", borderRadius: 8, background: "#eef2ff", color: "#4f46e5", cursor: "pointer", fontSize: 10, fontWeight: 600, fontFamily: "'DM Sans'" }}>Edit</button>
                              )}
                              {role === "admin" && (
                                <button className="btn-press" onClick={() => setDeleteId(rec.id)} title="Delete"
                                  style={{ border: "none", padding: "6px 10px", borderRadius: 8, background: "#fef2f2", color: "#ef4444", cursor: "pointer", fontSize: 10, fontWeight: 600, fontFamily: "'DM Sans'" }}>Del</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: "12px 18px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "#64748b", background: "#f8fafc" }}>
                <span>{filtered.length} of {records.length} records</span>
                <span style={{ fontWeight: 800, color: "#0f766e", fontFamily: "'Outfit', sans-serif", fontSize: 14 }}>
                  Total: {fmt(filtered.reduce((s, r) => s + (parseFloat(r.fields.amount) || 0), 0))}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ═══ ADD RECORD ═══ */}
        {view === "add" && (
          <div style={{ animation: "fadeUp 0.4s ease-out", maxWidth: 680, margin: "0 auto" }}>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.5px", color: "#0f172a" }}>New Record</h1>
              <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Add a new radiotherapy advance payment</p>
            </div>
            <div style={{ background: "#fff", borderRadius: 16, padding: 32, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                {[
                  { k: "regNo", l: "Registration Number", t: "text", ph: "e.g. RT-2609", req: true },
                  { k: "opDate", l: "OP Visit Date", t: "date", req: true },
                  { k: "ipNo", l: "IP Number", t: "text", ph: "e.g. IP-1209", req: false },
                  { k: "name", l: "Patient Name", t: "text", ph: "Full name", req: true },
                  { k: "amount", l: "Amount (₹)", t: "number", ph: "e.g. 15000", req: true },
                  { k: "mode", l: "Payment Mode", t: "select", req: true },
                  { k: "txnNo", l: "Transaction Number", t: "text", ph: "e.g. TXN123456", req: form.mode !== "Cash" },
                  { k: "receiptDate", l: "Date of Receipt", t: "date", req: true },
                ].map(f => (
                  <div key={f.k}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#334155", marginBottom: 6, letterSpacing: "0.3px" }}>
                      {f.l} {f.req ? <span style={{ color: "#ef4444" }}>*</span> : <span style={{ color: "#94a3b8", fontSize: 10, fontWeight: 400 }}>(optional)</span>}
                    </label>
                    {f.t === "select" ? (
                      <select value={form[f.k]} onChange={e => { const v = e.target.value; setForm(p => ({ ...p, [f.k]: v, ...(f.k === "mode" && v === "Cash" ? { txnNo: "" } : {}) })); }}
                        style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${formErrors[f.k] ? "#ef4444" : "#e2e8f0"}`, borderRadius: 10, fontSize: 13, background: "#f8fafc", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" }}>
                        {MODES.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    ) : (
                      <input type={f.t} value={form[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.value })}
                        placeholder={f.ph} step={f.t === "number" ? "1" : undefined}
                        disabled={f.k === "txnNo" && form.mode === "Cash"}
                        style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${formErrors[f.k] ? "#ef4444" : "#e2e8f0"}`, borderRadius: 10, fontSize: 13, background: f.k === "txnNo" && form.mode === "Cash" ? "#f1f5f9" : "#f8fafc", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" }} />
                    )}
                    {formErrors[f.k] && <p style={{ color: "#ef4444", fontSize: 10, marginTop: 4, fontWeight: 500 }}>{f.k === "txnNo" ? "Transaction number required for non-Cash payments" : "This field is required"}</p>}
                  </div>
                ))}
              </div>
              {role === "admin" && (
                <div style={{ marginTop: 18 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                    Bill Closed Date <span style={{ color: "#94a3b8", fontSize: 10, fontWeight: 400 }}>(Admin only, optional)</span>
                  </label>
                  <input type="date" value={form.billClosed} onChange={e => setForm({ ...form, billClosed: e.target.value })}
                    style={{ width: "100%", maxWidth: 300, padding: "11px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 13, background: "#f8fafc", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" }} />
                </div>
              )}
              <div style={{ marginTop: 28, display: "flex", gap: 10 }}>
                <button className="btn-press" onClick={handleAdd} style={{ border: "none", padding: "12px 28px", borderRadius: 10, background: "linear-gradient(135deg, #0f766e, #14b8a6)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", boxShadow: "0 4px 12px rgba(15,118,110,0.25)" }}>
                  Save Record
                </button>
                <button className="btn-press" onClick={() => setView("table")} style={{ border: "1px solid #e2e8f0", padding: "12px 22px", borderRadius: 10, background: "#fff", color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ═══════ MODALS ═══════ */}

      {/* Bill Close */}
      {billCloseRec && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20, animation: "fadeIn 0.2s" }}
          onClick={() => setBillCloseRec(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: 30, maxWidth: 420, width: "100%", boxShadow: "0 24px 48px rgba(0,0,0,0.12)", animation: "fadeUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#059669" }}>✓</div>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>Close Bill</h3>
                <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>{billCloseRec.fields.name} • {billCloseRec.fields.regNo}</p>
              </div>
            </div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#334155", marginBottom: 6, letterSpacing: "0.3px" }}>Bill Closed Date</label>
            <input type="date" value={billCloseDate} onChange={e => setBillCloseDate(e.target.value)}
              style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 13, background: "#f8fafc", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" }} />
            <div style={{ marginTop: 22, display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn-press" onClick={() => setBillCloseRec(null)} style={{ border: "1px solid #e2e8f0", padding: "9px 18px", borderRadius: 10, background: "#fff", color: "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
              <button className="btn-press" onClick={handleBillClose} disabled={!billCloseDate}
                style={{ border: "none", padding: "9px 18px", borderRadius: 10, background: "#059669", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", opacity: billCloseDate ? 1 : 0.4, fontFamily: "'Outfit', sans-serif" }}>Confirm Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editRec && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20, animation: "fadeIn 0.2s" }}
          onClick={() => setEditRec(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: 30, maxWidth: 580, width: "100%", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 24px 48px rgba(0,0,0,0.12)", animation: "fadeUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#4f46e5" }}>✎</div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>Edit Record</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                { k: "regNo", l: "Reg No.", t: "text" }, { k: "opDate", l: "OP Visit Date", t: "date" },
                { k: "ipNo", l: "IP Number", t: "text" }, { k: "name", l: "Patient Name", t: "text" },
                { k: "amount", l: "Amount (₹)", t: "number" }, { k: "mode", l: "Mode", t: "select" },
                { k: "txnNo", l: "Transaction No.", t: "text" }, { k: "receiptDate", l: "Receipt Date", t: "date" },
                { k: "billClosed", l: "Bill Closed", t: "date" },
              ].map(f => (
                <div key={f.k}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#94a3b8", marginBottom: 4, letterSpacing: "0.5px", textTransform: "uppercase" }}>{f.l}</label>
                  {f.t === "select" ? (
                    <select value={editRec.fields[f.k] || ""} onChange={e => setEditRec({ ...editRec, fields: { ...editRec.fields, [f.k]: e.target.value } })}
                      style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 13, background: "#f8fafc", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" }}>
                      {MODES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  ) : (
                    <input type={f.t} value={editRec.fields[f.k] || ""} onChange={e => setEditRec({ ...editRec, fields: { ...editRec.fields, [f.k]: e.target.value } })}
                      step={f.t === "number" ? "1" : undefined}
                      style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 13, background: "#f8fafc", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" }} />
                  )}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 22, display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn-press" onClick={() => setEditRec(null)} style={{ border: "1px solid #e2e8f0", padding: "9px 18px", borderRadius: 10, background: "#fff", color: "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
              <button className="btn-press" onClick={handleSaveEdit} style={{ border: "none", padding: "9px 18px", borderRadius: 10, background: "#4f46e5", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20, animation: "fadeIn 0.2s" }}
          onClick={() => setDeleteId(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: 30, maxWidth: 380, width: "100%", boxShadow: "0 24px 48px rgba(0,0,0,0.12)", animation: "fadeUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#ef4444" }}>✕</div>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, fontFamily: "'Outfit', sans-serif", color: "#ef4444" }}>Delete Record</h3>
                <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>This cannot be undone</p>
              </div>
            </div>
            <div style={{ marginTop: 8, display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn-press" onClick={() => setDeleteId(null)} style={{ border: "1px solid #e2e8f0", padding: "9px 18px", borderRadius: 10, background: "#fff", color: "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
              <button className="btn-press" onClick={handleDelete} style={{ border: "none", padding: "9px 18px", borderRadius: 10, background: "#ef4444", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import logoImg from "./assets/logo.png";

/** * CONFIGURATION & THEME
 * ปรับโทนสีให้ดู Luxury: Navy, Emerald, Rose และ Gray Scale
 */
const INCOME_CATS = ["เงินเดือน", "ธุรกิจ", "ฟรีแลนซ์", "ลงทุน", "โบนัส", "อื่นๆ"];
const EXPENSE_CATS = ["อาหาร", "เดินทาง", "ช้อปปิ้ง", "บันเทิง", "สุขภาพ", "บ้าน", "ออมทรัพย์", "อื่นๆ"];

const CAT_ICONS = {
  เงินเดือน: "💼", ธุรกิจ: "🏪", ฟรีแลนซ์: "💻", ลงทุน: "📈", โบนัส: "🎁", "อื่นๆ": "📦",
  อาหาร: "🍜", เดินทาง: "🚗", ช้อปปิ้ง: "🛍️", บันเทิง: "🎬", สุขภาพ: "💊", บ้าน: "🏠", ออมทรัพย์: "🐷",
};

const COLORS = {
  inc: "#10b981",    // Emerald 500
  exp: "#f43f5e",    // Rose 500
  primary: "#111827", // Black Pearl
  bg: "#f8fafc",     // Slate 50
  surface: "#ffffff",
  textMain: "#1e293b",
  textSub: "#64748b",
  border: "#f1f5f9"
};

const CHART_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f97316", "#f59e0b", "#10b981", "#06b6d4"];

/**
 * HELPERS
 */
const fmt = (n) => new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(Math.abs(n));
const fmtFull = (n) => `${n < 0 ? "-" : ""}฿${fmt(n)}`;
const getMonth = (d) => d.slice(0, 7);
const today = () => new Date().toISOString().split("T")[0];

const monthLabel = (m) => {
  const [y, mo] = m.split("-");
  const thMonth = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค. " , "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  return `${thMonth[parseInt(mo) - 1]} ${parseInt(y) + 543}`;
};

/**
 * STYLES SYSTEM
 */
const styles = {
  app: {
    fontFamily: "'Inter', 'IBM Plex Sans Thai', sans-serif",
    backgroundColor: COLORS.bg,
    minHeight: "100vh",
    color: COLORS.textMain,
    WebkitFontSmoothing: "antialiased",
  },
  container: {
    maxWidth: 500,
    margin: "0 auto",
    padding: "24px 20px 120px", // เผื่อระยะด้านล่าง
  },
  card: {
    background: COLORS.surface,
    borderRadius: 24,
    padding: "24px",
    marginBottom: "16px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
    border: `1px solid rgba(0,0,0,0.01)`,
  },
  navBtn: (active) => ({
    flex: 1,
    padding: "14px",
    border: "none",
    borderRadius: 16,
    background: active ? "#fff" : "transparent",
    color: active ? COLORS.primary : COLORS.textSub,
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: active ? "0 4px 12px rgba(0,0,0,0.08)" : "none",
  }),
  input: {
    width: "100%",
    padding: "16px",
    borderRadius: 16,
    border: `1.5px solid ${COLORS.border}`,
    fontSize: "16px",
    boxSizing: "border-box",
    backgroundColor: "#fcfcfd",
    outline: "none",
    transition: "all 0.2s",
  },
};

/**
 * UI COMPONENTS
 */
function StatCard({ label, value, color, isMain }) {
  return (
    <div style={{ 
      ...styles.card, 
      flex: 1, 
      padding: isMain ? '32px 24px' : '20px', 
      background: isMain ? COLORS.primary : COLORS.surface,
      marginBottom: isMain ? '20px' : '0'
    }}>
      <div style={{ fontSize: "12px", color: isMain ? "rgba(255,255,255,0.6)" : COLORS.textSub, marginBottom: "8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {label}
      </div>
      <div style={{ fontSize: isMain ? "36px" : "22px", fontWeight: 800, color: isMain ? "#fff" : color, letterSpacing: "-1px" }}>
        {fmtFull(value)}
      </div>
    </div>
  );
}

function TxRow({ tx, onDelete }) {
  const isInc = tx.type === "income";
  return (
    <div style={{ ...styles.card, display: "flex", alignItems: "center", gap: "16px", padding: "16px", marginBottom: "12px" }}>
      <div style={{ width: "48px", height: "48px", borderRadius: "16px", background: isInc ? "#ecfdf5" : "#fff1f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
        {CAT_ICONS[tx.category] || "📦"}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "15px", fontWeight: 700 }}>{tx.category}</div>
        <div style={{ fontSize: "12px", color: COLORS.textSub, marginTop: "2px" }}>{tx.date}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: "16px", fontWeight: 800, color: isInc ? COLORS.inc : COLORS.primary }}>
          {isInc ? "+" : "-"}{fmt(tx.amount)}
        </div>
        <button onClick={() => onDelete(tx.id)} style={{ background: "none", border: "none", color: COLORS.exp, fontSize: "12px", cursor: "pointer", fontWeight: 600, padding: "4px 0" }}>ลบออก</button>
      </div>
    </div>
  );
}

function AddForm({ onAdd, onClose }) {
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATS[0]);
  const [date, setDate] = useState(today());
  const accent = type === "income" ? COLORS.inc : COLORS.primary;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.5)", display: "flex", alignItems: "flex-end", zIndex: 1000, backdropFilter: "blur(8px)" }}>
      <div style={{ background: "#fff", borderRadius: "32px 32px 0 0", padding: "32px 24px", width: "100%", animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}>
        <div style={{ width: "40px", height: "4px", background: COLORS.border, borderRadius: "2px", margin: "0 auto 24px" }} />
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800 }}>บันทึกรายการใหม่</h2>
          <button onClick={onClose} style={{ border: "none", background: "rgba(0,0,0,0.04)", width: "32px", height: "32px", borderRadius: "16px", fontSize: "14px", cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", background: "#f1f5f9", padding: "6px", borderRadius: "18px" }}>
          <button onClick={() => { setType("income"); setCategory(INCOME_CATS[0]); }} style={{ ...styles.navBtn(type === "income"), color: type === "income" ? COLORS.inc : COLORS.textSub }}>รายรับ</button>
          <button onClick={() => { setType("expense"); setCategory(EXPENSE_CATS[0]); }} style={{ ...styles.navBtn(type === "expense"), color: type === "expense" ? COLORS.primary : COLORS.textSub }}>รายจ่าย</button>
        </div>

        <div style={{ position: "relative", marginBottom: "20px" }}>
          <span style={{ position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)", fontSize: "24px", fontWeight: 800, color: accent }}>฿</span>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" style={{ ...styles.input, fontSize: "36px", fontWeight: 800, paddingLeft: "50px", height: "85px", color: accent }} />
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: COLORS.textSub }}>หมวดหมู่</div>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={styles.input}>
              {(type === "income" ? INCOME_CATS : EXPENSE_CATS).map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: COLORS.textSub }}>วันที่</div>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={styles.input} />
          </div>
        </div>

        <button 
          onClick={() => { if (amount > 0) onAdd({ id: Date.now().toString(), type, amount: parseFloat(amount), category, date }); }} 
          style={{ ...styles.input, background: accent, color: "#fff", border: "none", fontWeight: 800, fontSize: "18px", height: "60px", boxShadow: `0 10px 15px -3px ${accent}4D` }}
        >
          บันทึกข้อมูล
        </button>
      </div>
    </div>
  );
}

/**
 * MAIN APP
 */
export default function App() {
  const [txs, setTxs] = useState([]);
  const [tab, setTab] = useState("dashboard");
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => today().slice(0, 7));

  useEffect(() => {
    const saved = localStorage.getItem("expense-tracker-txs");
    if (saved) setTxs(JSON.parse(saved));
  }, []);

  const onAdd = (tx) => {
    const next = [tx, ...txs];
    setTxs(next);
    localStorage.setItem("expense-tracker-txs", JSON.stringify(next));
    setShowForm(false);
  };

  const onDelete = (id) => {
    const next = txs.filter((t) => t.id !== id);
    setTxs(next);
    localStorage.setItem("expense-tracker-txs", JSON.stringify(next));
  };

  // Calculations
  const monthTxs = txs.filter((t) => getMonth(t.date) === selectedMonth);
  const income = monthTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = monthTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const expCatData = EXPENSE_CATS.map((cat) => ({
    name: cat,
    value: monthTxs.filter((t) => t.type === "expense" && t.category === cat).reduce((s, t) => s + t.amount, 0),
  })).filter((d) => d.value > 0).sort((a, b) => b.value - a.value);

  // 6-Month Data for Stats
  const historyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const m = getMonth(d.toISOString());
    return {
      name: monthLabel(m),
      รายรับ: txs.filter((t) => getMonth(t.date) === m && t.type === "income").reduce((s, t) => s + t.amount, 0),
      รายจ่าย: txs.filter((t) => getMonth(t.date) === m && t.type === "expense").reduce((s, t) => s + t.amount, 0),
    };
  });

  return (
    <div style={styles.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=IBM+Plex+Sans+Thai:wght@400;600;700&display=swap');
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        body { margin: 0; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={styles.container}>
        
        {/* TOP HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <img src={logoImg} alt="logo" style={{ height: "44px", width: "auto" }} />
            <div>
              <div style={{ fontSize: "12px", color: COLORS.textSub, fontWeight: 600 }}>{monthLabel(selectedMonth)}</div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, letterSpacing: "-0.5px", color: "#000000" }}>Expense Tracker</h1>            </div>
          </div>
          <button onClick={() => setShowForm(true)} style={{ background: COLORS.primary, color: "#fff", border: "none", borderRadius: "14px", padding: "10px 20px", fontWeight: 700, fontSize: "14px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>+ เพิ่มรายการ</button>
        </div>

        {/* NAVIGATION TAB */}
        <div style={{ display: "flex", gap: "6px", background: "#f1f5f9", padding: "6px", borderRadius: "20px", marginBottom: "24px" }}>
          {["dashboard", "transactions", "stats"].map((t) => (
            <button key={t} onClick={() => setTab(t)} style={styles.navBtn(tab === t)}>
              {t === "dashboard" ? "ภาพรวม" : t === "transactions" ? "รายการ" : "สถิติ"}
            </button>
          ))}
        </div>

        {/* --- TAB: DASHBOARD --- */}
        {tab === "dashboard" && (
          <div>
            <StatCard label="ยอดเงินคงเหลือ" value={income - expense} isMain={true} />
            <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
              <StatCard label="รายรับ" value={income} color={COLORS.inc} />
              <StatCard label="รายจ่าย" value={expense} color={COLORS.exp} />
            </div>
            
            {expCatData.length > 0 && (
              <div style={styles.card}>
                <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "20px" }}>สัดส่วนการใช้จ่าย</div>
                <div style={{ height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={expCatData} dataKey="value" innerRadius={55} outerRadius={75} paddingAngle={6}>
                        {expCatData.map((_, i) => (<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ fontWeight: 800, fontSize: "18px" }}>รายการล่าสุด</div>
              <button onClick={() => setTab("transactions")} style={{ background: "none", border: "none", color: COLORS.textSub, fontSize: "13px", fontWeight: 600 }}>ดูทั้งหมด</button>
            </div>
            {monthTxs.slice(0, 5).map((tx) => (<TxRow key={tx.id} tx={tx} onDelete={onDelete} />))}
          </div>
        )}

        {/* --- TAB: TRANSACTIONS --- */}
        {tab === "transactions" && (
          <div>
            <div style={{ fontWeight: 800, fontSize: "20px", marginBottom: "20px" }}>ประวัติรายการทั้งหมด</div>
            {monthTxs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: COLORS.textSub }}>
                <div style={{ fontSize: "40px", marginBottom: "16px" }}>☁️</div>
                <div style={{ fontWeight: 600 }}>ยังไม่มีข้อมูลในเดือนนี้</div>
              </div>
            ) : (
              monthTxs.map((tx) => <TxRow key={tx.id} tx={tx} onDelete={onDelete} />)
            )}
          </div>
        )}

        {/* --- TAB: STATS --- */}
        {tab === "stats" && (
          <div>
            <div style={styles.card}>
              <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "24px" }}>แนวโน้ม 6 เดือนย้อนหลัง</div>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600 }} dy={10} />
                    <YAxis hide />
                    <Tooltip cursor={{ fill: "#f8fafc" }} />
                    <Bar dataKey="รายรับ" fill={COLORS.inc} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="รายจ่าย" fill={COLORS.exp} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={styles.card}>
              <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "16px" }}>สรุปตามหมวดหมู่</div>
              {expCatData.length === 0 ? (
                <div style={{ color: COLORS.textSub, fontSize: "14px", textAlign: "center", padding: "20px" }}>ไม่มีข้อมูลรายจ่าย</div>
              ) : (
                expCatData.map((d) => (
                  <div key={d.name} style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "18px" }}>{CAT_ICONS[d.name]}</span>
                      <span style={{ fontSize: "14px", fontWeight: 600 }}>{d.name}</span>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: "14px" }}>{fmtFull(d.value)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ADD FORM MODAL */}
        {showForm && <AddForm onAdd={onAdd} onClose={() => setShowForm(false)} />}
      </div>
    </div>
  );
}
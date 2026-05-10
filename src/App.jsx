import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

// --- Constants ---
const INCOME_CATS = ["เงินเดือน", "ธุรกิจ", "ฟรีแลนซ์", "ลงทุน", "โบนัส", "อื่นๆ"];
const EXPENSE_CATS = ["อาหาร", "เดินทาง", "ช้อปปิ้ง", "บันเทิง", "สุขภาพ", "บ้าน", "ออมทรัพย์", "อื่นๆ"];
const CAT_ICONS = {
  เงินเดือน: "💼", ธุรกิจ: "🏪", ฟรีแลนซ์: "💻", ลงทุน: "📈", โบนัส: "🎁", "อื่นๆ": "📦",
  อาหาร: "🍜", เดินทาง: "🚗", ช้อปปิ้ง: "🛍️", บันเทิง: "🎬", สุขภาพ: "💊", บ้าน: "🏠", ออมทรัพย์: "🐷",
};
const PIE_COLORS = ["#000000", "#374151", "#6B7280", "#9CA3AF", "#D1D5DB", "#E5E7EB"]; // Monochrome Luxury palette
const THEME = {
  primary: "#000000",
  secondary: "#6B7280",
  success: "#10B981", // Emerald
  danger: "#F43F5E",  // Rose
  bg: "#FFFFFF",
  surface: "#F9FAFB",
  border: "#F3F4F6",
};

// --- Helpers ---
const fmt = (n) => new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(Math.abs(n));
const fmtFull = (n) => `${n < 0 ? "-" : ""}฿${fmt(n)}`;
const getMonth = (d) => d.slice(0, 7);
const today = () => new Date().toISOString().split("T")[0];
const monthLabel = (m) => {
  const [y, mo] = m.split("-");
  const thMonth = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  return `${thMonth[parseInt(mo) - 1]} ${parseInt(y) + 543}`;
};

// --- Styled Components (Inline) ---
const styles = {
  app: { 
    fontFamily: "Inter, system-ui, sans-serif", 
    backgroundColor: THEME.bg, 
    minHeight: "100vh", 
    color: THEME.primary,
    paddingBottom: "100px" // Space for bottom nav
  },
  container: { maxWidth: "500px", margin: "0 auto", padding: "20px" },
  header: { padding: "20px 0", textAlign: "left" },
  card: {
    background: "#fff",
    borderRadius: "24px",
    padding: "24px",
    border: `1px solid ${THEME.border}`,
    marginBottom: "16px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01)"
  },
  fab: {
    position: "fixed",
    bottom: "100px",
    right: "24px",
    width: "56px",
    height: "56px",
    borderRadius: "28px",
    backgroundColor: THEME.primary,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    cursor: "pointer",
    zIndex: 90
  },
  bottomNav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: "80px",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(10px)",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    borderTop: `1px solid ${THEME.border}`,
    zIndex: 100
  },
  input: {
    width: "100%",
    padding: "16px",
    borderRadius: "12px",
    border: `1px solid ${THEME.border}`,
    fontSize: "16px",
    backgroundColor: THEME.surface,
    marginBottom: "12px",
    outline: "none"
  }
};

function TxRow({ tx, onDelete }) {
  const isInc = tx.type === "income";
  return (
    <div style={{ ...styles.card, padding: "16px", display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
      <div style={{ fontSize: "24px", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: THEME.surface, borderRadius: "16px" }}>
        {CAT_ICONS[tx.category]}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: "600", fontSize: "15px" }}>{tx.category}</div>
        <div style={{ color: THEME.secondary, fontSize: "12px" }}>{tx.note || 'ไม่มีคำอธิบาย'}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontWeight: "700", fontSize: "16px", color: isInc ? THEME.success : THEME.primary }}>
          {isInc ? "+" : "-"}{fmt(tx.amount)}
        </div>
        <button onClick={() => onDelete(tx.id)} style={{ background: "none", border: "none", color: THEME.danger, fontSize: "11px", cursor: "pointer", padding: "4px 0" }}>ลบออก</button>
      </div>
    </div>
  );
}

function AddForm({ onAdd, onClose }) {
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATS[0]);
  const [note, setNote] = useState("");
  const accent = type === "income" ? THEME.success : THEME.primary;

  const submit = () => {
    if (!amount || amount <= 0) return;
    onAdd({ id: Date.now().toString(), type, amount: parseFloat(amount), category, note, date: today() });
  };

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", alignItems: "flex-end" }} onClick={onClose}>
      <div style={{ backgroundColor: "#fff", width: "100%", borderRadius: "32px 32px 0 0", padding: "32px 24px", animation: "slideUp 0.3s ease-out" }} onClick={e => e.stopPropagation()}>
        <div style={{ width: "40px", height: "4px", backgroundColor: THEME.border, borderRadius: "2px", margin: "0 auto 24px" }} />
        <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "24px" }}>เพิ่มรายการใหม่</h2>
        
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", backgroundColor: THEME.surface, padding: "4px", borderRadius: "14px" }}>
          {["expense", "income"].map(t => (
            <button key={t} onClick={() => setType(t)} style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", backgroundColor: type === t ? "#fff" : "transparent", boxShadow: type === t ? "0 2px 4px rgba(0,0,0,0.05)" : "none", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>
              {t === "expense" ? "รายจ่าย" : "รายรับ"}
            </button>
          ))}
        </div>

        <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} style={{ ...styles.input, fontSize: "32px", fontWeight: "700", textAlign: "center", height: "80px" }} />
        
        <select value={category} onChange={e => setCategory(e.target.value)} style={styles.input}>
          {(type === "income" ? INCOME_CATS : EXPENSE_CATS).map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <input type="text" placeholder="บันทึกช่วยจำ..." value={note} onChange={e => setNote(e.target.value)} style={styles.input} />

        <button onClick={submit} style={{ width: "100%", padding: "18px", borderRadius: "16px", backgroundColor: THEME.primary, color: "#fff", border: "none", fontSize: "16px", fontWeight: "700", marginTop: "12px" }}>
          บันทึกรายการ
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [txs, setTxs] = useState([]);
  const [tab, setTab] = useState("dashboard");
  const [showForm, setShowForm] = useState(false);
  const selectedMonth = today().slice(0, 7);

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
    const next = txs.filter(t => t.id !== id);
    setTxs(next);
    localStorage.setItem("expense-tracker-txs", JSON.stringify(next));
  };

  const monthTxs = txs.filter(t => getMonth(t.date) === selectedMonth);
  const income = monthTxs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = monthTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  
  const expCatData = EXPENSE_CATS.map(cat => ({
    name: cat,
    value: monthTxs.filter(t => t.type === "expense" && t.category === cat).reduce((s, t) => s + t.amount, 0),
  })).filter(d => d.value > 0);

  return (
    <div style={styles.app}>
      <div style={styles.container}>
        {/* --- Header --- */}
        <header style={styles.header}>
          <div style={{ fontSize: "14px", color: THEME.secondary, fontWeight: "500" }}>{monthLabel(selectedMonth)}</div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", margin: "4px 0" }}>สวัสดีครับ 👋</h1>
        </header>

        {/* --- Dashboard Tab --- */}
        {tab === "dashboard" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={{ ...styles.card, backgroundColor: THEME.primary, color: "#fff", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontSize: "14px", opacity: 0.8 }}>ยอดคงเหลือปัจจุบัน</div>
              <div style={{ fontSize: "36px", fontWeight: "800" }}>{fmtFull(income - expense)}</div>
              <div style={{ display: "flex", gap: "20px", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                <div>
                  <div style={{ fontSize: "12px", opacity: 0.7 }}>รายรับ</div>
                  <div style={{ fontWeight: "600" }}>{fmtFull(income)}</div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", opacity: 0.7 }}>รายจ่าย</div>
                  <div style={{ fontWeight: "600" }}>{fmtFull(expense)}</div>
                </div>
              </div>
            </div>

            {expCatData.length > 0 && (
              <div style={styles.card}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "20px" }}>สถิติรายจ่าย</h3>
                <div style={{ height: "200px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={expCatData} dataKey="value" innerRadius={60} outerRadius={80} paddingAngle={5}>
                        {expCatData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <h3 style={{ fontSize: "18px", fontWeight: "700", margin: "24px 0 16px" }}>รายการล่าสุด</h3>
            {monthTxs.slice(0, 5).map(tx => <TxRow key={tx.id} tx={tx} onDelete={onDelete} />)}
          </div>
        )}

        {/* --- Transactions Tab --- */}
        {tab === "transactions" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>ประวัติรายการ</h3>
            {monthTxs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: THEME.secondary }}>ยังไม่มีรายการบันทึก</div>
            ) : (
              monthTxs.map(tx => <TxRow key={tx.id} tx={tx} onDelete={onDelete} />)
            )}
          </div>
        )}

        {/* --- Floating Action Button --- */}
        <div style={styles.fab} onClick={() => setShowForm(true)}>+</div>

        {/* --- Bottom Navigation --- */}
        <nav style={styles.bottomNav}>
          <div onClick={() => setTab("dashboard")} style={{ textAlign: "center", color: tab === "dashboard" ? THEME.primary : THEME.secondary, cursor: "pointer" }}>
            <div style={{ fontSize: "24px" }}>📊</div>
            <div style={{ fontSize: "10px", fontWeight: "600", marginTop: "4px" }}>หน้าแรก</div>
          </div>
          <div onClick={() => setTab("transactions")} style={{ textAlign: "center", color: tab === "transactions" ? THEME.primary : THEME.secondary, cursor: "pointer" }}>
            <div style={{ fontSize: "24px" }}>🧾</div>
            <div style={{ fontSize: "10px", fontWeight: "600", marginTop: "4px" }}>ประวัติ</div>
          </div>
        </nav>
      </div>

      {showForm && <AddForm onAdd={onAdd} onClose={() => setShowForm(false)} />}

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        body { margin: 0; background-color: #F9FAFB; }
      `}</style>
    </div>
  );
}
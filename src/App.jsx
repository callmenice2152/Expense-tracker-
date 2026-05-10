import { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from "recharts";

// --- Configuration & Constants ---
const INCOME_CATS = ["เงินเดือน", "ธุรกิจ", "ฟรีแลนซ์", "ลงทุน", "โบนัส", "อื่นๆ"];
const EXPENSE_CATS = ["อาหาร", "เดินทาง", "ช้อปปิ้ง", "บันเทิง", "สุขภาพ", "บ้าน", "ออมทรัพย์", "อื่นๆ"];
const CAT_ICONS = {
  เงินเดือน:"💼", ธุรกิจ:"🏪", ฟรีแลนซ์:"💻", ลงทุน:"📈", โบนัส:"🎁", "อื่นๆ":"📦",
  อาหาร:"🍜", เดินทาง:"🚗", ช้อปปิ้ง:"🛍️", บันเทิง:"🎬", สุขภาพ:"💊", บ้าน:"🏠", ออมทรัพย์:"🐷",
};
const PIE_COLORS = ["#7c3aed", "#a78bfa", "#22c55e", "#f97316", "#3b82f6", "#ec4899", "#d1d5db", "#4b5563"];

// Modernized Theme Colors
const Colors = {
  inc: "#10b981",    // Soft Emerald
  exp: "#f43f5e",    // Soft Rose
  primary: "#111827", // Luxury Black/Dark Gray
  bg: "#f3f4f6",     // Gray 100
  surface: "#ffffff",
  textMain: "#111827",
  textSub: "#6b7280",
  border: "#f3f4f6"
};

// --- Helpers ---
const fmt = (n) => new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(Math.abs(n));
const fmtFull = (n) => `${n < 0 ? "-" : ""}฿${fmt(n)}`;
const getMonth = (d) => d.slice(0, 7);
const today = () => new Date().toISOString().split("T")[0];
const monthLabel = (m) => {
  const [y, mo] = m.split("-");
  const thMonth = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  return `${thMonth[parseInt(mo) - 1]} ${parseInt(y) + 543}`;
};

// --- Redesigned UI System ---
const s = {
  app: { 
    fontFamily: "'Inter', 'system-ui', sans-serif", 
    backgroundColor: Colors.bg, 
    minHeight: "100vh", 
    color: Colors.textMain, 
    WebkitFontSmoothing: "antialiased"
  },
  container: { 
    maxWidth: 500, // แคบลงเพื่อให้เป็น Mobile width ที่สวยงามแม้อยู่บนคอม
    margin: "0 auto", 
    padding: "20px 16px 40px", 
  },
  card: { 
    background: Colors.surface, 
    borderRadius: 20, 
    padding: "20px", 
    marginBottom: "16px",
    boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.03)", 
  },
  input: { 
    width: "100%", 
    padding: "16px", 
    borderRadius: 14, 
    border: `1px solid ${Colors.border}`, 
    fontSize: 16, 
    boxSizing: "border-box", 
    backgroundColor: "#f9fafb", 
    outline: "none", 
    transition: "border-color 0.2s"
  },
  btn: (bg, color = "#fff") => ({ 
    background: bg, 
    color: color, 
    border: "none", 
    borderRadius: 16, 
    padding: "16px", 
    width: "100%", 
    fontSize: 16, 
    fontWeight: 700, 
    cursor: "pointer", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    boxShadow: bg === Colors.primary ? "0 4px 12px rgba(0,0,0,0.15)" : "none"
  }),
};

// --- Specialized Components ---
function StatCard({ label, value, color, sub, isMain }) {
  return (
    <div style={{ ...s.card, flex: 1, padding: isMain ? '28px 24px' : '20px', background: isMain ? Colors.primary : Colors.surface }}>
      <div style={{ fontSize: 12, color: isMain ? 'rgba(255,255,255,0.7)' : Colors.textSub, marginBottom: 8, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: isMain ? 36 : 22, fontWeight: 800, color: isMain ? '#fff' : color, letterSpacing: '-0.02em' }}>{fmtFull(value)}</div>
      {sub && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>{sub}</div>}
    </div>
  );
}

function TxRow({ tx, onDelete }) {
  const isInc = tx.type === "income";
  return (
    <div style={{ ...s.card, display: "flex", alignItems: "center", gap: 16, padding: "16px", marginBottom: 12, borderRadius: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: isInc ? "#e6f7f0" : "#fff1f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
        {CAT_ICONS[tx.category] || "📦"}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>{tx.category}</div>
        <div style={{ fontSize: 13, color: Colors.textSub, marginTop: 2 }}>{tx.date}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: isInc ? Colors.inc : Colors.textMain }}>
          {isInc ? "+" : "-"}{fmt(tx.amount)}
        </div>
        <button onClick={() => onDelete(tx.id)} style={{ background: "none", border: "none", color: Colors.exp, fontSize: 12, cursor: "pointer", padding: "6px 0", opacity: 0.7, fontWeight: 500 }}>ลบออก</button>
      </div>
    </div>
  );
}

function AddForm({ onAdd, onClose }) {
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATS[0]);
  const [date, setDate] = useState(today());

  const cats = type === "income" ? INCOME_CATS : EXPENSE_CATS;
  const accent = type === "income" ? Colors.inc : Colors.primary;

  const submit = () => {
    if (!amount || amount <= 0) return;
    onAdd({ id: Date.now().toString(), type, amount: parseFloat(amount), category, date });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.4)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#fff", borderRadius: "32px 32px 0 0", padding: "32px 24px", width: "100%", maxWidth: 500, animation: "slideUp 0.3s ease-out" }}>
        <div style={{ width: 40, height: 4, background: Colors.border, borderRadius: 2, margin: "0 auto 24px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>เพิ่มรายการ</h2>
          <button onClick={onClose} style={{ border: "none", background: "rgba(0,0,0,0.05)", width: 32, height: 32, borderRadius: 16, fontSize: 14, cursor: "pointer", color: Colors.textSub, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        
        <div style={{ display: "flex", gap: 8, marginBottom: 24, background: "#f3f4f6", padding: 4, borderRadius: 16 }}>
            <button onClick={() => { setType("income"); setCategory(INCOME_CATS[0]); }} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", fontSize: 14, fontWeight: 600, background: type === "income" ? "#fff" : "transparent", color: type === "income" ? Colors.inc : Colors.textSub, boxShadow: type === "income" ? "0 2px 8px rgba(0,0,0,0.05)" : "none", transition: "all 0.2s" }}>รายรับ</button>
            <button onClick={() => { setType("expense"); setCategory(EXPENSE_CATS[0]); }} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", fontSize: 14, fontWeight: 600, background: type === "expense" ? "#fff" : "transparent", color: type === "expense" ? Colors.primary : Colors.textSub, boxShadow: type === "expense" ? "0 2px 8px rgba(0,0,0,0.05)" : "none", transition: "all 0.2s" }}>รายจ่าย</button>
        </div>
        
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <span style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', fontSize: 24, fontWeight: 700, color: accent }}>฿</span>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" style={{ ...s.input, fontSize: 36, fontWeight: 800, paddingLeft: 56, color: accent, height: 80 }} />
        </div>
        
        <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
          <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: Colors.textSub, marginBottom: 8, fontWeight: 500, paddingLeft: 4 }}>หมวดหมู่</div>
              <select value={category} onChange={e => setCategory(e.target.value)} style={s.input}>
                  {cats.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
          </div>
          <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: Colors.textSub, marginBottom: 8, fontWeight: 500, paddingLeft: 4 }}>วันที่</div>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={s.input} />
          </div>
        </div>
        
        <button onClick={submit} style={s.btn(accent)}>บันทึกรายการ</button>
      </div>
    </div>
  );
}

// --- Main App Component ---
export default function App() {
  const [txs, setTxs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => today().slice(0, 7));

  useEffect(() => {
    const saved = localStorage.getItem("expense-tracker-txs");
    if (saved) setTxs(JSON.parse(saved));
  }, []);

  const persist = (data) => {
    localStorage.setItem("expense-tracker-txs", JSON.stringify(data));
  };

  const addTx = (tx) => {
    const next = [tx, ...txs];
    setTxs(next); persist(next); setShowForm(false);
  };

  const delTx = (id) => {
    const next = txs.filter(t => t.id !== id);
    setTxs(next); persist(next);
  };

  const monthTxs = txs.filter(t => getMonth(t.date) === selectedMonth);
  const income = monthTxs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = monthTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  const expCatData = EXPENSE_CATS.map(cat => ({
    name: cat,
    value: monthTxs.filter(t => t.type === "expense" && t.category === cat).reduce((s, t) => s + t.amount, 0)
  })).filter(d => d.value > 0);

  return (
    <div style={s.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        body { margin: 0; }
        input[type="number"]::-webkit-inner-spin-button, 
        input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
      
      <div style={s.container}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, marginTop: 12 }}>
          <div>
            <div style={{ fontSize: 14, color: Colors.textSub, fontWeight: 500, marginBottom: 4 }}>{monthLabel(selectedMonth)}</div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>ภาพรวมบัญชี</h1>
          </div>
          <button onClick={() => setShowForm(true)} style={{ background: Colors.primary, color: "#fff", border: "none", borderRadius: 14, padding: "10px 20px", fontWeight: 600, cursor: "pointer", fontSize: 14, boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
            + เพิ่มรายการ
          </button>
        </div>

        {/* Balance Card */}
        <StatCard label="ยอดเงินคงเหลือ" value={balance} isMain={true} />
        
        {/* Income / Expense Cards */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <StatCard label="รายรับเดือนนี้" value={income} color={Colors.inc} />
          <StatCard label="รายจ่ายเดือนนี้" value={expense} color={Colors.exp} />
        </div>

        {/* Chart Card */}
        {expCatData.length > 0 && (
          <div style={{...s.card, marginBottom: 24}}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>สัดส่วนรายจ่าย</div>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expCatData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                    {expCatData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />)}
                  </Pie>
                  <Tooltip formatter={v => `฿${fmt(v)}`} contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Transactions List */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>รายการล่าสุด</div>
        </div>
        
        {monthTxs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: Colors.textSub, background: Colors.surface, borderRadius: 20 }}>
             <div style={{ fontSize: 32, marginBottom: 12 }}>📝</div>
             <div style={{ fontWeight: 500 }}>ยังไม่มีรายการบันทึกในเดือนนี้</div>
          </div>
        ) : (
          monthTxs.map(tx => <TxRow key={tx.id} tx={tx} onDelete={delTx} />)
        )}

        {showForm && <AddForm onAdd={addTx} onClose={() => setShowForm(false)} />}
      </div>
    </div>
  );
}
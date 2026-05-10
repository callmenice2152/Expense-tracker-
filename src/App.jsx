import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const INCOME_CATS = ["เงินเดือน", "ธุรกิจ", "ฟรีแลนซ์", "ลงทุน", "โบนัส", "อื่นๆ"];
const EXPENSE_CATS = ["อาหาร", "เดินทาง", "ช้อปปิ้ง", "บันเทิง", "สุขภาพ", "บ้าน", "ออมทรัพย์", "อื่นๆ"];
const CAT_ICONS = {
  เงินเดือน: "💼", ธุรกิจ: "🏪", ฟรีแลนซ์: "💻", ลงทุน: "📈", โบนัส: "🎁", "อื่นๆ": "📦",
  อาหาร: "🍜", เดินทาง: "🚗", ช้อปปิ้ง: "🛍️", บันเทิง: "🎬", สุขภาพ: "💊", บ้าน: "🏠", ออมทรัพย์: "🐷",
};
const PIE_COLORS = ["#f43f5e", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#6366f1", "#a855f7", "#ec4899"];

const fmt = (n) => new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(Math.abs(n));
const fmtFull = (n) => `${n < 0 ? "-" : ""}฿${fmt(n)}`;
const getMonth = (d) => d.slice(0, 7);
const today = () => new Date().toISOString().split("T")[0];
const monthLabel = (m) => {
  const [y, mo] = m.split("-");
  const thMonth = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  return `${thMonth[parseInt(mo) - 1]} ${parseInt(y) + 543}`;
};

const s = {
  app: { fontFamily: "system-ui, -apple-system, sans-serif", maxWidth: 680, margin: "0 auto", padding: "1rem", color: "#111" },
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1rem 1.25rem" },
  muted: { color: "#6b7280", fontSize: 13 },
  pill: (active, color) => ({
    padding: "5px 14px", borderRadius: 20, border: "1px solid #e5e7eb",
    fontSize: 13, cursor: "pointer", fontWeight: active ? 500 : 400,
    background: active ? color : "#f9fafb",
    color: active ? "#fff" : "#6b7280",
  }),
  input: { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14, background: "#f9fafb", color: "#111", boxSizing: "border-box", outline: "none" },
  btn: (bg, color = "#fff") => ({ background: bg, color, border: "none", borderRadius: 10, padding: 11, width: "100%", fontSize: 15, fontWeight: 600, cursor: "pointer" }),
};

function StatCard({ label, value, color, sub }) {
  return (
    <div style={{ background: "#f9fafb", borderRadius: 12, padding: "1rem", flex: 1 }}>
      <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color }}>{fmtFull(value)}</div>
      {sub && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function TxRow({ tx, onDelete }) {
  const isInc = tx.type === "income";
  return (
    <div style={{ ...s.card, display: "flex", alignItems: "center", gap: 12, padding: "10px 14px" }}>
      <div style={{ width: 38, height: 38, borderRadius: "50%", background: isInc ? "rgba(16,185,129,.12)" : "rgba(244,63,94,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
        {CAT_ICONS[tx.category] || "📦"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tx.category}</div>
        {tx.note && <div style={{ fontSize: 12, color: "#9ca3af", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tx.note}</div>}
        <div style={{ fontSize: 11, color: "#9ca3af" }}>
          {new Date(tx.date + "T00:00:00").toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })}
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: isInc ? "#10b981" : "#f43f5e" }}>
          {isInc ? "+" : "-"}฿{fmt(tx.amount)}
        </div>
        <button onClick={() => onDelete(tx.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 11, padding: "2px 0" }}>ลบ</button>
      </div>
    </div>
  );
}

function AddForm({ onAdd, onClose }) {
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATS[0]);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(today());

  const cats = type === "income" ? INCOME_CATS : EXPENSE_CATS;
  const accent = type === "income" ? "#10b981" : "#f43f5e";

  const switchType = (t) => { setType(t); setCategory(t === "income" ? INCOME_CATS[0] : EXPENSE_CATS[0]); };

  const submit = () => {
    const n = parseFloat(amount);
    if (!n || n <= 0) return;
    onAdd({ id: Date.now().toString(), type, amount: n, category, note: note.trim(), date });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 200 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: "18px 18px 0 0", padding: "1.5rem 1.25rem 2rem", width: "100%", maxWidth: 680 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>เพิ่มรายการ</h2>
          <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", width: 28, height: 28, borderRadius: "50%", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>✕</button>
        </div>

        <div style={{ display: "flex", background: "#f3f4f6", borderRadius: 10, padding: 4, marginBottom: "1rem", gap: 4 }}>
          {[["income", "💵 รายรับ"], ["expense", "💸 รายจ่าย"]].map(([v, l]) => (
            <button key={v} onClick={() => switchType(v)} style={{ flex: 1, padding: 8, borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, background: type === v ? accent : "transparent", color: type === v ? "#fff" : "#6b7280", transition: "all .15s" }}>{l}</button>
          ))}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <div style={{ ...s.muted, marginBottom: 4 }}>จำนวนเงิน (บาท)</div>
          <input autoFocus type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0"
            onKeyDown={(e) => e.key === "Enter" && submit()}
            style={{ ...s.input, fontSize: 22, fontWeight: 700, padding: "10px 14px" }} />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <div style={{ ...s.muted, marginBottom: 6 }}>หมวดหมู่</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {cats.map((c) => (
              <button key={c} onClick={() => setCategory(c)} style={{ padding: "5px 12px", borderRadius: 20, border: "1px solid #e5e7eb", fontSize: 13, cursor: "pointer", background: category === c ? accent : "#f9fafb", color: category === c ? "#fff" : "#111", transition: "all .12s" }}>
                {CAT_ICONS[c]} {c}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: "1.5rem" }}>
          <div style={{ flex: 1 }}>
            <div style={{ ...s.muted, marginBottom: 4 }}>หมายเหตุ</div>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="เช่น ข้าวกลางวัน..." style={s.input} />
          </div>
          <div>
            <div style={{ ...s.muted, marginBottom: 4 }}>วันที่</div>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ ...s.input, width: "auto" }} />
          </div>
        </div>

        <button onClick={submit} style={s.btn(accent)}>💾 บันทึก</button>
      </div>
    </div>
  );
}

export default function App() {
  const [txs, setTxs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [filter, setFilter] = useState("all");
  const [chartType, setChartType] = useState("bar");
  const [selectedMonth, setSelectedMonth] = useState(() => today().slice(0, 7));

  // โหลดข้อมูลจาก localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("expense-tracker-txs");
      if (raw) setTxs(JSON.parse(raw));
    } catch (_) {}
  }, []);

  // บันทึกข้อมูลลง localStorage
  const persist = (data) => {
    try {
      localStorage.setItem("expense-tracker-txs", JSON.stringify(data));
    } catch (_) {}
  };

  const addTx = (tx) => {
    const next = [tx, ...txs];
    setTxs(next);
    persist(next);
    setShowForm(false);
  };

  const delTx = (id) => {
    const next = txs.filter((t) => t.id !== id);
    setTxs(next);
    persist(next);
  };

  const monthTxs = txs.filter((t) => getMonth(t.date) === selectedMonth);
  const income = monthTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = monthTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;
  const savingRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;

  const visibleTxs = filter === "all" ? monthTxs : monthTxs.filter((t) => t.type === filter);

  const expCatData = EXPENSE_CATS.map((cat) => ({
    name: cat,
    icon: CAT_ICONS[cat],
    value: monthTxs.filter((t) => t.type === "expense" && t.category === cat).reduce((s, t) => s + t.amount, 0),
  })).filter((d) => d.value > 0).sort((a, b) => b.value - a.value);

  const incCatData = INCOME_CATS.map((cat) => ({
    name: cat,
    value: monthTxs.filter((t) => t.type === "income" && t.category === cat).reduce((s, t) => s + t.amount, 0),
  })).filter((d) => d.value > 0);

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const inc = txs.filter((t) => getMonth(t.date) === m && t.type === "income").reduce((s, t) => s + t.amount, 0);
    const exp = txs.filter((t) => getMonth(t.date) === m && t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { month: monthLabel(m).slice(0, 5), income: inc, expense: exp };
  });

  const navItems = [
    { key: "dashboard", icon: "📊", label: "ภาพรวม" },
    { key: "transactions", icon: "📋", label: "รายการ" },
    { key: "stats", icon: "📈", label: "สถิติ" },
  ];

  return (
    <div style={s.app}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>💰 บัญชีส่วนตัว</h1>
          <div style={s.muted}>{monthLabel(selectedMonth)}</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#111", fontSize: 13 }} />
          <button onClick={() => setShowForm(true)} style={{ background: "#10b981", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
            + เพิ่ม
          </button>
        </div>
      </div>

      {/* Nav tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: "1.25rem", background: "#f3f4f6", borderRadius: 10, padding: 4 }}>
        {navItems.map((n) => (
          <button key={n.key} onClick={() => setTab(n.key)} style={{ flex: 1, padding: "7px 4px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: tab === n.key ? 600 : 400, background: tab === n.key ? "#fff" : "transparent", color: tab === n.key ? "#111" : "#6b7280", transition: "all .15s" }}>
            {n.icon} {n.label}
          </button>
        ))}
      </div>

      {/* ====== DASHBOARD TAB ====== */}
      {tab === "dashboard" && (
        <div>
          <div style={{ display: "flex", gap: 10, marginBottom: "1rem" }}>
            <StatCard label="ยอดคงเหลือ" value={balance} color={balance >= 0 ? "#10b981" : "#f43f5e"} sub={`ออมได้ ${savingRate}%`} />
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: "1.25rem" }}>
            <StatCard label="รายรับทั้งหมด" value={income} color="#10b981" />
            <StatCard label="รายจ่ายทั้งหมด" value={expense} color="#f43f5e" />
          </div>

          {expCatData.length > 0 && (
            <div style={{ ...s.card, marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>รายจ่ายตามหมวดหมู่</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {[["bar", "📊"], ["pie", "🥧"]].map(([k, l]) => (
                    <button key={k} onClick={() => setChartType(k)} style={{ ...s.pill(chartType === k, "#6366f1"), padding: "3px 10px", fontSize: 12 }}>{l}</button>
                  ))}
                </div>
              </div>
              {chartType === "bar" ? (
                <div style={{ height: Math.max(180, expCatData.length * 44) }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expCatData} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                      <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `฿${fmt(v)}`} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={70} />
                      <Tooltip formatter={(v) => [`฿${fmt(v)}`, "จำนวน"]} />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                        {expCatData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={expCatData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={2}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {expCatData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => [`฿${fmt(v)}`, "จำนวน"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {monthTxs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#9ca3af" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>💸</div>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>ยังไม่มีรายการในเดือนนี้</div>
              <div style={{ fontSize: 13 }}>กดปุ่ม + เพิ่ม เพื่อเริ่มบันทึก</div>
            </div>
          ) : (
            <div style={s.card}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: "0.75rem" }}>รายการล่าสุด</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {monthTxs.slice(0, 5).map((tx) => <TxRow key={tx.id} tx={tx} onDelete={delTx} />)}
              </div>
              {monthTxs.length > 5 && (
                <button onClick={() => setTab("transactions")} style={{ background: "none", border: "none", color: "#6366f1", fontSize: 13, cursor: "pointer", marginTop: 10, width: "100%", textAlign: "center" }}>
                  ดูทั้งหมด {monthTxs.length} รายการ →
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ====== TRANSACTIONS TAB ====== */}
      {tab === "transactions" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
            {[["all", "ทั้งหมด", "#6366f1"], ["income", "รายรับ", "#10b981"], ["expense", "รายจ่าย", "#f43f5e"]].map(([v, l, c]) => (
              <button key={v} onClick={() => setFilter(v)} style={s.pill(filter === v, c)}>{l}</button>
            ))}
            <div style={{ ...s.muted, marginLeft: "auto", alignSelf: "center" }}>{visibleTxs.length} รายการ</div>
          </div>
          {visibleTxs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>ไม่มีรายการ</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {visibleTxs.map((tx) => <TxRow key={tx.id} tx={tx} onDelete={delTx} />)}
            </div>
          )}
        </div>
      )}

      {/* ====== STATS TAB ====== */}
      {tab === "stats" && (
        <div>
          <div style={{ ...s.card, marginBottom: "1.25rem" }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: "1rem" }}>รายรับ vs รายจ่าย 6 เดือนล่าสุด</div>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last6Months} margin={{ left: 0, right: 10, top: 4, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `฿${fmt(v)}`} />
                  <Tooltip formatter={(v) => `฿${fmt(v)}`} />
                  <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="รายรับ" />
                  <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} name="รายจ่าย" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", fontSize: 12, color: "#6b7280", marginTop: 8 }}>
              <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "#10b981", marginRight: 4 }} />รายรับ</span>
              <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "#f43f5e", marginRight: 4 }} />รายจ่าย</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={s.card}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>🟢 รายรับแยกหมวด</div>
              {incCatData.length === 0 ? <div style={{ ...s.muted, fontSize: 12 }}>ยังไม่มีข้อมูล</div> :
                incCatData.map((d) => (
                  <div key={d.name} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "3px 0", borderBottom: "1px solid #f3f4f6" }}>
                    <span style={{ color: "#6b7280" }}>{CAT_ICONS[d.name]} {d.name}</span>
                    <span style={{ fontWeight: 600, color: "#10b981" }}>฿{fmt(d.value)}</span>
                  </div>
                ))}
            </div>
            <div style={s.card}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>🔴 รายจ่ายแยกหมวด</div>
              {expCatData.length === 0 ? <div style={{ ...s.muted, fontSize: 12 }}>ยังไม่มีข้อมูล</div> :
                expCatData.map((d) => (
                  <div key={d.name} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "3px 0", borderBottom: "1px solid #f3f4f6" }}>
                    <span style={{ color: "#6b7280" }}>{d.icon} {d.name}</span>
                    <span style={{ fontWeight: 600, color: "#f43f5e" }}>฿{fmt(d.value)}</span>
                  </div>
                ))}
            </div>
          </div>

          <div style={{ ...s.card, marginTop: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>📊 สรุปภาพรวม</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "จำนวนรายการทั้งหมด", value: `${txs.length} รายการ`, color: "#111" },
                { label: "รายรับเดือนนี้", value: `฿${fmt(income)}`, color: "#10b981" },
                { label: "รายจ่ายเดือนนี้", value: `฿${fmt(expense)}`, color: "#f43f5e" },
                { label: "อัตราการออม", value: `${savingRate}%`, color: savingRate >= 20 ? "#10b981" : "#f59e0b" },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <span style={{ color: "#6b7280", fontSize: 13 }}>{row.label}</span>
                  <span style={{ fontWeight: 600, color: row.color, fontSize: 13 }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showForm && <AddForm onAdd={addTx} onClose={() => setShowForm(false)} />}
    </div>
  );
}
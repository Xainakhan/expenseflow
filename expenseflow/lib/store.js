'use client';
import { createContext, useContext, useEffect, useState } from 'react';
const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);
export const CATS = {
  'Food & Dining': '#FF8A3D', Shopping: '#FFC02E', Transport: '#4DB6F5', Bills: '#A98BDB',
  Entertainment: '#F29BB5', Healthcare: '#6CCBA5', Education: '#8FA7F0', Other: '#C9BFB5',
  Salary: '#32865A', Freelance: '#5BAE86', Business: '#7BC4A0', Investments: '#9AD3B6',
};
export const EXPENSE_CATS = ['Food & Dining','Shopping','Transport','Bills','Entertainment','Healthcare','Education','Other'];
export const INCOME_CATS = ['Salary','Freelance','Business','Investments','Other'];
export let SYM = 'Rs.';
export const setSym = (x) => { SYM = x; };
export const fmt = (n) => SYM + ' ' + Math.round(n).toLocaleString('en-PK');
const seed = () => {
  const n = new Date(), y = n.getFullYear(), m = n.getMonth();
  const d = (day, h = 10) => new Date(y, m, day, h, 30).toISOString().slice(0, 16);
  const t = (i, type, title, category, amount, date, method = 'Card') => ({ id: 's' + i, type, title, category, amount, date, method });
  return [
    t(1,'income','Monthly Salary','Salary',85000,d(1,9),'Bank'),
    t(2,'expense','Shopping','Shopping',4500,d(Math.min(n.getDate(),20),10)),
    t(3,'expense','Food & Dining','Food & Dining',1200,d(Math.min(n.getDate(),20),13)),
    t(4,'expense','Electricity Bill','Bills',3000,d(5),'Bank'),
    t(5,'expense','Transport','Transport',800,d(7),'Cash'),
    t(6,'expense','Groceries','Food & Dining',6000,d(9),'Cash'),
    t(7,'expense','Clothes','Shopping',5500,d(12)),
    t(8,'expense','Fuel','Transport',4000,d(14),'Cash'),
    t(9,'expense','Internet & Gas','Bills',7500,d(16),'Bank'),
  ];
};
export function Provider({ children }) {
  const [txs, setTxs] = useState([]);
  const [budget, setBudgetState] = useState(40000);
  const [ready, setReady] = useState(false);
  const [form, setForm] = useState(null);
  const [toast, setToast] = useState('');
  const [dialog, setDialog] = useState(null);
  const [custom, setCustom] = useState([]);
  const [catBudgets, setCatBudgets] = useState({});
  const [committee, setCommittee] = useState({ enabled: false, target: 0, contribution: 0 });
  const [user, setUser] = useState({ name: '', email: '', photo: '' });
  const [settings, setSettings] = useState({ sym: 'Rs.', notify: true });
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem('ef-txs'));
      setTxs(s || seed());
      setBudgetState(Number(localStorage.getItem('ef-budget')) || 40000);
      const c = JSON.parse(localStorage.getItem('ef-custom') || '[]'); c.forEach((x) => { CATS[x.name] = x.color; }); setCustom(c);
      setCatBudgets(JSON.parse(localStorage.getItem('ef-catb') || '{}'));
      setCommittee(JSON.parse(localStorage.getItem('ef-committee') || '{"enabled":false,"target":0,"contribution":0}'));
      const st = JSON.parse(localStorage.getItem('ef-set') || 'null');
      if (st) {
        setSym(st.sym || 'Rs.');
        setSettings({ sym: st.sym || 'Rs.', notify: st.notify ?? true });
      }
      // Migrate profiles stored by earlier versions out of preferences.
      const savedUser = JSON.parse(localStorage.getItem('ef-user') || 'null');
      setUser(savedUser || { name: st?.name || '', email: st?.email || '', photo: st?.photo || '' });
    } catch { setTxs(seed()); }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem('ef-txs', JSON.stringify(txs)); }, [txs, ready]);
  useEffect(() => { if (ready) { localStorage.setItem('ef-custom', JSON.stringify(custom)); localStorage.setItem('ef-catb', JSON.stringify(catBudgets)); localStorage.setItem('ef-set', JSON.stringify(settings)); localStorage.setItem('ef-user', JSON.stringify(user)); localStorage.setItem('ef-committee', JSON.stringify(committee)); } }, [custom, catBudgets, settings, user, committee, ready]);
  const notify = (m) => { setToast(m); setTimeout(() => setToast(''), 2400); };
  const openDialog = (config) => setDialog(config);
  const closeDialog = () => setDialog(null);
  const save = (tx) => {
    const stamped = { ...tx, date: tx.date || new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 16) };
    setTxs((p) => stamped.id ? p.map((x) => (x.id === stamped.id ? stamped : x)) : [{ ...stamped, id: String(Date.now()) }, ...p]);
    notify(tx.id ? 'Transaction updated' : 'Transaction saved');
  };
  const remove = (id) => { setTxs((p) => p.filter((x) => x.id !== id)); notify('Transaction deleted'); };
  const setBudget = (v) => { setBudgetState(v); localStorage.setItem('ef-budget', v); notify('Budget updated'); };
  const addCat = (c) => { CATS[c.name] = c.color; setCustom((p) => [...p, c]); notify('Category added'); };
  const delCat = (n) => { setCustom((p) => p.filter((x) => x.name !== n)); notify('Category deleted'); };
  const setCatBudget = (n, v) => { setCatBudgets((p) => ({ ...p, [n]: v })); notify('Limit saved'); };
  const saveSettings = (v) => { setSym(v.sym); setSettings(v); notify('Settings saved'); };
  const saveUser = (v) => { setUser({ name: v.name.trim(), email: v.email.trim(), photo: v.photo || '' }); notify('Profile saved'); };
  const resetAll = () => { setTxs(seed()); setCustom([]); setCatBudgets({}); setBudgetState(40000); localStorage.setItem('ef-budget', 40000); notify('Data reset'); };
  const expCats = [...EXPENSE_CATS, ...custom.filter((c) => c.type === 'expense').map((c) => c.name)];
  const incCats = [...INCOME_CATS, ...custom.filter((c) => c.type === 'income').map((c) => c.name)];
  return <Ctx.Provider value={{ custom, catBudgets, user, settings, committee, setCommittee, addCat, delCat, setCatBudget, saveUser, saveSettings, resetAll, expCats, incCats, txs, budget, setBudget, save, remove, form, setForm, toast, dialog, openDialog, closeDialog, ready }}>{children}</Ctx.Provider>;
}

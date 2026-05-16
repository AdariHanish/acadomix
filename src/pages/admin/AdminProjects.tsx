import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Star, TrendingUp, X, Save } from 'lucide-react';
import { ProjectsDB } from '../../utils/storage';
import { Project } from '../../types';

const categories = [
  { value: 'website', label: 'Web Dev' },
  { value: 'aiml', label: 'AI/ML' },
  { value: 'datascience', label: 'Data Science' },
  { value: 'iot', label: 'IoT' },
  { value: 'research', label: 'Research' },
];

const empty = { title: '', description: '', category: 'website' as Project['category'], year_type: 'major', original_price: 0, market_price: 0, our_price: 0, features: '', is_popular: false, is_trending: false };

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(empty);

  useEffect(() => { load(); }, []);
  const load = () => ProjectsDB.getAll().then(setProjects);

  const openForm = (p?: Project) => {
    if (p) { setEditing(p); setForm({ title: p.title, description: p.description, category: p.category, year_type: p.year_type, original_price: p.original_price, market_price: p.market_price, our_price: p.our_price, features: p.features, is_popular: p.is_popular, is_trending: p.is_trending }); }
    else { setEditing(null); setForm(empty); }
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    editing ? await ProjectsDB.update(editing.id, form) : await ProjectsDB.add(form);
    setShowForm(false); setEditing(null); setForm(empty); load();
  };

  const [broadcasting, setBroadcasting] = useState<number | null>(null);

  const broadcast = async (project: Project) => {
    setBroadcasting(project.id);
    try {
      const response = await fetch('/api/payments');
      const payments: any[] = await response.json();
      
      // Get unique verified customers
      const customers = payments
        .filter(p => p.status === 'verified')
        .reduce((acc: any[], current) => {
          if (!acc.find(item => item.phone === current.phone)) {
            acc.push(current);
          }
          return acc;
        }, []);

      if (customers.length === 0) {
        alert('No verified customers found to broadcast to.');
        return;
      }

      // Generate WhatsApp link for the first customer (or show a list)
      const msg = `🚀 *NEW PROJECT ALERT!* \n\n*${project.title}*\n\n${project.description}\n\n💰 *Price:* ₹${project.our_price}\n\n🎁 *LOYALTY DISCOUNT:* Since you've worked with us before, get an extra ₹500 OFF on this project!\n\nCheck it out here: ${window.location.origin}/#/projects`;
      
      // For simplicity, we open the first one and alert the user
      customers.forEach((c, index) => {
        setTimeout(() => {
          const url = `https://wa.me/91${c.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
          window.open(url, '_blank');
        }, index * 2000); // 2 second gap between opens to avoid browser block
      });

      alert(`Opening WhatsApp for ${customers.length} customers. Please allow popups!`);
    } catch (e) {
      alert('Failed to fetch customers.');
    } finally {
      setBroadcasting(null);
    }
  };

  const remove = async (id: number) => { if (confirm('Delete?')) { await ProjectsDB.delete(id); load(); } };

  const inputCls = "w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-[13px] placeholder-white/20 focus:outline-none focus:border-white/[0.15] transition-all";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h2 className="text-xl font-bold text-white">Projects</h2><p className="text-[13px] text-white/30">Manage project catalog and notify customers.</p></div>
        <button onClick={() => openForm()} className="flex items-center gap-2 px-5 py-2.5 bg-crimson hover:bg-crimson-light text-white text-[13px] font-medium rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(p => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-surface-1 border border-border p-5">
            <div className="flex gap-1.5 mb-3">
              <button onClick={async () => { await ProjectsDB.update(p.id, { is_popular: !p.is_popular }); load(); }}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${p.is_popular ? 'bg-crimson/10 text-crimson' : 'bg-white/[0.03] text-white/20 hover:text-crimson'}`}>
                <Star className={`w-2.5 h-2.5 ${p.is_popular ? 'fill-crimson' : ''}`} /> Popular
              </button>
              <button onClick={async () => { await ProjectsDB.update(p.id, { is_trending: !p.is_trending }); load(); }}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${p.is_trending ? 'bg-gold/10 text-gold' : 'bg-white/[0.03] text-white/20 hover:text-gold'}`}>
                <TrendingUp className="w-2.5 h-2.5" /> Trending
              </button>
            </div>
            
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-[14px] font-medium text-white line-clamp-1">{p.title}</p>
              <span className="px-2 py-0.5 rounded bg-white/[0.04] text-white/20 text-[10px] capitalize flex-shrink-0">{p.category}</span>
            </div>
            <p className="text-[12px] text-white/25 line-clamp-2 mb-3">{p.description}</p>
            
            <div className="space-y-1 p-3 rounded-lg bg-white/[0.02] border border-white/[0.03] mb-3 text-[10px]">
              <div className="flex justify-between text-white/10"><span>Original Value:</span><span className="line-through">₹{p.original_price.toLocaleString()}</span></div>
              <div className="flex justify-between text-white/20"><span>Market Price:</span><span className="line-through">₹{p.market_price.toLocaleString()}</span></div>
              <div className="flex justify-between items-center pt-1 border-t border-white/5 mt-1">
                <span className="text-white/60 font-bold">Our Price:</span>
                <span className="text-gradient-brand text-[14px] font-black">₹{p.our_price.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button onClick={() => broadcast(p)} disabled={broadcasting === p.id}
                className="w-full py-2.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg text-[12px] font-bold transition-all flex items-center justify-center gap-2 border border-blue-500/20">
                {broadcasting === p.id ? 'Sending...' : '📢 Broadcast to Customers'}
              </button>
              <div className="flex gap-2">
                <button onClick={() => openForm(p)} className="flex-1 py-2 bg-white/[0.03] text-white/30 hover:text-white hover:bg-white/[0.08] rounded-lg text-[12px] font-medium transition-all flex items-center justify-center gap-1"><Edit2 className="w-3 h-3" /> Edit</button>
                <button onClick={() => remove(p.id)} className="py-2 px-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-1 border border-border rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <p className="text-[16px] font-bold text-white">{editing ? 'Edit' : 'Add'} Project</p>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-white/[0.05] rounded-lg"><X className="w-4 h-4 text-white/30" /></button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div><label className="block text-[11px] text-white/25 mb-1">Title</label><input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className={inputCls} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[11px] text-white/25 mb-1">Category (Domain)</label><select value={form.category} onChange={e => setForm({...form, category: e.target.value as any})} className={`${inputCls} [&>option]:bg-black`}>{categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
                <div><label className="block text-[11px] text-white/25 mb-1">Type</label><select value={form.year_type} onChange={e => setForm({...form, year_type: e.target.value})} className={`${inputCls} [&>option]:bg-black`}><option value="mini">Mini</option><option value="major">Major</option></select></div>
              </div>
              <div>
                <label className="block text-[11px] text-white/25 mb-1 font-bold text-gold">Description (MANDATORY FORMAT)</label>
                <textarea rows={4} required value={form.description} onChange={e => setForm({...form, description: e.target.value})} 
                  placeholder="WHAT IT IS: ... &#10;HOW IT'S USEFUL: ..." 
                  className={`${inputCls} resize-none border-gold/20 focus:border-gold/40`} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-[11px] text-white/25 mb-1">Original ₹</label><input type="number" required value={form.original_price || ''} onChange={e => setForm({...form, original_price: +e.target.value})} className={inputCls} /></div>
                <div><label className="block text-[11px] text-white/25 mb-1">Market ₹</label><input type="number" required value={form.market_price || ''} onChange={e => setForm({...form, market_price: +e.target.value})} className={inputCls} /></div>
                <div><label className="block text-[11px] text-white/25 mb-1">Our Price ₹</label><input type="number" required value={form.our_price || ''} onChange={e => setForm({...form, our_price: +e.target.value})} className={inputCls} /></div>
              </div>
              <div><label className="block text-[11px] text-white/25 mb-1">Features (comma-separated)</label><input type="text" value={form.features} onChange={e => setForm({...form, features: e.target.value})} className={inputCls} /></div>
              <div className="flex gap-5">
                <label className="flex items-center gap-2 cursor-pointer text-[13px] text-white/50"><input type="checkbox" checked={form.is_popular} onChange={e => setForm({...form, is_popular: e.target.checked})} className="rounded" /> Popular</label>
                <label className="flex items-center gap-2 cursor-pointer text-[13px] text-white/50"><input type="checkbox" checked={form.is_trending} onChange={e => setForm({...form, is_trending: e.target.checked})} className="rounded" /> Trending</label>
              </div>
              <button type="submit" className="w-full py-3 bg-crimson hover:bg-crimson-light text-white text-[13px] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> {editing ? 'Update' : 'Add'} Project
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

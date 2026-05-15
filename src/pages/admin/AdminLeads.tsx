import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Trash2, Clock, MessageCircle, CheckCircle, Loader, Calendar, GraduationCap } from 'lucide-react';
import { LeadsDB } from '../../utils/storage';
import { Lead } from '../../types';

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<'all' | Lead['status']>('all');

  useEffect(() => { load(); }, []);
  const load = () => LeadsDB.getAll().then(setLeads);
  const updateStatus = async (id: number, s: Lead['status']) => { await LeadsDB.updateStatus(id, s); load(); };
  const remove = async (id: number) => { if (confirm('Delete?')) { await LeadsDB.delete(id); load(); } };

  const filtered = leads.filter(l => filter === 'all' || l.status === filter);
  const statusOptions: Lead['status'][] = ['new', 'contacted', 'in_progress', 'completed'];

  const statusIcon = (s: Lead['status']) => {
    if (s === 'new') return <Clock className="w-3.5 h-3.5" />;
    if (s === 'contacted') return <MessageCircle className="w-3.5 h-3.5" />;
    if (s === 'in_progress') return <Loader className="w-3.5 h-3.5" />;
    return <CheckCircle className="w-3.5 h-3.5" />;
  };
  const statusColor = (s: Lead['status']) => s === 'new' ? 'bg-blue-500/10 text-blue-400' : s === 'contacted' ? 'bg-gold/10 text-gold' : s === 'in_progress' ? 'bg-purple-500/10 text-purple-400' : 'bg-green-500/10 text-green-400';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h2 className="text-xl font-bold text-white">Leads</h2><p className="text-[13px] text-white/30">Track customer inquiries.</p></div>
        <div className="flex gap-1 p-1 bg-white/[0.03] rounded-lg border border-border flex-wrap">
          {(['all', ...statusOptions] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all capitalize ${filter === f ? 'bg-white/[0.08] text-white' : 'text-white/30 hover:text-white/60'}`}>
              {f === 'in_progress' ? 'In Progress' : f}{f === 'new' && ` (${leads.filter(l => l.status === 'new').length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length > 0 ? filtered.map(l => (
          <motion.div key={l.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-surface-1 border border-border p-5">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <p className="text-[14px] font-medium text-white">{l.name}</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor(l.status)}`}>
                    {statusIcon(l.status)} {l.status === 'in_progress' ? 'In Progress' : l.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 text-[12px] text-white/25 mb-2">
                  <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {l.college} · {l.branch}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(l.created_at).toLocaleDateString()}</span>
                </div>
                <a href={`tel:${l.phone}`} className="text-[12px] text-crimson/70 hover:text-crimson flex items-center gap-1 mb-2"><Phone className="w-3 h-3" /> {l.phone}</a>
                <div className="flex flex-wrap gap-1.5 text-[10px] mb-2">
                  <span className="px-2 py-0.5 rounded bg-white/[0.03] text-white/25">📁 {l.project_domain}</span>
                  <span className="px-2 py-0.5 rounded bg-white/[0.03] text-white/25">💰 {l.budget}</span>
                  <span className="px-2 py-0.5 rounded bg-white/[0.03] text-white/25">⏰ {l.deadline}</span>
                </div>
                {l.message && <p className="text-[12px] text-white/25 italic">"{l.message}"</p>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select value={l.status} onChange={e => updateStatus(l.id, e.target.value as Lead['status'])}
                  className="px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-[12px] focus:outline-none [&>option]:bg-black">
                  {statusOptions.map(s => <option key={s} value={s}>{s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
                <a href={`https://wa.me/91${l.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all"><MessageCircle className="w-4 h-4" /></a>
                <a href={`tel:${l.phone}`} className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"><Phone className="w-4 h-4" /></a>
                <button onClick={() => remove(l.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </motion.div>
        )) : <p className="text-center py-12 text-white/15 text-[13px]">No {filter !== 'all' ? filter.replace('_', ' ') : ''} leads</p>}
      </div>
    </div>
  );
}

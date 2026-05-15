import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Trash2, Eye, Clock, CheckCircle, AlertCircle, Phone, Mail, Download } from 'lucide-react';
import { PaymentsDB } from '../../utils/storage';
import { Payment } from '../../types';

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [selected, setSelected] = useState<Payment | null>(null);

  useEffect(() => { load(); }, []);
  const load = () => PaymentsDB.getAll().then(setPayments);
  const verify = async (id: number) => { await PaymentsDB.updateStatus(id, 'verified'); load(); setSelected(null); };
  const reject = async (id: number) => { await PaymentsDB.updateStatus(id, 'rejected'); load(); setSelected(null); };
  const remove = async (id: number) => { if (confirm('Delete?')) { await PaymentsDB.delete(id); load(); setSelected(null); } };

  const filtered = payments.filter(p => filter === 'all' || p.status === filter);
  const badge = (s: Payment['status']) => s === 'pending' ? { icon: <Clock className="w-3 h-3" />, cls: 'bg-gold/10 text-gold' } : s === 'verified' ? { icon: <CheckCircle className="w-3 h-3" />, cls: 'bg-green-500/10 text-green-400' } : { icon: <AlertCircle className="w-3 h-3" />, cls: 'bg-red-500/10 text-red-400' };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h2 className="text-xl font-bold text-white">Payments</h2><p className="text-[13px] text-white/30">Verify payment screenshots.</p></div>
        <div className="flex gap-1 p-1 bg-white/[0.03] rounded-lg border border-border">
          {(['all', 'pending', 'verified', 'rejected'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all capitalize ${filter === f ? 'bg-white/[0.08] text-white' : 'text-white/30 hover:text-white/60'}`}>
              {f} {f === 'pending' && `(${payments.filter(p => p.status === 'pending').length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length > 0 ? filtered.map(p => {
          const b = badge(p.status);
          return (
            <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-surface-1 border border-border p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/[0.03] flex-shrink-0 cursor-pointer" onClick={() => setSelected(p)}>
                  <img src={p.screenshot_data} alt="" className="w-full h-full object-cover hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="text-[14px] font-medium text-white">{p.student_name}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${b.cls}`}>{b.icon} {p.status}</span>
                  </div>
                  <p className="text-[12px] text-white/30 mb-1">{p.project_name}</p>
                  <div className="flex flex-wrap gap-3 text-[11px] text-white/20">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {p.phone}</span>
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {p.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">₹{p.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-white/15">{new Date(p.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setSelected(p)} className="p-2 rounded-lg bg-white/[0.03] text-white/25 hover:text-white hover:bg-white/[0.08] transition-all"><Eye className="w-4 h-4" /></button>
                    {p.status === 'pending' && <>
                      <button onClick={() => verify(p.id)} className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all"><Check className="w-4 h-4" /></button>
                      <button onClick={() => reject(p.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"><X className="w-4 h-4" /></button>
                    </>}
                    <button onClick={() => remove(p.id)} className="p-2 rounded-lg bg-white/[0.03] text-white/15 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        }) : <p className="text-center py-12 text-white/15 text-[13px]">No {filter !== 'all' ? filter : ''} payments</p>}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-1 border border-border rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <p className="text-[16px] font-bold text-white">Payment Details</p>
              <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-white/[0.05] rounded-lg"><X className="w-4 h-4 text-white/30" /></button>
            </div>
            <div className="rounded-xl overflow-hidden bg-white/[0.02] mb-5"><img src={selected.screenshot_data} alt="" className="w-full max-h-[350px] object-contain" /></div>
            <div className="grid grid-cols-2 gap-4 mb-5 text-[13px]">
              <div><p className="text-[11px] text-white/20 uppercase mb-0.5">Name</p><p className="text-white/70">{selected.student_name}</p></div>
              <div><p className="text-[11px] text-white/20 uppercase mb-0.5">Amount</p><p className="text-xl font-bold text-white">₹{selected.amount.toLocaleString()}</p></div>
              <div><p className="text-[11px] text-white/20 uppercase mb-0.5">Phone</p><p className="text-white/70">{selected.phone}</p></div>
              <div><p className="text-[11px] text-white/20 uppercase mb-0.5">Email</p><p className="text-white/70">{selected.email}</p></div>
              <div className="col-span-2"><p className="text-[11px] text-white/20 uppercase mb-0.5">Project</p><p className="text-white/70">{selected.project_name}</p></div>
            </div>
            <div className="flex gap-2">
              <a href={selected.screenshot_data} download={`payment-${selected.id}.jpg`} className="flex-1 py-2.5 bg-white/[0.05] text-white/60 text-[13px] font-medium rounded-xl text-center hover:bg-white/[0.1] transition-all flex items-center justify-center gap-1.5"><Download className="w-4 h-4" /> Download</a>
              {selected.status === 'pending' && <>
                <button onClick={() => verify(selected.id)} className="flex-1 py-2.5 bg-green-500 text-white text-[13px] font-medium rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-1.5"><Check className="w-4 h-4" /> Verify</button>
                <button onClick={() => reject(selected.id)} className="flex-1 py-2.5 bg-red-500 text-white text-[13px] font-medium rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-1.5"><X className="w-4 h-4" /> Reject</button>
              </>}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, Check, X, Trash2, Eye, Calendar, GraduationCap, Search, Clock } from 'lucide-react';
import { ReviewsDB } from '../../utils/storage';
import { Review } from '../../types';
import { SpinnerOverlay } from '../../components/Spinner';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => { loadReviews(); }, []);
  const loadReviews = () => {
    setLoading(true);
    ReviewsDB.getAll().then(data => { setReviews(data); setLoading(false); });
  };

  const handleApprove = async (id: number) => { await ReviewsDB.approve(id); loadReviews(); setSelectedReview(null); };
  const handleDelete = async (id: number) => { if (confirm('Delete this review?')) { await ReviewsDB.delete(id); loadReviews(); setSelectedReview(null); } };

  const filtered = useMemo(() => {
    let r = reviews.filter(r => filter === 'pending' ? !r.is_approved : filter === 'approved' ? r.is_approved : true);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(r => r.student_name.toLowerCase().includes(q) || r.college_name.toLowerCase().includes(q) || r.project_name.toLowerCase().includes(q));
    }
    return r;
  }, [reviews, filter, search]);

  // Recently approved (last 5, sorted by date)
  const recentlyApproved = useMemo(() =>
    [...reviews].filter(r => r.is_approved).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
    [reviews]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Reviews</h2>
          <p className="text-[13px] text-white/30">Approve, reject, or delete reviews.</p>
        </div>
        <div className="flex gap-1 p-1 bg-white/[0.03] rounded-lg border border-border">
          {(['all', 'pending', 'approved'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all capitalize ${filter === f ? 'bg-white/[0.08] text-white' : 'text-white/30 hover:text-white/60'}`}>
              {f} {f === 'pending' && `(${reviews.filter(r => !r.is_approved).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Futuristic Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-2 mt-4">
        {[
          { label: 'Total Reviews', value: reviews.length, color: 'text-white' },
          { label: 'Pending', value: reviews.filter(r => !r.is_approved).length, color: 'text-gold' },
          { label: 'Approved', value: reviews.filter(r => r.is_approved).length, color: 'text-green-400' },
          { label: 'Deleted/Rejected', value: 'N/A', color: 'text-red-400' },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-4 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col justify-center shadow-lg shadow-black/20">
            <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-1">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color} tracking-tight`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
        <input
          type="text"
          placeholder="Search by name, college or project..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-border rounded-xl text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-crimson/30 transition-colors"
        />
      </div>

      {/* Recently Approved Banner */}
      {recentlyApproved.length > 0 && filter === 'all' && !search && (
        <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/15">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-green-400" />
            <p className="text-xs font-bold text-green-400 uppercase tracking-wider">Recently Approved</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentlyApproved.map(r => (
              <button key={r.id} onClick={() => setSelectedReview(r)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-colors">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-crimson/80 to-gold/80 flex items-center justify-center text-white text-[8px] font-bold">
                  {r.student_name[0]}
                </div>
                <span className="text-xs text-green-400 font-medium">{r.student_name}</span>
                <div className="flex gap-0.5">
                  {[...Array(r.rating)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-gold text-gold" />)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? <SpinnerOverlay label="Loading reviews..." /> : (
        <div className="space-y-3">
          {filtered.length > 0 ? filtered.map(r => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl glass-card p-5">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-crimson/80 to-gold/80 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                  {r.student_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <p className="text-[14px] font-medium text-white">{r.student_name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${r.is_approved ? 'bg-green-500/10 text-green-400' : 'bg-gold/10 text-gold'}`}>
                      {r.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-[12px] text-white/25 mb-2">
                    <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {r.college_name}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(r.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[12px] text-crimson/70 mb-1">Project: {r.project_name} ({r.project_type})</p>
                  <div className="flex gap-0.5 mb-2">{[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= r.rating ? 'text-gold fill-gold' : 'text-white/10'}`} />)}</div>
                  <p className="text-[13px] text-white/40 italic line-clamp-2">"{r.experience}"</p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => setSelectedReview(r)} className="p-2 rounded-lg bg-white/[0.03] text-white/25 hover:text-white hover:bg-white/[0.08] transition-all"><Eye className="w-4 h-4" /></button>
                  {!r.is_approved && <button onClick={() => handleApprove(r.id)} className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all"><Check className="w-4 h-4" /></button>}
                  <button onClick={() => handleDelete(r.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </motion.div>
          )) : <p className="text-center py-12 text-white/15 text-[13px]">No {filter !== 'all' ? filter : ''} reviews found</p>}
        </div>
      )}

      {selectedReview && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedReview(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <p className="text-[16px] font-bold text-white">Review Details</p>
              <button onClick={() => setSelectedReview(null)} className="p-1.5 hover:bg-white/[0.05] rounded-lg"><X className="w-4 h-4 text-white/30" /></button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-crimson/80 to-gold/80 flex items-center justify-center text-white font-bold">
                  {selectedReview.student_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div><p className="text-[15px] font-medium text-white">{selectedReview.student_name}</p><p className="text-[12px] text-white/25">{selectedReview.year_of_study} · {selectedReview.college_name}</p></div>
              </div>
              <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} className={`w-5 h-5 ${s <= selectedReview.rating ? 'text-gold fill-gold' : 'text-white/10'}`} />)}</div>
              <div><p className="text-[11px] text-white/20 uppercase tracking-wider mb-1">Project</p><p className="text-[14px] text-white/70">{selectedReview.project_name} ({selectedReview.project_type})</p></div>
              <div><p className="text-[11px] text-white/20 uppercase tracking-wider mb-1">Date</p><p className="text-[14px] text-white/70">{new Date(selectedReview.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
              <div><p className="text-[11px] text-white/20 uppercase tracking-wider mb-1">Experience</p><p className="text-[14px] text-white/50 italic">"{selectedReview.experience}"</p></div>
              {selectedReview.pricing_review && <div><p className="text-[11px] text-white/20 uppercase tracking-wider mb-1">Pricing</p><p className="text-[14px] text-gold/60">{selectedReview.pricing_review}</p></div>}
              {selectedReview.team_members && <div><p className="text-[11px] text-white/20 uppercase tracking-wider mb-1">Team Members</p><p className="text-[14px] text-crimson/60">{selectedReview.team_members}</p></div>}
              <div className="flex gap-2 pt-4 border-t border-border">
                {!selectedReview.is_approved && <button onClick={() => handleApprove(selectedReview.id)} className="flex-1 py-2.5 bg-green-500 text-white text-[13px] font-medium rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-1.5"><Check className="w-4 h-4" /> Approve</button>}
                <button onClick={() => handleDelete(selectedReview.id)} className="flex-1 py-2.5 bg-red-500 text-white text-[13px] font-medium rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-1.5"><X className="w-4 h-4" /> {selectedReview.is_approved ? 'Remove' : 'Reject'}</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

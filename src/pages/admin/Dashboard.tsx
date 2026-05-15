import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FolderOpen, Star, CreditCard, Users, Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { ReviewsDB, PaymentsDB, ProjectsDB, LeadsDB } from '../../utils/storage';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalProjects: 0, pendingReviews: 0, totalReviews: 0, pendingPayments: 0, verifiedPayments: 0, totalPayments: 0, newLeads: 0, totalLeads: 0 });
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const projects = await ProjectsDB.getAll();
      const reviews = await ReviewsDB.getAll();
      const payments = await PaymentsDB.getAll();
      const leads = await LeadsDB.getAll();
      setStats({
        totalProjects: projects.length, totalReviews: reviews.length,
        pendingReviews: reviews.filter(r => !r.is_approved).length,
        totalPayments: payments.length,
        pendingPayments: payments.filter(p => p.status === 'pending').length,
        verifiedPayments: payments.filter(p => p.status === 'verified').length,
        totalLeads: leads.length, newLeads: leads.filter(l => l.status === 'new').length,
      });
      setRecentPayments(payments.slice(-5).reverse());
      setRecentReviews(reviews.filter(r => !r.is_approved).slice(-5));
    })();
  }, []);

  const cards = [
    { title: 'Projects', value: stats.totalProjects, icon: <FolderOpen className="w-5 h-5" />, link: '/admin/projects', color: 'text-blue-400' },
    { title: 'Pending Reviews', value: stats.pendingReviews, sub: `of ${stats.totalReviews}`, icon: <Star className="w-5 h-5" />, link: '/admin/reviews', color: 'text-gold' },
    { title: 'Pending Payments', value: stats.pendingPayments, sub: `${stats.verifiedPayments} verified`, icon: <CreditCard className="w-5 h-5" />, link: '/admin/payments', color: 'text-crimson' },
    { title: 'New Leads', value: stats.newLeads, sub: `of ${stats.totalLeads}`, icon: <Users className="w-5 h-5" />, link: '/admin/leads', color: 'text-green-400' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Welcome back 👋</h2>
        <p className="text-[13px] text-white/30">Here's your Acadomix overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Link to={c.link} className="card-hover block rounded-2xl bg-surface-1 border border-border p-5">
              <div className={`w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center ${c.color} mb-3`}>{c.icon}</div>
              <p className="text-[12px] text-white/30">{c.title}</p>
              <p className="text-2xl font-bold text-white mt-0.5">{c.value}</p>
              {c.sub && <p className="text-[11px] text-white/15">{c.sub}</p>}
              <p className="mt-3 text-[11px] text-crimson flex items-center gap-1">View <ArrowRight className="w-3 h-3" /></p>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Payments */}
        <div className="rounded-2xl bg-surface-1 border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[14px] font-medium text-white">Recent Payments</p>
            <Link to="/admin/payments" className="text-[11px] text-crimson">View All →</Link>
          </div>
          {recentPayments.length > 0 ? recentPayments.map(p => (
            <div key={p.id} className="flex items-center gap-3 py-2.5 border-b border-white/[0.03] last:border-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${p.status === 'pending' ? 'bg-gold/10 text-gold' : p.status === 'verified' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {p.status === 'pending' ? <Clock className="w-3.5 h-3.5" /> : p.status === 'verified' ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-white/70 truncate">{p.student_name}</p>
                <p className="text-[11px] text-white/20 truncate">{p.project_name}</p>
              </div>
              <div className="text-right">
                <p className="text-[13px] font-medium text-white">₹{p.amount}</p>
                <p className={`text-[10px] capitalize ${p.status === 'pending' ? 'text-gold' : p.status === 'verified' ? 'text-green-400' : 'text-red-400'}`}>{p.status}</p>
              </div>
            </div>
          )) : <p className="text-[13px] text-white/15 text-center py-6">No payments yet</p>}
        </div>

        {/* Pending Reviews */}
        <div className="rounded-2xl bg-surface-1 border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[14px] font-medium text-white">Pending Reviews</p>
            <Link to="/admin/reviews" className="text-[11px] text-crimson">View All →</Link>
          </div>
          {recentReviews.length > 0 ? recentReviews.map((r: any) => (
            <div key={r.id} className="flex items-center gap-3 py-2.5 border-b border-white/[0.03] last:border-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-crimson/80 to-gold/80 flex items-center justify-center text-white text-[9px] font-bold">
                {r.student_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-white/70 truncate">{r.student_name}</p>
                <p className="text-[11px] text-white/20 truncate">{r.college_name}</p>
              </div>
              <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} className={`w-2.5 h-2.5 ${s <= r.rating ? 'text-gold fill-gold' : 'text-white/10'}`} />)}</div>
            </div>
          )) : <p className="text-[13px] text-white/15 text-center py-6">No pending reviews</p>}
        </div>
      </div>
    </div>
  );
}

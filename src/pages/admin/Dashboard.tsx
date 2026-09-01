import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FolderOpen, Star, CreditCard, Users, Clock, CheckCircle, AlertCircle, ArrowRight, Eye, Activity, Globe, TrendingUp } from 'lucide-react';
import { ReviewsDB, PaymentsDB, ProjectsDB, LeadsDB, AnalyticsDB } from '../../utils/storage';
import { SpinnerOverlay } from '../../components/Spinner';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalProjects: 0, pendingReviews: 0, totalReviews: 0, pendingPayments: 0, verifiedPayments: 0, totalPayments: 0, newLeads: 0, totalLeads: 0 });
  const [analytics, setAnalytics] = useState<{
    totalViews: number;
    uniqueVisitors: number;
    todayViews: number;
    todayUnique: number;
    history: Array<{ date: string; views: number; visitors: number }>;
    topPages: Array<{ page: string; count: number }>;
  } | null>(null);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [projects, reviews, payments, leads, traffic] = await Promise.allSettled([
        ProjectsDB.getAll(),
        ReviewsDB.getAll(),
        PaymentsDB.getAll(),
        LeadsDB.getAll(),
        AnalyticsDB.getStats(),
      ]);

      const projectsData = projects.status === 'fulfilled' ? projects.value : [];
      const reviewsData = reviews.status === 'fulfilled' ? reviews.value : [];
      const paymentsData = payments.status === 'fulfilled' ? payments.value : [];
      const leadsData = leads.status === 'fulfilled' ? leads.value : [];

      if (traffic.status === 'fulfilled' && traffic.value) {
        setAnalytics(traffic.value);
      }

      setStats({
        totalProjects: projectsData.length,
        totalReviews: reviewsData.length,
        pendingReviews: reviewsData.filter((r: any) => !r.is_approved).length,
        totalPayments: paymentsData.length,
        pendingPayments: paymentsData.filter((p: any) => p.status === 'pending').length,
        verifiedPayments: paymentsData.filter((p: any) => p.status === 'verified').length,
        totalLeads: leadsData.length,
        newLeads: leadsData.filter((l: any) => l.status === 'new').length,
      });

      setRecentPayments(paymentsData.slice(-5).reverse());
      setRecentReviews(reviewsData.filter((r: any) => !r.is_approved).slice(-5));
      setLoading(false);
    })();
  }, []);

  const cards = [
    { title: 'Projects', value: stats.totalProjects, icon: <FolderOpen className="w-5 h-5" />, link: '/admin/projects', color: 'text-blue-400' },
    { title: 'Pending Reviews', value: stats.pendingReviews, sub: `of ${stats.totalReviews}`, icon: <Star className="w-5 h-5" />, link: '/admin/reviews', color: 'text-gold' },
    { title: 'Pending Payments', value: stats.pendingPayments, sub: `${stats.verifiedPayments} verified`, icon: <CreditCard className="w-5 h-5" />, link: '/admin/payments', color: 'text-crimson' },
    { title: 'New Leads', value: stats.newLeads, sub: `of ${stats.totalLeads}`, icon: <Users className="w-5 h-5" />, link: '/admin/leads', color: 'text-green-400' },
  ];

  if (loading) {
    return <SpinnerOverlay label="Aggregating database summaries..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Welcome back 👋</h2>
        <p className="text-[13px] text-white/30">Here's your Acadomix overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Link to={c.link} className="card-hover block rounded-2xl glass-card p-5">
              <div className={`w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center ${c.color} mb-3`}>{c.icon}</div>
              <p className="text-[12px] text-white/30">{c.title}</p>
              <p className="text-2xl font-bold text-white mt-0.5">{c.value}</p>
              {c.sub && <p className="text-[11px] text-white/15">{c.sub}</p>}
              <p className="mt-3 text-[11px] text-crimson flex items-center gap-1">View <ArrowRight className="w-3 h-3" /></p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Traffic & Usage Analytics */}
      {analytics && (
        <div className="rounded-2xl glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[14px] font-medium text-white flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400" /> Live Website Usage & Traffic
              </p>
            </div>
            <span className="text-[11px] text-white/30 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
              Privacy-friendly tracking
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-[11px] text-white/40 flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-blue-400" /> Today's Views</p>
              <p className="text-xl font-bold text-white mt-1">{analytics.todayViews || 0}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-[11px] text-white/40 flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-emerald-400" /> Today's Visitors</p>
              <p className="text-xl font-bold text-white mt-1">{analytics.todayUnique || 0}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-[11px] text-white/40 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-gold" /> Total Page Views</p>
              <p className="text-xl font-bold text-white mt-1">{analytics.totalViews || 0}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-[11px] text-white/40 flex items-center gap-1"><Users className="w-3.5 h-3.5 text-crimson" /> Unique Users</p>
              <p className="text-xl font-bold text-white mt-1">{analytics.uniqueVisitors || 0}</p>
            </div>
          </div>

          {/* Top Pages */}
          {analytics.topPages && analytics.topPages.length > 0 && (
            <div>
              <p className="text-[12px] font-medium text-white/50 mb-2">Most Visited Pages</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {analytics.topPages.map((tp, idx) => (
                  <div key={idx} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.015] border border-white/[0.03] text-xs">
                    <span className="text-white/70 font-mono truncate max-w-[150px]">{tp.page}</span>
                    <span className="text-gold font-bold text-[11px]">{tp.count} views</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Payments */}
        <div className="rounded-2xl glass-card p-5">
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
        <div className="rounded-2xl glass-card p-5">
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

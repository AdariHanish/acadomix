import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Phone, Mail, FileText, ArrowRight, ShieldCheck, Heart, User, Sparkles } from 'lucide-react';
import { PaymentsDB } from '../../utils/storage';
import { Payment } from '../../types';
import { SpinnerOverlay } from '../../components/Spinner';

export default function AdminCustomers() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<'All' | 'Male' | 'Female'>('All');

  useEffect(() => {
    setLoading(true);
    PaymentsDB.getAll().then(data => {
      // Get all verified payments
      const verifiedOnly = data.filter(p => p.status === 'verified');
      setPayments(verifiedOnly);
      setLoading(false);
    });
  }, []);

  // Helper to intelligently infer gender based on common Indian/Telugu name patterns and endings
  const inferGender = (name: string): 'Male' | 'Female' => {
    const n = name.trim().toLowerCase();
    
    // Female specific full name matches or sub-strings
    const femaleTerms = [
      'latha', 'devi', 'lakshmi', 'sri', 'priya', 'valli', 'gowri', 'anjali', 'deepa', 'swathi', 
      'harika', 'mounika', 'ramya', 'sravani', 'kavya', 'divya', 'prasanna', 'sneha', 'soundarya', 
      'saritha', 'anitha', 'padma', 'jyothi', 'suneetha', 'madhavi', 'gouthami', 'hema', 'swetha', 
      'sirisha', 'bhavana', 'pallavi', 'keerthi', 'supriya', 'alekhya', 'tejaswi', 'sindhu', 'sailaja', 
      'vasantha', 'lalitha', 'radha', 'rani', 'bhargavi', 'gayatri', 'sandhya', 'roja', 'manjula', 
      'yamini', 'kalyani', 'dharani', 'amrutha', 'sravya', 'prathyusha', 'jhansi', 'swapna', 'ha', 'ma', 'ni',
      'itha', 'usha'
    ];

    // Male specific matches or endings
    const maleTerms = [
      'kumar', 'rao', 'prasad', 'babu', 'krishna', 'siva', 'ram', 'raj', 'charan', 'vamsi', 'kiran', 
      'teja', 'esh', 'an', 'ar', 'th', 'srinivas', 'venkat', 'satish', 'naidu', 'reddy', 'chowdary',
      'chandra', 'mahesh', 'pavan', 'ravi', 'kalyan', 'harish', 'sai', 'ganesh', 'anil', 'sunil', 'suresh'
    ];

    // Check matches
    for (const term of femaleTerms) {
      if (n.includes(term)) return 'Female';
    }
    for (const term of maleTerms) {
      if (n.includes(term)) return 'Male';
    }

    // Default heuristics based on vowel endings
    if (n.endsWith('a') || n.endsWith('i') || n.endsWith('e') || n.endsWith('y')) {
      return 'Female';
    }
    
    return 'Male'; // Default fallback
  };

  const customersList = useMemo(() => {
    // Group payments by phone/name to represent distinct customers
    const map = new Map<string, {
      name: string;
      phone: string;
      email: string;
      gender: 'Male' | 'Female';
      projects: { name: string; date: string; amount: number }[];
      totalSpent: number;
    }>();

    payments.forEach(p => {
      const key = p.phone.trim();
      const inferredGender = inferGender(p.student_name);
      
      if (!map.has(key)) {
        map.set(key, {
          name: p.student_name,
          phone: p.phone,
          email: p.email,
          gender: inferredGender,
          projects: [],
          totalSpent: 0
        });
      }

      const entry = map.get(key)!;
      entry.projects.push({
        name: p.project_name,
        date: new Date(p.created_at).toLocaleDateString(),
        amount: p.amount
      });
      entry.totalSpent += p.amount;
    });

    return Array.from(map.values());
  }, [payments]);

  const filteredCustomers = useMemo(() => {
    let list = customersList;
    
    if (genderFilter !== 'All') {
      list = list.filter(c => c.gender === genderFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.projects.some(p => p.name.toLowerCase().includes(q))
      );
    }

    return list;
  }, [customersList, search, genderFilter]);

  const stats = useMemo(() => {
    const list = customersList;
    const femaleCount = list.filter(c => c.gender === 'Female').length;
    const maleCount = list.filter(c => c.gender === 'Male').length;
    const totalRevenue = list.reduce((sum, c) => sum + c.totalSpent, 0);
    return { total: list.length, female: femaleCount, male: maleCount, revenue: totalRevenue };
  }, [customersList]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-gold" /> Customers Database
          </h2>
          <p className="text-[13px] text-white/30">Detailed record of active users and acquired project history.</p>
        </div>
        
        {/* Gender Filter Tabs */}
        <div className="flex gap-1 p-1 bg-white/[0.03] rounded-lg border border-border">
          {(['All', 'Male', 'Female'] as const).map(g => (
            <button key={g} onClick={() => setGenderFilter(g)}
              className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${genderFilter === g ? 'bg-gradient-to-r from-crimson to-gold text-white shadow' : 'text-white/30 hover:text-white/60'}`}>
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Clients', value: stats.total, desc: 'Unique Verified Accounts', color: 'text-white' },
          { label: 'Female Clients', value: stats.female, desc: `${((stats.female / (stats.total || 1)) * 100).toFixed(0)}% Gender Ratio`, color: 'text-crimson' },
          { label: 'Male Clients', value: stats.male, desc: `${((stats.male / (stats.total || 1)) * 100).toFixed(0)}% Gender Ratio`, color: 'text-gold' },
          { label: 'Total Revenue Generated', value: `₹${stats.revenue.toLocaleString()}`, desc: 'From Verified Transactions', color: 'text-green-400' },
        ].map((item, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-surface-1 border border-border relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-full blur-2xl" />
            <p className="text-[11px] text-white/20 uppercase font-medium">{item.label}</p>
            <p className={`text-xl sm:text-2xl font-black mt-1 ${item.color}`}>{item.value}</p>
            <p className="text-[10px] text-white/30 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/20" />
        <input
          type="text"
          placeholder="Search by student name, phone, email, or project completed..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-border rounded-xl text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-crimson/30 transition-colors"
        />
      </div>

      {loading ? (
        <SpinnerOverlay label="Loading customers directory..." />
      ) : (
        <div className="space-y-3">
          {filteredCustomers.length > 0 ? filteredCustomers.map((c, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-surface-1 border border-border p-5 relative overflow-hidden hover:border-gold/30 transition-all group">
              
              {/* Gold gradient background layer */}
              <div className="absolute inset-0 bg-gradient-to-r from-crimson/0 to-gold/0 group-hover:from-crimson/[0.02] group-hover:to-gold/[0.02] transition-colors pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
                {/* Profile Meta */}
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shadow-inner flex-shrink-0 ${
                    c.gender === 'Female' 
                      ? 'bg-crimson/10 text-crimson border border-crimson/25 shadow-crimson/10' 
                      : 'bg-gold/10 text-gold border border-gold/25 shadow-gold/10'
                  }`}>
                    {c.gender === 'Female' ? <Sparkles className="w-4 h-4 mr-0.5" /> : <User className="w-4 h-4 mr-0.5" />}
                    {c.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white">{c.name}</p>
                      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        c.gender === 'Female' ? 'bg-crimson/10 text-crimson' : 'bg-gold/10 text-gold'
                      }`}>
                        {c.gender}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-white/30 mt-1">
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {c.phone}</span>
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {c.email}</span>
                    </div>
                  </div>
                </div>

                {/* Projects Accomplished */}
                <div className="flex-1 max-w-md bg-black/35 rounded-xl border border-white/[0.03] p-3 text-[12px] space-y-1.5">
                  <p className="text-[10px] text-white/20 uppercase tracking-wider font-bold">Acquired Projects ({c.projects.length})</p>
                  <div className="divide-y divide-white/[0.04] max-h-[85px] overflow-y-auto no-scrollbar">
                    {c.projects.map((proj, pIdx) => (
                      <div key={pIdx} className="flex justify-between py-1 first:pt-0 last:pb-0 gap-3">
                        <span className="text-white/60 truncate font-medium flex items-center gap-1">
                          <FileText className="w-3 h-3 text-gold/60" /> {proj.name}
                        </span>
                        <span className="text-white/30 flex-shrink-0">{proj.date}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total Stats summary */}
                <div className="text-left md:text-right flex-shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-white/5">
                  <p className="text-[10px] text-white/20 uppercase font-medium">Accumulated Spend</p>
                  <p className="text-lg font-black text-green-400 mt-0.5">₹{c.totalSpent.toLocaleString()}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-white/30 mt-0.5">
                    <ShieldCheck className="w-3 h-3 text-green-400" /> Active Student
                  </span>
                </div>
              </div>
            </motion.div>
          )) : <p className="text-center py-12 text-white/15 text-[13px]">No matching customers found</p>}
        </div>
      )}
    </div>
  );
}

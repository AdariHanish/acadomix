import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Send, ArrowLeft, CheckCircle, Calendar, GraduationCap, Briefcase, Quote, Shield } from 'lucide-react';
import { ReviewsDB } from '../utils/storage';
import { Review } from '../types';
import AppleLoader from '../components/AppleLoader';
import WhatsAppButton from '../components/WhatsAppButton';
import { useScrollHoverFix } from '../hooks/useScrollHoverFix';

const projectTypes = [
  'Mini Project', 'Major Project', 'Website Development', 'Mobile App',
  'Research Paper', 'Assignment', 'IoT Project', 'Custom Project', 'Plagiarism Removal', 'Other',
];

export default function ReviewPage() {
  useScrollHoverFix();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalStudents, setTotalStudents] = useState(1000); // Base count + dynamic
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  
  const [reviewType, setReviewType] = useState<'individual' | 'team'>('individual');
  const [memberCount, setMemberCount] = useState(2);
  const [teamMembers, setTeamMembers] = useState<string[]>(['', '', '', '', '']);

  const [formData, setFormData] = useState({
    student_name: '', college_name: '', year_of_study: '', project_name: '',
    project_type: '', experience: '', pricing_review: '', date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => { 
    ReviewsDB.getApproved().then(data => {
      setReviews(data);
      // Sync logic: Base 1000 + actual approved reviews
      setTotalStudents(1000 + data.length);
      setLoading(false);
    }); 
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      rating,
      team_members: reviewType === 'team' 
        ? teamMembers.slice(0, memberCount).filter(m => m.trim()).join(', ') 
        : ''
    };
    await ReviewsDB.add(finalData as any);
    setSubmitted(true);
    setShowForm(false);
    setFormData({ student_name: '', college_name: '', year_of_study: '', project_name: '', project_type: '', experience: '', pricing_review: '', date: new Date().toISOString().split('T')[0] });
    setRating(5);
    setTeamMembers(['', '', '', '', '']);
  };

  const avg = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '5.0';
  const inputCls = "w-full px-4 py-3 sm:py-3.5 glass-input rounded-xl text-white text-sm sm:text-base placeholder-white/25 focus:outline-none focus:border-crimson/30 transition-all";
  const labelCls = "block text-[10px] sm:text-xs text-white/30 mb-1.5 uppercase tracking-wider font-medium";

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 glass-nav">
        <div className="container-responsive flex items-center justify-between h-14 sm:h-16">
          <Link to="/" className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Home</span>
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <img src="/api/assets?asset_name=logo" alt="Acadomix" className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg" />
            <span className="text-sm sm:text-base font-bold text-white/80">Acado<span className="text-gradient">mix</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/admin" className="p-2 text-white/30 hover:text-crimson transition-colors">
              <Shield className="w-4 h-4" />
            </Link>
            <button onClick={() => setShowForm(!showForm)} className="text-xs sm:text-sm font-semibold text-crimson hover:text-crimson-light transition-colors">
              {showForm ? 'View All' : 'Write Review'}
            </button>
          </div>
        </div>
      </div>

      <div className="container-responsive py-10 sm:py-16">
        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12 sm:mb-16">
          <h1 className="text-section text-white mb-3">Student <span className="text-gradient">Reviews</span></h1>
          <p className="text-sm sm:text-base text-white/35 mb-8">Real feedback from real students.</p>
          
          {/* Stats */}
          <div className="inline-flex items-center gap-4 sm:gap-8 px-6 py-4 glass-card rounded-2xl">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-gradient">{avg}</p>
              <div className="flex gap-0.5 justify-center mt-1">
                {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 sm:w-4 sm:h-4 text-gold fill-gold" />)}
              </div>
              <p className="text-[10px] sm:text-xs text-white/25 mt-1">Average</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-gradient">{totalStudents}+</p>
              <p className="text-[10px] sm:text-xs text-white/25 mt-1">Happy Students</p>
            </div>
          </div>
        </motion.div>

        {/* Success Message */}
        {submitted && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto mb-10 p-5 sm:p-6 rounded-2xl glass-card text-center border border-green-500/20">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-400 mx-auto mb-3" />
            <p className="text-base sm:text-lg font-semibold text-white">Thank you! 🎉</p>
            <p className="text-sm text-white/40 mt-1">Your review will appear once approved.</p>
          </motion.div>
        )}

        {/* Form */}
        {showForm ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
            <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-5 sm:mb-6">Share Your Experience ✍️</h2>
              
              <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5 mb-6">
                <button onClick={() => setReviewType('individual')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${reviewType === 'individual' ? 'bg-white text-black' : 'text-white/30'}`}>INDIVIDUAL</button>
                <button onClick={() => setReviewType('team')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${reviewType === 'team' ? 'bg-white text-black' : 'text-white/30'}`}>TEAM PROJECT</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Rating */}
                <div>
                  <label className={labelCls}>Overall Rating</label>
                  <div className="flex items-center gap-2">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button" onClick={() => setRating(s)} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} className="p-1">
                        <Star className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${s <= (hoverRating || rating) ? 'text-gold fill-gold' : 'text-white/15'}`} />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-white/30">{rating}/5</span>
                  </div>
                </div>

                {reviewType === 'individual' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={labelCls}>Your Name</label><input type="text" required value={formData.student_name} onChange={e => setFormData({...formData, student_name: e.target.value})} placeholder="Full Name" className={inputCls} /></div>
                    <div><label className={labelCls}>College</label><input type="text" required value={formData.college_name} onChange={e => setFormData({...formData, college_name: e.target.value})} placeholder="GVPCE, Vizag" className={inputCls} /></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div><label className={labelCls}>Primary Contact Person</label><input type="text" required value={formData.student_name} onChange={e => setFormData({...formData, student_name: e.target.value})} placeholder="Lead Name" className={inputCls} /></div>
                    <div><label className={labelCls}>College</label><input type="text" required value={formData.college_name} onChange={e => setFormData({...formData, college_name: e.target.value})} placeholder="GVPCE, Vizag" className={inputCls} /></div>
                    
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <label className={labelCls}>How many members in team?</label>
                        <select value={memberCount} onChange={e => setMemberCount(+e.target.value)} className="bg-black border border-white/10 rounded-lg px-2 py-1 text-xs">
                          {[2,3,4,5].map(n => <option key={n} value={n}>{n} Members</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[...Array(memberCount)].map((_, i) => (
                          <div key={i}>
                            <label className="text-[10px] text-white/20 mb-1 block">Member {i + 1} Name</label>
                            <input type="text" required value={teamMembers[i]} onChange={e => {
                              const newMembers = [...teamMembers];
                              newMembers[i] = e.target.value;
                              setTeamMembers(newMembers);
                            }} className={inputCls} placeholder={`Member ${i+1}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={labelCls}>Year of Study</label>
                    <select required value={formData.year_of_study} onChange={e => setFormData({...formData, year_of_study: e.target.value})} className={`${inputCls} [&>option]:bg-surface-2`}>
                      <option value="">Select</option>
                      <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option><option>PG/M.Tech</option><option>Working Professional</option>
                    </select>
                  </div>
                  <div><label className={labelCls}>Completion Date</label><input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className={inputCls} /></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={labelCls}>Project Type</label>
                    <select required value={formData.project_type} onChange={e => setFormData({...formData, project_type: e.target.value})} className={`${inputCls} [&>option]:bg-surface-2`}>
                      <option value="">Select</option>
                      {projectTypes.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div><label className={labelCls}>Project Name</label><input type="text" required value={formData.project_name} onChange={e => setFormData({...formData, project_name: e.target.value})} placeholder="Face Recognition" className={inputCls} /></div>
                </div>

                <div><label className={labelCls}>Your Experience</label><textarea required rows={4} value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} placeholder="How was your experience with Acadomix?" className={`${inputCls} resize-none`} /></div>
                <div><label className={labelCls}>Pricing Feedback (Optional)</label><input type="text" value={formData.pricing_review} onChange={e => setFormData({...formData, pricing_review: e.target.value})} placeholder="Affordable, value for money..." className={inputCls} /></div>

                <button type="submit" className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-crimson to-crimson-dark text-white text-sm sm:text-base font-semibold rounded-xl btn-glow shine flex items-center justify-center gap-2">
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" /> Submit Review
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          <>
            {loading ? (
              <AppleLoader />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                {reviews.map((r, i) => (
                  <motion.div key={r.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col group">
                    <Quote className="w-8 h-8 text-crimson/20 mb-3 group-hover:text-crimson/40 transition-colors" />
                    <p className="text-sm sm:text-base text-white/50 leading-relaxed mb-4 flex-1 italic line-clamp-4">"{r.experience}"</p>
                    {r.pricing_review && <p className="text-xs text-gold/50 mb-3">💰 {r.pricing_review}</p>}
                  
                    <div className="flex gap-0.5 mb-3">
                      {[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= r.rating ? 'text-gold fill-gold' : 'text-white/10'}`} />)}
                    </div>
                  
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg glass text-crimson/70 text-[10px] sm:text-xs font-medium">
                        <Briefcase className="w-3 h-3" /> {r.project_type}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg glass text-white/25 text-[10px] sm:text-xs">
                        <Calendar className="w-3 h-3" /> {new Date(r.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  
                    <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-crimson to-gold flex items-center justify-center text-white text-[10px] sm:text-xs font-bold">
                        {r.student_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white/70">{r.student_name}</p>
                        {r.team_members && (
                          <p className="text-[10px] text-crimson/50 font-bold uppercase tracking-wider">Team: {r.team_members}</p>
                        )}
                        <p className="text-[10px] sm:text-xs text-white/25 flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {r.year_of_study} · {r.college_name}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-[10px] text-white/15">Project: {r.project_name}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="text-center mt-10 sm:mt-12">
              <button onClick={() => setShowForm(true)} className="px-8 py-4 bg-gradient-to-r from-crimson to-crimson-dark text-white text-sm sm:text-base font-semibold rounded-full btn-glow shine">
                Write Your Review ✍️
              </button>
            </div>
          </>
        )}
      </div>
      <WhatsAppButton />
    </div>
  );
}

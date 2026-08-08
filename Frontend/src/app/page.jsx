"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  LayoutDashboard, UserCheck, FileText, BarChart3, Activity, TrendingUp,
  Shield, GraduationCap, User, ArrowRight, Zap, Sparkles,
  Award, Quote, Menu, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLoginClick = () => {
    if (user) {
      const userRole = user.role?.toLowerCase();
      if (userRole === 'admin') router.push('/admin/dashboard');
      else if (userRole === 'teacher') router.push('/teacher/dashboard');
      else router.push('/student/dashboard');
    } else {
      router.push('/login');
    }
  };

  const features = [
    { title: "Unified Admin Command Center", desc: "Manage students, teachers, admins, semesters, and assignments from one central hub.", icon: LayoutDashboard },
    { title: "Teacher Evaluation Suite", desc: "Create activities, grade students, and add qualitative feedback remarks seamlessly.", icon: UserCheck },
    { title: "Personalized Student Reports", desc: "Students can track semester-wise progress and download official soft-skill reports.", icon: FileText },
    { title: "Semester-wise Tracking", desc: "Analyze developmental growth charts and monitor student progress over entire academic years.", icon: BarChart3 },
    { title: "Dynamic Activity Assessment", desc: "Evaluate presentations, group discussions, and teamwork projects.", icon: Activity },
    { title: "Automated Performance Insights", desc: "Identify key strengths and soft-skill gaps using powerful analytics.", icon: TrendingUp }
  ];

  const steps = [
    { title: "Onboard Members", desc: "Administrators onboard students and register faculty evaluators into the platform database." },
    { title: "Assign Mentors", desc: "Admins assign teachers to designated students and classes, granting access to assess them." },
    { title: "Create Activities", desc: "Teachers create soft-skill activities (such as presentations and debates) for their students." },
    { title: "Secure Grading", desc: "Teachers grade performance. Once submitted, grades are cryptographically secured." },
    { title: "Student Tracking", desc: "Students log in to view their marks, read reviews, and track their growth timeline." }
  ];

  const stats = [
    { label: "Active Students", value: "5000+" },
    { label: "Faculty Evaluators", value: "120+" },
    { label: "Activities Hosted", value: "850+" },
    { label: "Reports Generated", value: "12,000+" },
    { label: "Evaluation Semesters", value: "8" },
    { label: "Average Skill Growth", value: "+34%" }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground font-sans overflow-hidden">
      
      {/* ─── Navigation ─── */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-md border-b border-border shadow-sm py-3' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">Soft Skill Analyser</span>
          </div>
          
          <nav className="hidden md:flex gap-8 text-sm font-semibold text-foreground/80">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#workflow" className="hover:text-primary transition-colors">Workflow</a>
            <a href="#stats" className="hover:text-primary transition-colors">Analytics</a>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleLoginClick}
              className="hidden md:flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-semibold hover:opacity-90 transition-opacity shadow-md"
            >
              {user ? 'Dashboard' : 'Sign In'} <ArrowRight className="w-4 h-4" />
            </button>
            <button className="md:hidden text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            <motion.div 
              className="lg:w-1/2 flex flex-col items-start z-10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-full text-sm font-medium mb-8 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                KIET Group of Institutions
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
                Master the skills that <span className="text-primary">get you hired.</span>
              </h1>
              <p className="text-lg md:text-xl text-foreground/70 mb-10 leading-relaxed max-w-xl">
                A unified platform to measure, map, and nurture soft skills and personality development across all semesters. Because technical skills get you the interview, but soft skills get you the job.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button 
                  onClick={handleLoginClick}
                  className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-transform hover:scale-105 shadow-lg"
                >
                  Start Evaluating <ArrowRight className="w-5 h-5" />
                </button>
                <a 
                  href="#features"
                  className="bg-card text-foreground border border-border px-8 py-4 rounded-full font-bold text-center hover:bg-foreground/5 transition-colors"
                >
                  Explore Platform
                </a>
              </div>
            </motion.div>

            {/* Floating Dashboard Graphic */}
            <motion.div 
              className="lg:w-1/2 w-full relative z-10 perspective-1000"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              style={{ y: heroY }}
            >
              <div className="relative w-full aspect-square md:aspect-[4/3] bg-card border border-border rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col gap-6 transform rotate-y-[-5deg] rotate-x-[5deg] hover:rotate-0 transition-transform duration-700">
                
                <div className="flex justify-between items-center border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">AS</div>
                    <div>
                      <h3 className="font-bold text-lg">Aarav Sharma</h3>
                      <p className="text-xs text-foreground/60">B.Tech CS – Sec Alpha</p>
                    </div>
                  </div>
                  <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-sm font-bold border border-green-500/20">Grade: A+</div>
                </div>

                <div className="space-y-5 flex-1">
                  {[
                    { label: 'Communication', val: 92, color: 'bg-blue-500' },
                    { label: 'Teamwork & Synergy', val: 88, color: 'bg-emerald-500' },
                    { label: 'Leadership', val: 85, color: 'bg-purple-500' },
                    { label: 'Delivery', val: 95, color: 'bg-amber-500' }
                  ].map((skill, idx) => (
                    <div key={idx} className="group">
                      <div className="flex justify-between text-sm font-medium mb-2 text-foreground/80">
                        <span>{skill.label}</span>
                        <span>{skill.val}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-border/50 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.val}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.5, delay: 0.5 + (idx * 0.2) }}
                          className={`h-full rounded-full ${skill.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-4 border-t border-border flex justify-between items-center text-xs text-foreground/60">
                  <span className="flex items-center gap-1"><Shield className="w-3 h-3"/> Evaluator Verified</span>
                  <span>Semester VI</span>
                </div>
                
                {/* Floating Elements */}
                <motion.div 
                  className="absolute -right-6 -bottom-6 bg-card border border-border p-4 rounded-xl shadow-xl flex items-center gap-3"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500"><TrendingUp className="w-5 h-5"/></div>
                  <div>
                    <p className="text-xs text-foreground/60">Growth Rate</p>
                    <p className="font-bold text-lg">+34.5%</p>
                  </div>
                </motion.div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─── Features Bento Grid ─── */}
      <section id="features" className="py-24 bg-card/50 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Everything you need to scale.</h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">A complete suite of tools to manage, evaluate, and track student soft skills across the entire university lifecycle.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-card border border-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                  <p className="text-foreground/70 leading-relaxed">{f.desc}</p>
                  
                  {/* Subtle hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Workflow Timeline ─── */}
      <section id="workflow" className="py-24 px-6 relative">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">How It Works</h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">A seamless, secure pipeline from onboarding to final semester reports.</p>
          </div>

          <div className="relative border-l-2 border-border/50 ml-4 md:ml-1/2 space-y-12 pb-8">
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative pl-10 md:pl-0"
              >
                {/* Timeline Dot */}
                <div className="absolute left-[-9px] md:left-1/2 md:-ml-[9px] top-0 w-4 h-4 rounded-full bg-primary ring-4 ring-background shadow-md z-10" />
                
                <div className={`md:w-[45%] ${i % 2 === 0 ? 'md:mr-auto md:pr-12' : 'md:ml-auto md:pl-12'}`}>
                  <div className="bg-card border border-border p-6 rounded-xl shadow-sm hover:border-primary/50 transition-colors">
                    <span className="text-xs font-bold text-primary mb-2 block tracking-wider uppercase">Step 0{i + 1}</span>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-foreground/70">{step.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Statistics ─── */}
      <section id="stats" className="py-24 px-6 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 text-center">
            {stats.map((s, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tighter">{s.value}</div>
                <div className="text-sm font-medium opacity-80 uppercase tracking-wide">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA & Footer ─── */}
      <footer className="bg-card border-t border-border pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-4xl text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Ready to elevate your institution?</h2>
          <p className="text-xl text-foreground/70 mb-10">Join thousands of students and faculty already using the platform.</p>
          <button 
            onClick={handleLoginClick}
            className="bg-primary text-primary-foreground px-10 py-4 rounded-full font-bold text-lg hover:opacity-90 transition-transform hover:scale-105 shadow-xl inline-flex items-center gap-2"
          >
            Get Started Now <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="container mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-12 pt-12 border-t border-border/50 text-sm">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-lg font-bold">Soft Skill Analyser</span>
            </div>
            <p className="text-foreground/60 max-w-xs">A comprehensive profiling platform built for KIET Group of Institutions to assess and build job-ready professional skills.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4 uppercase tracking-wider text-xs text-foreground/50">Navigation</h4>
            <ul className="space-y-3 font-medium text-foreground/80">
              <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#workflow" className="hover:text-primary transition-colors">How it Works</a></li>
              <li><a href="#stats" className="hover:text-primary transition-colors">Platform Metrics</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 uppercase tracking-wider text-xs text-foreground/50">Campus Info</h4>
            <address className="not-italic text-foreground/60 space-y-2">
              <p>KIET Group of Institutions</p>
              <p>Delhi-NCR, Ghaziabad-Meerut Road</p>
              <p>Ghaziabad, Uttar Pradesh, 201206</p>
            </address>
          </div>
        </div>
        <div className="container mx-auto max-w-7xl text-center text-foreground/40 text-xs mt-16 pt-8 border-t border-border/50">
          © {new Date().getFullYear()} Soft Skill Analyser. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

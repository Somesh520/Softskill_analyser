"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, UserCheck, FileText, BarChart3, Activity, TrendingUp,
  Shield, GraduationCap, User, ArrowRight, CheckCircle2, Zap, Sparkles,
  Award, HeartHandshake, BookOpen, Quote
} from 'lucide-react';
import NeoBrutalismCard from '../components/ui/NeoBrutalismCard';
import NeoBrutalismButton from '../components/ui/NeoBrutalismButton';
import NeoBrutalismMarquee from '../components/ui/NeoBrutalismMarquee';

const LandingPage = () => {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);

  const features = [
    {
      title: "Admin Portal",
      description: "Manage students, teachers, admins, semesters, assignments, and platform settings from one unified command center.",
      icon: <LayoutDashboard className="w-8 h-8" strokeWidth={3} />,
      color: "#FFD700"
    },
    {
      title: "Teacher Evaluation",
      description: "Teachers can create soft-skill activities, grade assigned students, allocate scores, and add qualitative feedback remarks.",
      icon: <UserCheck className="w-8 h-8" strokeWidth={3} />,
      color: "#00F5D4"
    },
    {
      title: "Student Reports",
      description: "Students can access their personalized soft-skill dashboards, track semester-wise progress, and download official reports.",
      icon: <FileText className="w-8 h-8" strokeWidth={3} />,
      color: "#F15BB5"
    },
    {
      title: "Semester Tracking",
      description: "Analyze developmental growth charts across different semesters and monitor student progress over time.",
      icon: <BarChart3 className="w-8 h-8" strokeWidth={3} />,
      color: "#9B5DE5"
    },
    {
      title: "Activity Assessment",
      description: "Evaluate students through presentation reviews, group discussions, teamwork projects, and classroom activities.",
      icon: <Activity className="w-8 h-8" strokeWidth={3} />,
      color: "#00BBF9"
    },
    {
      title: "Performance Insights",
      description: "Identify key strengths, soft-skill gaps, and tailored personality improvements using automated assessment data.",
      icon: <TrendingUp className="w-8 h-8" strokeWidth={3} />,
      color: "#FFEEAD"
    }
  ];

  const roles = [
    {
      role: "Admin",
      description: "Onboard students and teachers, map student-teacher assignments, manage semesters, and view aggregate institute reports.",
      icon: <Shield className="w-8 h-8" strokeWidth={2.5} />,
      color: "#FFEB3B"
    },
    {
      role: "Teacher",
      description: "Design custom evaluative activities, grade individual soft-skill parameters, and write comprehensive student feedback.",
      icon: <GraduationCap className="w-8 h-8" strokeWidth={2.5} />,
      color: "#00FFFF"
    },
    {
      role: "Student",
      description: "Access semester-wise skill metrics, review instructor remarks, and explore custom action items for improvement.",
      icon: <User className="w-8 h-8" strokeWidth={2.5} />,
      color: "#C084FC"
    }
  ];

  const skills = [
    "Communication Skills", "Leadership Traits", "Teamwork & Synergy", "Self Confidence", "Analytical Thinking", 
    "Presentation Skills", "Time Management", "Creative Thinking", "Professional Ethics", "Interpersonal Relations"
  ];

  const steps = [
    {
      title: "Onboard Members",
      desc: "Administrators onboard students and register faculty evaluators into the platform database."
    },
    {
      title: "Assign Mentors",
      desc: "Admins assign teachers to designated students and classes, granting mentors exclusive access to assess them."
    },
    {
      title: "Create Activities",
      desc: "Teachers create soft-skill activities (such as presentations, GDs, and debates) for their assigned students."
    },
    {
      title: "Secure Grading",
      desc: "Teachers grade performance and upload marks. Once submitted, these grades are locked and secured so no one can modify them."
    },
    {
      title: "Student Tracking",
      desc: "Students log in to view their soft-skill marks, read teacher reviews, and track their growth timeline."
    }
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
    <div className="bg-[#F9F9F9] min-h-screen text-black font-sans antialiased selection:bg-black selection:text-white">
      {/* Sticky Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white border-b-8 border-black px-6 py-4 flex justify-between items-center" role="banner">
        <div className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <span className="bg-black text-[#FFEB3B] px-3 py-1 border-4 border-black font-black">KIET</span>
          <span className="hidden sm:inline">SOFT SKILL <span className="text-[#FF00FF]">ANALYSER</span></span>
          <span className="sm:hidden text-xs">ANALYSER</span>
        </div>
        <nav className="hidden lg:flex gap-8 font-black uppercase text-sm" aria-label="Main Navigation">
          <a href="#about" className="hover:bg-[#00FFFF] px-3 py-1 border-2 border-transparent hover:border-black transition-all">About</a>
          <a href="#features" className="hover:bg-[#FFD700] px-3 py-1 border-2 border-transparent hover:border-black transition-all">Features</a>
          <a href="#portals" className="hover:bg-[#FF00FF] hover:text-white px-3 py-1 border-2 border-transparent hover:border-black transition-all">Portals</a>
          <a href="#workflow" className="hover:bg-[#00F5D4] px-3 py-1 border-2 border-transparent hover:border-black transition-all">How it Works</a>
          <a href="#stats" className="hover:bg-[#FFEEAD] px-3 py-1 border-2 border-transparent hover:border-black transition-all">Analytics</a>
        </nav>
        <NeoBrutalismButton 
          id="nav-login-btn" 
          variant="primary" 
          onClick={() => router.push('/login')} 
          className="py-2 px-6 text-sm"
        >
          Sign In
        </NeoBrutalismButton>
      </header>

      {/* Hero Section */}
      <section className="relative w-full bg-[#FFEB3B] border-b-8 border-black overflow-hidden py-16 lg:py-24" aria-label="Introduction Hero">
        {/* Background Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, #000 0px, #000 2px, transparent 2px, transparent 24px),
                             repeating-linear-gradient(90deg, #000 0px, #000 2px, transparent 2px, transparent 24px)`,
          }}
        />

        <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Title & CTA */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-black text-[#FFEB3B] px-4 py-2 border-4 border-black mb-6"
              style={{ boxShadow: '4px 4px 0px #000' }}
            >
              <Sparkles className="w-5 h-5 text-[#00FFFF]" />
              <span className="font-black text-xs md:text-sm uppercase tracking-wider">KIET Group of Institutions</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-none tracking-tight text-black"
              style={{
                textShadow: '5px 5px 0px #00FFFF',
                WebkitTextStroke: '2px #000',
              }}
            >
              SOFT SKILL ANALYSER
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-2xl font-bold bg-white border-4 border-black p-6 mb-8 text-black"
              style={{ boxShadow: '8px 8px 0px #000' }}
            >
              Understand, track, and improve student growth beyond engineering and academics. A specialized communication, personality development, and soft skill assessment suite for KIET.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto"
            >
              <NeoBrutalismButton id="hero-get-started-btn" variant="accent" onClick={() => router.push('/login')} className="flex items-center justify-center gap-2">
                Launch Platform <ArrowRight className="w-5 h-5" />
              </NeoBrutalismButton>
              <a 
                id="hero-learn-more-btn"
                href="#features" 
                className="bg-white hover:bg-gray-100 text-black font-black text-lg uppercase border-4 border-black px-8 py-4 transition-all text-center flex items-center justify-center"
                style={{ boxShadow: '4px 4px 0px #000' }}
              >
                Learn More
              </a>
            </motion.div>
          </div>

          {/* Right Column: Live Interactive Mockup */}
          <div className="lg:col-span-5 w-full flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="bg-white border-8 border-black w-full max-w-[420px] p-6 relative overflow-hidden"
              style={{ boxShadow: '14px 14px 0px #000' }}
            >
              {/* Card Header decoration */}
              <div className="flex justify-between items-center border-b-4 border-black pb-4 mb-4">
                <span className="text-sm font-black bg-[#00FFFF] px-3 py-1 border-2 border-black uppercase">KPI REPORT</span>
                <span className="text-xs font-mono font-bold text-gray-500">SEMESTER VI</span>
              </div>

              {/* Student Mock Info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-[#FF00FF] border-2 border-black rounded-full flex items-center justify-center font-black text-white">AS</div>
                <div>
                  <h3 className="font-black text-base uppercase leading-tight">Aarav Sharma</h3>
                  <p className="text-xs font-bold text-gray-600">B.Tech CS – Sec Alpha</p>
                </div>
                <div className="ml-auto bg-[#00FF00] border-2 border-black font-black px-2 py-1 text-sm shadow-[2px_2px_0px_#000]">
                  A+
                </div>
              </div>

              {/* Skill Bars */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-black uppercase mb-1">
                    <span>Communication</span>
                    <span>92%</span>
                  </div>
                  <div className="h-4 bg-gray-200 border-2 border-black">
                    <motion.div 
                      className="h-full bg-[#00FF00]" 
                      initial={{ width: 0 }}
                      animate={{ width: '92%' }}
                      transition={{ duration: 1.5, delay: 1 }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-black uppercase mb-1">
                    <span>Teamwork &amp; Synergy</span>
                    <span>88%</span>
                  </div>
                  <div className="h-4 bg-gray-200 border-2 border-black">
                    <motion.div 
                      className="h-full bg-[#00FFFF]" 
                      initial={{ width: 0 }}
                      animate={{ width: '88%' }}
                      transition={{ duration: 1.5, delay: 1.2 }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-black uppercase mb-1">
                    <span>Leadership &amp; Ownership</span>
                    <span>85%</span>
                  </div>
                  <div className="h-4 bg-gray-200 border-2 border-black">
                    <motion.div 
                      className="h-full bg-[#FF00FF]" 
                      initial={{ width: 0 }}
                      animate={{ width: '85%' }}
                      transition={{ duration: 1.5, delay: 1.4 }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-black uppercase mb-1">
                    <span>Confidence &amp; Delivery</span>
                    <span>95%</span>
                  </div>
                  <div className="h-4 bg-gray-200 border-2 border-black">
                    <motion.div 
                      className="h-full bg-[#FFD700]" 
                      initial={{ width: 0 }}
                      animate={{ width: '95%' }}
                      transition={{ duration: 1.5, delay: 1.6 }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Note */}
              <div className="mt-6 pt-4 border-t-2 border-black border-dashed flex items-center justify-between text-xs font-bold text-gray-700">
                <span>Evaluator: Dr. Verma</span>
                <span className="flex items-center gap-1 text-black font-black uppercase">
                  <Award className="w-4 h-4 text-[#FF00FF]" /> VERIFIED
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <main role="main">
        {/* About Section */}
        <section id="about" className="py-20 px-6 border-b-8 border-black bg-white" aria-label="About Soft Skill Analyser">
          <div className="container mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-[#00FFFF] border-8 border-black p-8 md:p-12 relative"
              style={{ boxShadow: '12px 12px 0px #000' }}
            >
              <h2 className="text-3xl md:text-4xl font-black uppercase mb-6 text-black border-b-4 border-black pb-4">
                Why Soft Skills Matter
              </h2>
              <p className="text-xl md:text-2xl font-bold leading-relaxed text-black">
                Technical skill gets you the interview, but soft skills get you the job. KIET Group of Institutions (Deemed to be University) provides this unified platform to measure, map, and nurture key personal attributes across all student streams.
              </p>
              <div className="mt-8 flex justify-center">
                <div className="bg-black text-[#00FFFF] px-6 py-3 font-black uppercase text-base border-4 border-black shadow-[4px_4px_0px_#FF00FF]">
                  Bridging the Gap Between Academics and Placement
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6 bg-[#F0F0F0] border-b-8 border-black" aria-label="Key Features">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-4xl md:text-6xl font-black uppercase mb-4 text-center">
              Key Features
            </h2>
            <p className="text-center font-bold text-lg mb-16 text-gray-700 max-w-2xl mx-auto">
              Everything you need to run, manage, and track soft-skill training activities across university semesters.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {features.map((f, i) => (
                <article key={i} aria-label={f.title}>
                  <NeoBrutalismCard title={f.title} icon={f.icon} color={f.color}>
                    {f.description}
                  </NeoBrutalismCard>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Marquee Skills */}
        <NeoBrutalismMarquee items={skills} color="#FFEB3B" />

        {/* Role-Based Portals */}
        <section id="portals" className="py-24 px-6 bg-[#7C3AED] border-b-8 border-black" aria-label="Role-Based Portals">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-4xl md:text-6xl font-black uppercase mb-4 text-center text-white" style={{ textShadow: '4px 4px 0px #000', WebkitTextStroke: '2px black' }}>
              Role-Based Portals
            </h2>
            <p className="text-center font-bold text-lg mb-16 text-white max-w-2xl mx-auto uppercase tracking-wide">
              The platform dynamically adapts to three distinct portals for targeted actions.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {roles.map((r, i) => (
                <article key={i} aria-label={`${r.role} Portal`}>
                  <NeoBrutalismCard title={r.role} icon={r.icon} color={r.color}>
                    {r.description}
                  </NeoBrutalismCard>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive How It Works Section */}
        <section id="workflow" className="py-24 px-6 bg-white border-b-8 border-black" aria-label="Operational Workflow">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-4xl md:text-6xl font-black uppercase mb-4 text-center">
              How It Works
            </h2>
            <p className="text-center font-bold text-lg mb-16 text-gray-700 max-w-2xl mx-auto">
              Follow these simple steps to analyze and grade students semester-by-semester.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
              {/* Left side: Timeline Steps */}
              <div className="lg:col-span-6 space-y-4">
                {steps.map((step, i) => (
                  <button 
                    key={i}
                    id={`workflow-step-${i}`}
                    onClick={() => setActiveStep(i)}
                    className={`w-full text-left flex items-center gap-6 border-4 border-black p-5 transition-all outline-none ${
                      activeStep === i 
                        ? 'bg-[#00F5D4] translate-x-2' 
                        : 'bg-white hover:bg-gray-100'
                    }`}
                    style={{ 
                      boxShadow: activeStep === i ? '6px 6px 0px #000' : '3px 3px 0px #000',
                    }}
                  >
                    <div className="bg-black text-white w-10 h-10 flex items-center justify-center text-xl font-black flex-shrink-0">
                      {i + 1}
                    </div>
                    <span className="text-lg font-black uppercase text-black">{step.title}</span>
                  </button>
                ))}
              </div>

              {/* Right side: Detailed Step Box */}
              <div className="lg:col-span-6 flex">
                <div 
                  className="w-full bg-[#FFEEAD] border-8 border-black p-8 flex flex-col justify-center relative"
                  style={{ boxShadow: '10px 10px 0px #000' }}
                >
                  <div className="absolute top-4 right-4 text-8xl font-black text-black opacity-10 font-mono">
                    0{activeStep + 1}
                  </div>
                  <div className="inline-flex items-center gap-2 bg-black text-white px-3 py-1 font-black uppercase text-xs mb-6 w-max">
                    <Zap className="w-4 h-4 text-[#00FFFF]" /> ACTIVE STEP DETAILS
                  </div>
                  <h3 className="text-3xl font-black uppercase mb-4 text-black border-b-2 border-black pb-2">
                    {steps[activeStep].title}
                  </h3>
                  <p className="text-lg font-bold text-black leading-relaxed">
                    {steps[activeStep].desc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section id="stats" className="py-24 px-6 bg-[#FFEEAD] border-b-8 border-black" aria-label="Platform Impact Metrics">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-4xl md:text-6xl font-black uppercase mb-16 text-center">
              Platform Metrics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {stats.map((s, i) => (
                <div 
                  key={i} 
                  className="bg-black text-white p-6 border-4 border-black flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1"
                  style={{ boxShadow: '6px 6px 0px #FF00FF' }}
                >
                  <span className="text-3xl md:text-4xl font-black mb-2 text-[#00FFFF]">{s.value}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-white">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recommendation Testimonial Section */}
        <section className="py-24 px-6 bg-white" aria-label="Endorsements">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl md:text-5xl font-black uppercase mb-12">
              Faculty Endorsement
            </h2>
            
            <div 
              className="bg-black text-white p-8 md:p-12 border-8 border-black text-left relative mb-12"
              style={{ boxShadow: '12px 12px 0px #00F5D4' }}
            >
              <Quote className="w-16 h-16 absolute -top-8 -left-4 text-[#FF00FF] bg-black p-2 border-4 border-black rounded-full" />
              <p className="text-xl md:text-2xl font-bold leading-relaxed mb-6 italic text-[#00FFFF]">
                "Evaluating academic performances is straightforward, but attributes like communication, leadership, and adaptability can be difficult to measure. Soft Skill Analyser has provided us with a clean, structured rubric that empowers our teachers and gives students clear direction for placement preparation."
              </p>
              <div className="border-t-2 border-gray-700 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h4 className="font-black text-lg uppercase">Department of Humanities &amp; Social Sciences</h4>
                  <p className="text-sm font-mono opacity-60">KIET Group of Institutions, Ghaziabad</p>
                </div>
                <div className="bg-[#FF00FF] text-black font-black px-3 py-1 border-2 border-black text-xs uppercase shadow-[2px_2px_0px_#fff]">
                  Official Review
                </div>
              </div>
            </div>

            <h3 className="text-2xl md:text-3xl font-black uppercase mb-8">
              Start evaluating and profiling soft skills today.
            </h3>
            <NeoBrutalismButton 
              id="cta-start-btn" 
              variant="secondary" 
              className="scale-110 md:scale-125" 
              onClick={() => router.push('/login')}
            >
              Get Started Now
            </NeoBrutalismButton>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-16 px-6 border-t-8 border-[#FF00FF]" role="contentinfo">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Logo & Brand description */}
          <div className="md:col-span-5 flex flex-col items-start">
            <div className="text-3xl font-black tracking-tighter mb-4">
              SOFT SKILL <span className="text-[#00FFFF]">ANALYSER</span>
            </div>
            <p className="font-mono text-sm opacity-60 max-w-sm mb-6">
              A comprehensive student profiling platform built specifically for KIET Group of Institutions (Deemed to be University) to assess and build job-ready professional skills.
            </p>
            <div className="flex gap-4">
              <span className="w-8 h-8 bg-white border-2 border-black rounded-full block" />
              <span className="w-8 h-8 bg-[#00FFFF] border-2 border-black rounded-full block" />
              <span className="w-8 h-8 bg-[#FF00FF] border-2 border-black rounded-full block" />
              <span className="w-8 h-8 bg-[#FFEB3B] border-2 border-black rounded-full block" />
            </div>
          </div>

          {/* Quick Links Nav */}
          <div className="md:col-span-3">
            <h4 className="font-black uppercase text-[#FFEB3B] mb-4">Navigation</h4>
            <ul className="space-y-2 font-bold text-sm uppercase">
              <li><a href="#about" className="hover:text-[#00FFFF] transition-colors">About Us</a></li>
              <li><a href="#features" className="hover:text-[#00FFFF] transition-colors">Features</a></li>
              <li><a href="#portals" className="hover:text-[#00FFFF] transition-colors">Portal Access</a></li>
              <li><a href="#workflow" className="hover:text-[#00FFFF] transition-colors">Workflow</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-4 font-mono text-xs opacity-50">
            <h4 className="font-black uppercase text-[#00FFFF] mb-4 text-sm opacity-100">KIET CAMPUS INFO</h4>
            <p className="mb-2">KIET Group of Institutions</p>
            <p className="mb-2">Delhi-NCR, Ghaziabad-Meerut Road</p>
            <p className="mb-4">Ghaziabad, Uttar Pradesh, 201206</p>
            <p className="mt-4">© 2026 SOFT SKILL ANALYSER. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

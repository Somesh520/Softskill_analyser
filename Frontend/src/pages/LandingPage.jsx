import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, UserCheck, FileText, BarChart3, Activity, TrendingUp,
  Shield, GraduationCap, User, ArrowRight, CheckCircle2, Zap
} from 'lucide-react';
import NeoBrutalismHero from '../components/ui/NeoBrutalismHero';
import NeoBrutalismCard from '../components/ui/NeoBrutalismCard';
import NeoBrutalismButton from '../components/ui/NeoBrutalismButton';
import NeoBrutalismMarquee from '../components/ui/NeoBrutalismMarquee';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Admin Portal",
      description: "Manage students, teachers, admins, semesters, assignments, and platform settings from one place.",
      icon: <LayoutDashboard className="w-8 h-8" strokeWidth={3} />,
      color: "#FFD700"
    },
    {
      title: "Teacher Evaluation",
      description: "Teachers can create activities, evaluate assigned students, give scores, and add remarks.",
      icon: <UserCheck className="w-8 h-8" strokeWidth={3} />,
      color: "#00F5D4"
    },
    {
      title: "Student Reports",
      description: "Students can view their own soft-skill reports semester-wise with feedback and performance details.",
      icon: <FileText className="w-8 h-8" strokeWidth={3} />,
      color: "#F15BB5"
    },
    {
      title: "Semester Tracking",
      description: "Track student growth across different semesters and compare improvement over time.",
      icon: <BarChart3 className="w-8 h-8" strokeWidth={3} />,
      color: "#9B5DE5"
    },
    {
      title: "Activity Assessment",
      description: "Evaluate students through presentations, group discussions, teamwork tasks, and classroom activities.",
      icon: <Activity className="w-8 h-8" strokeWidth={3} />,
      color: "#00BBF9"
    },
    {
      title: "Performance Insights",
      description: "Identify strengths, weaknesses, and improvement areas for every student with automated data.",
      icon: <TrendingUp className="w-8 h-8" strokeWidth={3} />,
      color: "#FFEEAD"
    }
  ];

  const roles = [
    {
      role: "Admin",
      description: "Add and manage students, teachers, and admins. Assign teachers to students, manage semesters, and control system settings.",
      icon: <Shield className="w-8 h-8" />,
      color: "#FFEB3B"
    },
    {
      role: "Teacher",
      description: "Create activities, evaluate students, give scores for soft-skill parameters, and generate reports.",
      icon: <GraduationCap className="w-8 h-8" />,
      color: "#00FFFF"
    },
    {
      role: "Student",
      description: "View semester-wise reports, activity scores, teacher remarks, strengths, weaknesses, and improvement suggestions.",
      icon: <User className="w-8 h-8" />,
      color: "#FF00FF"
    }
  ];

  const skills = [
    "Communication", "Leadership", "Teamwork", "Confidence", "Problem Solving", 
    "Presentation Skills", "Time Management", "Creativity", "Discipline", "Professional Behaviour"
  ];

  const steps = [
    "Admin adds students and teachers.",
    "Admin assigns teachers to students.",
    "Teacher creates soft-skill activities.",
    "Teacher evaluates students and adds feedback.",
    "Student views semester-wise soft-skill report."
  ];

  const stats = [
    { label: "Total Students", value: "500+" },
    { label: "Assigned Teachers", value: "50+" },
    { label: "Activities Created", value: "1200+" },
    { label: "Reports Generated", value: "3000+" },
    { label: "Semester Reports", value: "8+" },
    { label: "Average Skill Score", value: "85%" }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <header role="banner" aria-label="Soft Skill Analyser Hero">
        <NeoBrutalismHero 
          title="SOFT SKILL ANALYSER"
          subtitle="KIET Group of Institutions – Communication & Personality Development Tool"
          description="A role-based platform built for KIET Group of Institutions (Deemed to be University), Ghaziabad to evaluate students beyond academics. Track communication, leadership, teamwork, confidence, problem-solving, and professional behaviour through structured semester-wise activities and reports."
          onPrimaryClick={() => navigate('/login')}
          primaryBtnText="Get Started"
          secondaryBtnText="View Demo"
        />
      </header>

      {/* Info Section */}
      <main role="main">
      <section className="py-20 px-6 border-b-8 border-black" aria-label="About Soft Skill Analyser">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="bg-[#00FFFF] border-4 border-black p-10 relative"
            style={{ boxShadow: '12px 12px 0px #000' }}
          >
            <h2 className="sr-only">Why Soft Skills Matter at KIET</h2>
            <p className="text-2xl md:text-3xl font-black uppercase leading-tight text-black">
              Academic marks show knowledge, but they do not show complete student growth. 
              KIET Group of Institutions (Deemed to be University) needs a proper system to measure how students 
              communicate, lead, work in teams, present ideas, and behave professionally.
            </p>
            <div className="mt-8 flex justify-center">
              <div className="bg-black text-white px-6 py-2 font-black uppercase text-xl">
                Soft Skill Analyser helps KIET evaluate student communication &amp; personality
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-[#F0F0F0]" aria-label="Key Features of Soft Skill Analyser">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-5xl md:text-7xl font-black uppercase mb-16 text-center" style={{ textShadow: '4px 4px 0px #00FFFF', WebkitTextStroke: '2px black' }}>
            Key Features
          </h2>
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
      <section className="py-24 px-6 bg-[#FF00FF]" aria-label="Role-Based Portals for KIET">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-5xl md:text-7xl font-black uppercase mb-16 text-center text-white" style={{ textShadow: '4px 4px 0px #000', WebkitTextStroke: '2px black' }}>
            Role-Based Portals
          </h2>
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

      {/* How It Works */}
      <section className="py-24 px-6 bg-white border-y-8 border-black" aria-label="How Soft Skill Analyser Works">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-5xl md:text-6xl font-black uppercase mb-16 text-center">
            How It Works
          </h2>
          <div className="space-y-8">
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                whileHover={{ x: 10 }}
                className="flex items-center gap-6 bg-[#00F5D4] border-4 border-black p-6"
                style={{ boxShadow: '8px 8px 0px #000' }}
              >
                <div className="bg-black text-white w-12 h-12 flex items-center justify-center text-2xl font-black flex-shrink-0">
                  {i + 1}
                </div>
                <p className="text-xl font-black uppercase">{step}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Overview */}
      <section className="py-24 px-6 bg-[#FFEB3B]" aria-label="Dashboard Statistics">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-5xl md:text-7xl font-black uppercase mb-16 text-center">
            Dashboard Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {stats.map((s, i) => (
              <div 
                key={i} 
                className="bg-black text-white p-6 border-4 border-black flex flex-col items-center justify-center text-center"
                style={{ boxShadow: '8px 8px 0px #FF00FF' }}
              >
                <span className="text-3xl font-black mb-2">{s.value}</span>
                <span className="text-xs font-bold uppercase tracking-widest text-[#00FFFF]">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 px-6 bg-white" aria-label="Why Choose Soft Skill Analyser">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-5xl md:text-6xl font-black uppercase mb-8">
            Why Soft Skill Analyser?
          </h2>
          <div className="bg-black text-[#00FFFF] p-10 border-4 border-black mb-12" style={{ boxShadow: '12px 12px 0px #FFD700' }}>
            <p className="text-2xl font-bold leading-relaxed">
              KIET Group of Institutions (Deemed to be University), Ghaziabad uses the Soft Skill Analyser 
              to understand student development beyond marks. It gives teachers a structured way to evaluate 
              communication and interpersonal skills, and gives students clear feedback on 
              how to improve their professional behaviour.
            </p>
          </div>
          <p className="text-3xl font-black uppercase mb-12">
            Build better graduates with measurable soft-skill insights.
          </p>
          <NeoBrutalismButton variant="secondary" className="scale-125">
            Start Analyzing Now
          </NeoBrutalismButton>
        </div>
      </section>

      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-12 px-6 border-t-8 border-[#FF00FF]" role="contentinfo">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-3xl font-black tracking-tighter">
            SOFT SKILL <span className="text-[#00FFFF]">ANALYSER</span>
          </div>
          <nav aria-label="Footer Navigation" className="flex gap-8 font-bold uppercase text-sm">
            <a href="#" className="hover:text-[#FFEB3B]">Privacy</a>
            <a href="#" className="hover:text-[#FFEB3B]">Terms</a>
            <a href="#" className="hover:text-[#FFEB3B]">Contact</a>
          </nav>
          <div className="text-xs font-mono opacity-50">
            <p>© 2026 SOFT SKILL ANALYSER – KIET GROUP OF INSTITUTIONS. BUILT BOLD.</p>
            <p className="mt-1">KIET Deemed to be University, Ghaziabad, UP, India</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

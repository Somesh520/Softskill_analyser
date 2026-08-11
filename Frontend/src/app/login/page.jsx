"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, User, Lock, ExternalLink, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import { loginUser } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const router = useRouter();
  const { user, setUser, loading: authLoading } = useAuth();
  const savedEmail = typeof window !== 'undefined' ? (localStorage.getItem('rememberedEmail') || '') : '';
  const savedPassword = typeof window !== 'undefined' ? (localStorage.getItem('rememberedPassword') || '') : '';
  const [formData, setFormData] = useState({ email: savedEmail, password: savedPassword });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(!!savedEmail);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [isSuccessRedirect, setIsSuccessRedirect] = useState(false);
  const [redirectRole, setRedirectRole] = useState('');
  const turnstileRef = useRef();
  const isSubmitting = useRef(false);

  // Blinkit style rotating text animation
  const animatedWords = ["Communication", "Confidence", "Leadership", "Soft Skills"];
  const [currentWord, setCurrentWord] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % animatedWords.length);
    }, 2500); // Rotate every 2.5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!authLoading && user && !isSuccessRedirect) {
      const userRole = user.role?.toLowerCase();
      if (userRole === 'admin') {
        router.push('/admin/dashboard');
      } else if (userRole === 'teacher') {
        router.push('/teacher/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    }
  }, [user, authLoading, isSuccessRedirect, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting.current) return;
    
    if (!turnstileToken) {
      setError('Please complete the security check.');
      return;
    }

    setError(null);
    setLoading(true);
    isSubmitting.current = true;

    try {
      const data = await loginUser({
        ...formData,
        email: formData.email.trim().toLowerCase(),
        turnstileToken: turnstileToken
      });
      
      const storage = rememberMe ? localStorage : sessionStorage;
      
      storage.setItem('user', JSON.stringify(data));
      setUser(data);

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email.trim().toLowerCase());
        localStorage.setItem('rememberedPassword', formData.password);
        sessionStorage.removeItem('user');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
        localStorage.removeItem('user');
      }

      const userRole = data.role?.toLowerCase();
      setRedirectRole(userRole);
      setIsSuccessRedirect(true);

      setTimeout(() => {
        if (userRole === 'admin') {
          router.push('/admin/dashboard');
        } else if (userRole === 'teacher') {
          router.push('/teacher/dashboard');
        } else {
          router.push('/student/dashboard');
        }
      }, 2000);

    } catch (err) {
      setError(err.message || 'Invalid credentials or server error.');
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  // If already authenticated and redirecting, show nothing or a loading state to prevent flash
  if (!authLoading && user && !isSuccessRedirect) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-border rounded-full border-t-primary animate-spin"></div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-background text-foreground flex flex-col md:flex-row overflow-hidden">
      
      {/* Left Panel: Creative Visual Background */}
      <div className="relative hidden md:flex md:w-1/2 bg-black flex-col justify-between p-12 overflow-hidden border-r border-border/50">
        
        {/* Animated Background Orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-20%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"
        />

        {/* Video Background Fallback/Overlay */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-screen"
        >
          <source src="https://cdn.pixabay.com/video/2023/10/22/186007-876939987_large.mp4" type="video/mp4" />
        </video>

        {/* Dark Overlay & Grid Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-black/90" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        {/* Floating Badges & Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          
          {/* Main Badges */}
          <motion.div 
            animate={{ y: [-15, 15, -15], rotate: [-2, 2, -2] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[12%] right-[10%] bg-primary/10 backdrop-blur-md border border-primary/20 text-white px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xl"
          >
            <span className="text-xl">🚀</span> Leadership
          </motion.div>
          
          <motion.div 
            animate={{ y: [15, -15, 15], rotate: [2, -2, 2] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-[35%] right-[5%] bg-primary/20 backdrop-blur-md border border-primary/30 text-white px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xl"
          >
            <span className="text-xl">💬</span> Communication
          </motion.div>

          <motion.div 
            animate={{ y: [-20, 20, -20], rotate: [-3, 3, -3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[5%] right-[10%] bg-primary/10 backdrop-blur-md border border-primary/20 text-white px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xl"
          >
            <span className="text-xl">✨</span> Confidence
          </motion.div>

          <motion.div 
            animate={{ y: [10, -10, 10], x: [-5, 5, -5], rotate: [-4, 4, -4] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute top-[20%] left-[10%] bg-primary/5 backdrop-blur-md border border-primary/10 text-white/90 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg text-sm"
          >
            <span className="text-lg">📈</span> Growth
          </motion.div>

          <motion.div 
            animate={{ y: [-10, 10, -10], x: [5, -5, 5], rotate: [4, -4, 4] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute top-[25%] right-[40%] bg-primary/5 backdrop-blur-md border border-primary/10 text-white/90 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg text-sm"
          >
            <span className="text-lg">🤝</span> Teamwork
          </motion.div>

          {/* Glowing Particles */}
          <motion.div animate={{ y: [0, -30, 0], opacity: [0.2, 0.8, 0.2] }} transition={{ duration: 3, repeat: Infinity }} className="absolute top-[30%] left-[25%] w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),1)]" />
          <motion.div animate={{ y: [0, 40, 0], opacity: [0.1, 0.6, 0.1] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }} className="absolute top-[50%] right-[40%] w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
          <motion.div animate={{ y: [0, -50, 0], opacity: [0.3, 0.9, 0.3] }} transition={{ duration: 5, repeat: Infinity, delay: 2 }} className="absolute bottom-[25%] left-[15%] w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),1)]" />
          <motion.div animate={{ y: [0, 25, 0], opacity: [0.2, 0.7, 0.2] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }} className="absolute top-[10%] right-[35%] w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-12 h-12 bg-primary/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-primary/40 shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                <Sparkles className="text-primary w-6 h-6" />
             </div>
             <span className="font-extrabold text-2xl text-white tracking-wider drop-shadow-md">Soft Skill Analyser</span>
          </div>
        </div>
        
        {/* Glassmorphism Text Container */}
        <div className="relative z-10 max-w-lg mb-10 bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6 flex flex-col"
          >
            <span>Master your</span>
            <span className="text-primary relative overflow-hidden h-[1.3em] w-full mt-1 drop-shadow-[0_0_15px_rgba(var(--primary),0.4)]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentWord}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -50, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute left-0 top-0 w-full"
                >
                  {animatedWords[currentWord]}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-white/80 text-lg font-medium leading-relaxed"
          >
            Master your soft skills, elevate your confidence, and unlock your true potential in every interaction.
          </motion.p>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 lg:p-12 relative bg-card/30">
        
        {/* Subtle background glow for the form side */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] opacity-50 pointer-events-none" />

        {/* Success Redirect Overlay */}
        {isSuccessRedirect && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="bg-card border border-border rounded-2xl shadow-2xl p-10 text-center max-w-sm w-full relative"
            >
              <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-10 h-10 text-green-500" />
              </div>

              <h2 className="text-2xl font-bold mb-2">Access Granted!</h2>
              <p className="text-sm text-foreground/60 mb-6">Syncing credentials securely...</p>

              <div className="h-2 bg-border rounded-full overflow-hidden mb-4">
                <motion.div 
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.8, ease: "easeInOut" }}
                />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Redirecting to {redirectRole} portal
              </p>
            </motion.div>
          </motion.div>
        )}

        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md relative z-10"
        >
          <button 
            onClick={() => router.push('/')}
            className="mb-8 flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
          </button>

          <div className="mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight mb-3">Welcome Back</h1>
            <p className="text-foreground/60 text-base">Please enter your credentials to continue</p>
          </div>

          {error && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl mb-6 text-sm flex items-center gap-3 font-medium shadow-sm"
            >
              <Lock size={18} /> {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-semibold mb-2">Email Address</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 group-focus-within:text-primary transition-colors z-10">
                  <User size={18} />
                </div>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                  placeholder="name@kiet.edu"
                  required
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-semibold mb-2">Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 group-focus-within:text-primary transition-colors z-10">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl pl-11 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                  placeholder="••••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors p-2 rounded-lg hover:bg-foreground/5"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-between py-2"
            >
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer appearance-none w-4 h-4 border border-border rounded bg-background checked:bg-primary checked:border-primary transition-all cursor-pointer"
                  />
                  <svg className="absolute inset-0 w-4 h-4 text-primary-foreground pointer-events-none opacity-0 peer-checked:opacity-100 p-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span className="text-sm text-foreground/70 group-hover:text-foreground transition-colors font-medium">Remember me</span>
              </label>
              <button 
                type="button"
                onClick={() => router.push('/forgot-password')}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Forgot password?
              </button>
            </motion.div>

            {/* Cloudflare Turnstile */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-background border border-border rounded-xl p-3 flex flex-col items-center justify-center relative shadow-sm"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 mb-2">Security Check</span>
              <Turnstile 
                ref={turnstileRef}
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"} 
                onSuccess={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken(null)}
                onError={() => setError('Security check failed. Please refresh.')}
              />
            </motion.div>

            <motion.button 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              type="submit"
              disabled={loading}
              className={`w-full bg-primary text-primary-foreground font-bold rounded-xl py-3.5 mt-2 flex justify-center items-center gap-2 transition-all shadow-md ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5'}`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default Login;

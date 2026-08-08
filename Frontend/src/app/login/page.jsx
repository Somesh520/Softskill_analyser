"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
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
    <section className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-6 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] opacity-70" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] opacity-70" />
      </div>

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

        <div className="bg-card border border-border rounded-2xl shadow-xl p-8 backdrop-blur-lg">
          <div className="mb-10 text-center">
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Welcome Back</h1>
            <p className="text-foreground/60 text-sm">Please enter your credentials to continue</p>
          </div>

          {error && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-6 text-sm flex items-center gap-2 font-medium"
            >
              <Lock size={16} /> {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2">Email Address</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 group-focus-within:text-primary transition-colors z-10">
                  <User size={18} />
                </div>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="name@kiet.edu"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 group-focus-within:text-primary transition-colors z-10">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl pl-11 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="••••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
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
            </div>

            {/* Cloudflare Turnstile */}
            <div className="bg-background/50 border border-border rounded-xl p-3 flex flex-col items-center justify-center relative">
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 mb-2">Security Check</span>
              <Turnstile 
                ref={turnstileRef}
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"} 
                onSuccess={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken(null)}
                onError={() => setError('Security check failed. Please refresh.')}
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className={`w-full bg-primary text-primary-foreground font-bold rounded-xl py-3.5 mt-2 flex justify-center items-center gap-2 transition-all shadow-md ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 hover:shadow-lg'}`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </section>
  );
};

export default Login;

"use client";
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Lock, KeyRound } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import { forgotPassword, resetPassword } from '../../api/authApi';
import PasswordStrengthField from '../../components/ui/PasswordStrengthField';

const ForgotPassword = () => {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Verify & Reset
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const turnstileRef = useRef();
  const isSubmitting = useRef(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');
      const urlEmail = params.get('email');
      
      if (urlToken) {
        setToken(urlToken);
        if (urlEmail) setEmail(urlEmail);
        setStep(2);
      }
    }
  }, []);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (isSubmitting.current) return;
    
    if (!turnstileToken) {
      setError('Please complete the security check.');
      return;
    }

    setError(null);
    setMessage(null);
    setLoading(true);
    isSubmitting.current = true;

    try {
      const res = await forgotPassword(email, turnstileToken);
      setMessage(res.message);
      setStep(3); // Go to success state
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } catch (err) {
      setError(err.message || 'Failed to request reset link');
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (isSubmitting.current) return;
    
    if (!turnstileToken) {
      setError('Please complete the security check.');
      return;
    }

    setError(null);
    setMessage(null);
    setLoading(true);
    isSubmitting.current = true;

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      isSubmitting.current = false;
      return;
    }

    try {
      const res = await resetPassword(email, token, newPassword, turnstileToken);
      setMessage(res.message);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <section className="min-h-screen bg-background flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <motion.div 
        className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-cyan-100 text-cyan-800 border-[8px] border-black rounded-full" 
        
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="absolute bottom-[10%] left-[-50px] w-48 h-48 bg-purple-100 text-purple-800 border-[8px] border-black" 
        
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <button 
          onClick={() => router.push('/login')}
          className="mb-8 flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Login
        </button>

        <div className="bg-card border border-border rounded-2xl shadow-xl p-8 backdrop-blur-lg" >
          {step !== 3 && (
            <>
              <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-foreground">
                {step === 1 ? 'Forgot Password?' : 'Reset Password'}
              </h1>
              <p className="text-xs font-semibold mb-6 text-yellow-600 bg-yellow-500/10 inline-block px-3 py-1 border border-yellow-500/20 rounded-md uppercase tracking-wider">
                {step === 1 ? "Don't panic! We'll send you a secure reset link." : "Enter your new password below."}
              </p>
            </>
          )}

          {error && (
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#FF0000] text-white font-bold uppercase p-3 border border-border rounded-lg shadow-sm mb-6 text-sm flex items-center gap-2" >
               <Lock size={16} /> {error}
             </motion.div>
          )}

          {message && step !== 3 && (
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-green-500/10 text-green-500 font-medium p-3 border border-green-500/20 rounded-lg mb-6 text-sm flex items-center gap-2" >
               {message}
             </motion.div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">Email Address</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 group-focus-within:text-primary transition-colors z-10"><Mail size={18} /></div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
                    placeholder="student@kiet.edu"
                    required
                  />
                </div>
              </div>

              {/* Turnstile for Step 1 */}
              <div className="flex justify-center py-2">
                <Turnstile 
                  ref={turnstileRef}
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"} 
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                />
              </div>

              <button 
                className={`w-full bg-primary text-primary-foreground font-bold rounded-xl py-3.5 mt-2 flex justify-center items-center gap-2 transition-all shadow-md ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 hover:shadow-lg'}`}
                type="submit"
                disabled={loading}
              >
                {loading ? 'Sending Link...' : 'Send Reset Link'}
              </button>
            </form>
          ) : step === 2 ? (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <p className="text-sm font-medium -mt-4 mb-4 text-foreground/80">Resetting password for <strong className="text-foreground">{email}</strong></p>

              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">New Password</label>
                <PasswordStrengthField value={newPassword} onChange={setNewPassword} />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">Confirm New Password</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 group-focus-within:text-primary transition-colors z-10"><Lock size={18} /></div>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
                    placeholder="Confirm your new password..."
                    required
                  />
                </div>
              </div>

              {/* Turnstile for Step 2 */}
              <div className="flex justify-center py-2">
                <Turnstile 
                  ref={turnstileRef}
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"} 
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                />
              </div>

              <button 
                className={`w-full bg-primary text-primary-foreground font-bold rounded-xl py-3.5 mt-2 flex justify-center items-center gap-2 transition-all shadow-md ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 hover:shadow-lg'}`}
                type="submit"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Reset Password'}
              </button>
            </form>
          ) : (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="text-center py-6"
            >
              <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail size={40} className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-foreground">Check your inbox</h2>
              <p className="text-sm text-foreground/70 mb-8 leading-relaxed">
                We've sent a secure password reset link to <br/>
                <strong className="text-foreground font-semibold">{email}</strong>
              </p>
              
              <div className="bg-background/50 border border-border rounded-xl p-4 mb-6">
                <p className="text-xs text-foreground/60">
                  Didn't receive the email? Check your spam folder or try resending after a few minutes.
                </p>
              </div>

              <button 
                onClick={() => setStep(1)}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Try another email
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  );
};

export default ForgotPassword;

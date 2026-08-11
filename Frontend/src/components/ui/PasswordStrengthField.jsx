"use client";

import { useState, useMemo } from "react";
import { Check, X, Eye, EyeOff, Lock } from "lucide-react";

export default function PasswordStrengthField({ value, onChange }) {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const checkStrength = (pass) => {
    const requirements = [
      { regex: /.{8,}/, text: "At least 8 characters" },
      { regex: /[0-9]/, text: "At least 1 number" },
      { regex: /[a-z]/, text: "At least 1 lowercase letter" },
      { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
      { regex: /[^A-Za-z0-9]/, text: "At least 1 special character" },
    ];

    return requirements.map((req) => ({
      met: req.regex.test(pass),
      text: req.text,
    }));
  };

  const strength = checkStrength(value);

  const strengthScore = useMemo(() => {
    return strength.filter((req) => req.met).length;
  }, [strength]);

  const getStrengthColor = (score) => {
    if (score === 0) return "bg-gray-200";
    if (score <= 2) return "bg-red-500";
    if (score <= 4) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getStrengthText = (score) => {
    if (score === 0) return "Enter a password";
    if (score <= 2) return "Weak password";
    if (score <= 4) return "Medium password";
    return "Strong password";
  };

  return (
    <div className="w-full">
      {/* Password input field with toggle visibility button */}
      <div className="relative mb-3 group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 group-focus-within:text-primary transition-colors z-10">
          <Lock size={18} />
        </div>
        <input
          id="password"
          type={isVisible ? "text" : "password"}
          className="w-full bg-background border border-border rounded-xl pl-11 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
          placeholder="Enter new password..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Password"
          aria-invalid={strengthScore < 5}
          aria-describedby="password-strength"
          required
        />
        {/* Toggle password visibility button */}
        <button
          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center z-20 p-1 cursor-pointer text-foreground/40 hover:text-foreground transition-colors focus:outline-none"
          type="button"
          onClick={toggleVisibility}
          aria-label={isVisible ? "Hide password" : "Show password"}
          aria-pressed={isVisible}
          aria-controls="password"
        >
          {isVisible ? (
            <EyeOff size={16} aria-hidden="true" />
          ) : (
            <Eye size={16} aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Password strength indicator */}
      <div
        className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-3 border border-border/50"
        role="progressbar"
        aria-valuenow={strengthScore}
        aria-valuemin={0}
        aria-valuemax={5}
        aria-label="Password strength"
      >
        <div
          className={`h-full ${getStrengthColor(strengthScore)} transition-all duration-500 ease-out`}
          style={{ width: `${(strengthScore / 5) * 100}%` }}
        ></div>
      </div>

      {/* Password strength description */}
      <p
        id="password-strength"
        className="text-xs font-semibold text-foreground/70 mb-2 uppercase tracking-wide"
      >
        {getStrengthText(strengthScore)}. Must contain:
      </p>

      {/* Password requirements list */}
      <ul className="space-y-1.5 mb-2" aria-label="Password requirements">
        {strength.map((req, index) => (
          <li key={index} className="flex items-center space-x-2">
            {req.met ? (
              <Check
                size={14}
                className="text-emerald-500"
                aria-hidden="true"
              />
            ) : (
              <X size={14} className="text-foreground/30" aria-hidden="true" />
            )}
            <span
              className={`text-[10px] font-bold uppercase ${req.met ? "text-emerald-500" : "text-foreground/50"}`}
            >
              {req.text}
              <span className="sr-only">
                {req.met ? " - Requirement met" : " - Requirement not met"}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

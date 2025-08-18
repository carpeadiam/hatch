'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Email login:', { email, password });
    // Handle email login logic here
  };

  const handleGoogleLogin = () => {
    console.log('Google login');
    // Handle Google login logic here
  };

  const handleSignUp = () => {
    console.log('Navigate to sign up');
    // Handle navigation to sign up page
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo/Illustration */}
        <div className="flex justify-center mb-8">
          <div className="w-[365px] h-[244px] flex items-center justify-center">
            {/* Rocket Launch SVG Illustration */}
            <svg width="365" height="244" viewBox="0 0 365 244" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(50, 20)">
                {/* Clouds */}
                <ellipse cx="80" cy="60" rx="25" ry="15" fill="#008622" opacity="0.3"/>
                <ellipse cx="200" cy="40" rx="30" ry="18" fill="#008622" opacity="0.3"/>
                <ellipse cx="260" cy="80" rx="20" ry="12" fill="#008622" opacity="0.3"/>
                
                {/* Main rocket body */}
                <path d="M150 180 L150 80 Q150 60 165 60 Q180 60 180 80 L180 180 Z" fill="#008622"/>
                
                {/* Rocket nose cone */}
                <path d="M150 80 Q165 40 180 80" fill="#006B1A"/>
                
                {/* Rocket fins */}
                <path d="M140 160 L150 180 L150 160 Z" fill="#006B1A"/>
                <path d="M180 160 L190 160 L180 180 Z" fill="#006B1A"/>
                
                {/* Window */}
                <circle cx="165" cy="100" r="12" fill="#87CEEB"/>
                <circle cx="165" cy="100" r="8" fill="#E6F3FF"/>
                
                {/* Flame/exhaust */}
                <path d="M150 180 Q155 200 165 210 Q175 200 180 180" fill="#FF6B35"/>
                <path d="M155 185 Q160 195 165 200 Q170 195 175 185" fill="#FFD700"/>
                
                {/* Stars */}
                <circle cx="50" cy="30" r="2" fill="#008622"/>
                <circle cx="250" cy="50" r="2" fill="#008622"/>
                <circle cx="280" cy="30" r="2" fill="#008622"/>
                <circle cx="40" cy="80" r="2" fill="#008622"/>
                
                {/* Satellite */}
                <rect x="280" y="20" width="8" height="8" fill="#008622"/>
                <line x1="276" y1="24" x2="292" y2="24" stroke="#008622" strokeWidth="2"/>
                <line x1="284" y1="16" x2="284" y2="32" stroke="#008622" strokeWidth="2"/>
                
                {/* Planet */}
                <circle cx="40" cy="50" r="15" fill="#008622" opacity="0.4"/>
                <path d="M35 45 Q40 50 45 45 Q40 55 35 50" fill="#008622" opacity="0.6"/>
              </g>
            </svg>
          </div>
        </div>

        {/* Hatch Title */}
        <div className="text-center mb-12">
          <h1 
            className="text-[86px] leading-none font-normal text-[#008622]"
            style={{ 
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontVariationSettings: "'opsz' 14, 'wdth' 100"
            }}
          >
            Hatch
          </h1>
        </div>

        {/* Login Form */}
        <div className="space-y-6">
          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-[#232323] text-white rounded-[10px] h-[71px] flex items-center justify-center transition-opacity hover:opacity-90"
          >
            <span 
              className="text-[30px] font-normal"
              style={{ 
                fontFamily: 'Instrument Sans, sans-serif',
                fontVariationSettings: "'wdth' 100"
              }}
            >
              Login with Google
            </span>
          </button>

          {/* Or Divider */}
          <div className="text-center">
            <span 
              className="text-[30px] font-normal text-black"
              style={{ 
                fontFamily: 'Instrument Sans, sans-serif',
                fontVariationSettings: "'wdth' 100"
              }}
            >
              Or
            </span>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-3">
              <label 
                className="block text-[30px] font-normal text-[#413f3f]"
                style={{ 
                  fontFamily: 'Instrument Sans, sans-serif',
                  fontVariationSettings: "'wdth' 100"
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[71px] bg-[#efefef] border border-[#4f4f4f] rounded-[10px] px-6 text-[20px] focus:outline-none focus:ring-2 focus:ring-[#008622] focus:border-transparent"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <label 
                className="block text-[30px] font-normal text-[#413f3f]"
                style={{ 
                  fontFamily: 'Instrument Sans, sans-serif',
                  fontVariationSettings: "'wdth' 100"
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[71px] bg-[#efefef] border border-[#4f4f4f] rounded-[10px] px-6 text-[20px] focus:outline-none focus:ring-2 focus:ring-[#008622] focus:border-transparent"
                required
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-[#008622] text-white rounded-[10px] h-[71px] flex items-center justify-center transition-opacity hover:opacity-90"
            >
              <span 
                className="text-[30px] font-normal"
                style={{ 
                  fontFamily: 'Instrument Sans, sans-serif',
                  fontVariationSettings: "'wdth' 100"
                }}
              >
                Login with email
              </span>
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center pt-4">
            <span 
              className="text-[30px] font-normal text-black"
              style={{ 
                fontFamily: 'Instrument Sans, sans-serif',
                fontVariationSettings: "'wdth' 100"
              }}
            >
              Don't have an account?{' '}
              <button
                onClick={handleSignUp}
                className="font-bold text-[#008622] hover:underline"
                style={{ 
                  fontFamily: 'Instrument Sans, sans-serif',
                  fontVariationSettings: "'wdth' 100"
                }}
              >
                Sign up
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
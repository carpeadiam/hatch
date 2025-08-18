'use client';

import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAqYd-BLAdcsvD-03WByZfcsoSvoGzdKkQ",
  authDomain: "hatch-synap.firebaseapp.com",
  projectId: "hatch-synap",
  storageBucket: "hatch-synap.firebasestorage.app",
  messagingSenderId: "900042075523",
  appId: "1:900042075523:web:786e5cd5f5f63e977c9ab6",
  measurementId: "G-KE5KPPWH9B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const API_BASE_URL = 'https://hatchplatform-dcdphngyewcwcuc4.centralindia-01.azurewebsites.net';

function AuthPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const router = useRouter();

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation for signup
    if (isSignup) {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        setIsLoading(false);
        return;
      }
    }
    try {
      const endpoint = isSignup ? '/signup' : '/login';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `${isSignup ? 'Signup' : 'Login'} failed`);
      }

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      console.log("data_token:", data.token)

      console.log(`${isSignup ? 'Signup' : 'Login'} successful:`, data);
      router.push('/home');
    } catch (error: any) {
      console.error(`${isSignup ? 'Signup' : 'Login'} error:`, error);
      setError(error.message || `Failed to ${isSignup ? 'sign up' : 'sign in'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Google login successful:', result.user);
      
      const googleEmail = result.user.email;
      const firebaseUid = result.user.uid;
      
      if (!googleEmail) {
        throw new Error('No email found in Google account');
      }

      // Try to login first (in case user already exists)
      try {
        const loginResponse = await fetch(`${API_BASE_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: googleEmail,
            password: firebaseUid
          }),
        });
        console.log('email :', googleEmail, " and password :", firebaseUid);
        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          localStorage.setItem('auth_token', loginData.token);
          localStorage.setItem('user', JSON.stringify(loginData.user));
          console.log('Google user logged in successfully');
          router.push('/home');
          return;
        }
      } catch (loginError) {
        console.log('User does not exist, will create new account');
      }

      // If login fails, try to signup (create new user)
      const signupResponse = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: googleEmail,
          password: firebaseUid
        }),
      });

      const signupData = await signupResponse.json();

      if (!signupResponse.ok) {
        throw new Error(signupData.error || 'Failed to create account with Google');
      }

      // Store token and user data
      localStorage.setItem('auth_token', signupData.token);
      localStorage.setItem('user', JSON.stringify(signupData.user));
      
      // Also store Google-specific info
      localStorage.setItem('google_user', JSON.stringify({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      }));
      console.log('Google user signed up successfully');
      router.push('/home');
      
    } catch (error: any) {
      console.error('Google authentication error:', error);
      setError(error.message || 'Failed to authenticate with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  // Don't render until client-side
  if (!isClient) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-md flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008622]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo/Illustration */}
        <div className="flex justify-center mb-6">
          <div className="w-[280px] h-[187px] flex items-center justify-center">
            {/* Rocket Launch SVG Illustration */}
            <svg width="280" height="187" viewBox="0 0 365 244" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <div className="text-center mb-8">
          <h1 
            className="text-[64px] leading-none font-normal text-[#008622]"
            style={{ 
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontVariationSettings: "'opsz' 14, 'wdth' 100"
            }}
          >
            Hatch
          </h1>
        </div>

        {/* Mode Toggle */}
        <div className="text-center mb-6">
          <h2 
            className="text-[28px] font-normal text-[#413f3f]"
            style={{ 
              fontFamily: 'Instrument Sans, sans-serif',
              fontVariationSettings: "'wdth' 100"
            }}
          >
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h2>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[8px]">
            <p className="text-red-600 text-center text-sm">{error}</p>
          </div>
        )}

        {/* Auth Form */}
        <div className="space-y-5">
          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-[#232323] text-white rounded-[8px] h-[56px] flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <span 
              className="text-[22px] font-normal"
              style={{ 
                fontFamily: 'Instrument Sans, sans-serif',
                fontVariationSettings: "'wdth' 100"
              }}
            >
              {isLoading ? 'Please wait...' : `${isSignup ? 'Sign up' : 'Login'} with Google`}
            </span>
          </button>

          {/* Or Divider */}
          <div className="text-center">
            <span 
              className="text-[22px] font-normal text-black"
              style={{ 
                fontFamily: 'Instrument Sans, sans-serif',
                fontVariationSettings: "'wdth' 100"
              }}
            >
              Or
            </span>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <label 
                className="block text-[20px] font-normal text-[#413f3f]"
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
                disabled={isLoading}
                className="w-full h-[50px] bg-[#efefef] border border-[#4f4f4f] rounded-[8px] px-4 text-[16px] focus:outline-none focus:ring-2 focus:ring-[#008622] focus:border-transparent disabled:opacity-50"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label 
                className="block text-[20px] font-normal text-[#413f3f]"
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
                disabled={isLoading}
                className="w-full h-[50px] bg-[#efefef] border border-[#4f4f4f] rounded-[8px] px-4 text-[16px] focus:outline-none focus:ring-2 focus:ring-[#008622] focus:border-transparent disabled:opacity-50"
                required
              />
            </div>

            {/* Confirm Password Field (only for signup) */}
            {isSignup && (
              <div className="space-y-2">
                <label 
                  className="block text-[20px] font-normal text-[#413f3f]"
                  style={{ 
                    fontFamily: 'Instrument Sans, sans-serif',
                    fontVariationSettings: "'wdth' 100"
                  }}
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full h-[50px] bg-[#efefef] border border-[#4f4f4f] rounded-[8px] px-4 text-[16px] focus:outline-none focus:ring-2 focus:ring-[#008622] focus:border-transparent disabled:opacity-50"
                  required
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#008622] text-white rounded-[8px] h-[56px] flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <span 
                className="text-[22px] font-normal"
                style={{ 
                  fontFamily: 'Instrument Sans, sans-serif',
                  fontVariationSettings: "'wdth' 100"
                }}
              >
                {isLoading ? 'Please wait...' : (isSignup ? 'Create Account' : 'Login with email')}
              </span>
            </button>
          </form>

          {/* Toggle Link */}
          <div className="text-center pt-3">
            <span 
              className="text-[20px] font-normal text-black"
              style={{ 
                fontFamily: 'Instrument Sans, sans-serif',
                fontVariationSettings: "'wdth' 100"
              }}
            >
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={toggleMode}
                disabled={isLoading}
                className="font-bold text-[#008622] hover:underline disabled:opacity-50"
                style={{ 
                  fontFamily: 'Instrument Sans, sans-serif',
                  fontVariationSettings: "'wdth' 100"
                }}
              >
                {isSignup ? 'Sign in' : 'Sign up'}
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export as dynamic component to prevent SSR
export default dynamic(() => Promise.resolve(AuthPageContent), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008622]"></div>
      </div>
    </div>
  )
});
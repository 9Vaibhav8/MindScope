import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import {signInWithProvider, googleProvider, microsoftProvider, appleProvider} from "/src/firebase.js";

export default function Auth() {
  const [email, setEmail] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleContinue = async () => {
    if (!email) return;
    
    setLoading(true);
    try {
      
      console.log('Email for magic link:', email);
      
    } catch (error) {
      console.error('Email auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider) => {
  setLoading(true);
  try {
    let providerInstance;
    
    switch(provider.toLowerCase()) {
      case 'google':
        providerInstance = googleProvider;
        break;
      case 'microsoft':
        providerInstance = microsoftProvider;
        break;
      case 'apple':
        providerInstance = appleProvider;
        break;
      default:
        throw new Error('Unsupported provider');
    }

    
    const { user, token } = await signInWithProvider(providerInstance);
    
    
    localStorage.setItem('firebaseToken', token);
    navigate('/chatpage');
    
  } catch (error) {
    console.error(`OAuth error with ${provider}:`, error);
    setLoading(false);
  }
};

  
  React.useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("firebaseToken");
      if (token) {
        try {
          const response = await API.get("/users/profile");
          if (response.data) {
            navigate('/chatpage');
          }
        } catch (error) {
          
          localStorage.removeItem("firebaseToken");
        }
      }
    };

    checkAuthStatus();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
   
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/3 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
     
        <div className="bg-white/3 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/30">
       
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center mb-6">
  <span className="text-2xl font-bold bg-linear-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
    MindScope
  </span>
</div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3">
              Welcome back
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              Log in or sign up to get smarter responses,<br />
              upload files and images, and more.
            </p>
          </div>

          {/* Social Auth Buttons - Compact */}
          <div className="space-y-3 mb-6">
            {[
              { provider: 'Google', icon: 'Google', color: 'hover:border-red-400/30' },
              { provider: 'Microsoft', icon: 'Microsoft', color: 'hover:border-green-400/30' },
              { provider: 'Apple', icon: 'Apple', color: 'hover:border-gray-400/30' },
              { provider: 'Phone', icon: 'Phone', color: 'hover:border-blue-400/30' }
            ].map((item) => (
              <button
                key={item.provider}
                onClick={() => handleSocialAuth(item.provider)}
                disabled={loading}
                className={`w-full group relative bg-white/2 hover:bg-white/5 border border-white/5 ${item.color} rounded-xl p-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-center gap-3">
                  {item.icon === 'Google' && (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  {item.icon === 'Microsoft' && (
                    <svg className="w-4 h-4" viewBox="0 0 23 23">
                      <path fill="#f35325" d="M0 0h11v11H0z"/>
                      <path fill="#81bc06" d="M12 0h11v11H12z"/>
                      <path fill="#05a6f0" d="M0 12h11v11H0z"/>
                      <path fill="#ffba08" d="M12 12h11v11H12z"/>
                    </svg>
                  )}
                  {item.icon === 'Apple' && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                  )}
                  {item.icon === 'Phone' && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                  )}
                  <span className="text-white font-medium text-sm">
                    {loading ? 'Connecting...' : `Continue with ${item.provider}`}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Enhanced Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-linear-to-r from-transparent via-white/10 to-transparent"></div>
            <span className="text-gray-500 text-xs font-medium px-2">OR</span>
            <div className="flex-1 h-px bg-linear-to-r from-transparent via-white/10 to-transparent"></div>
          </div>

          {/* Email Form */}
          <div className="space-y-4">
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={loading}
                className="w-full bg-white/3 border border-white/10 text-white placeholder-gray-400 py-3.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 transition-all duration-300 backdrop-blur-sm text-sm disabled:opacity-50"
              />
              {isFocused && (
                <div className="absolute inset-0 rounded-xl bg-linear-to-r from-blue-500/5 to-purple-500/5 pointer-events-none border border-blue-500/20"></div>
              )}
            </div>

            <button
              onClick={handleContinue}
              disabled={loading || !email}
              className="w-full mask-l-from-black   text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 disabled:opacity-80 disabled:cursor-not-allowed disabled:transform-none text-center text-sm"
            >
              {loading ? 'Sending...' : 'Continue with Email'}
            </button>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 pt-6 border-t border-white/5">
            <Link 
              to="/" 
              className="text-gray-400 hover:text-white text-xs transition-all duration-300 hover:underline inline-flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Stay logged out
            </Link>
          </div>
        </div>

        {/* Legal Text */}
        <p className="text-center text-gray-500 text-xs mt-6 leading-relaxed">
          By continuing, you agree to our{' '}
          <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 hover:underline">Terms</a>{' '}
          and{' '}
          <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 hover:underline">Privacy</a>.
        </p>
      </div>

      
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
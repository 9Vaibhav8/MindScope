import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom"; 
import { onAuthChange, getCurrentUser, logout } from "../src/firebase";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate(); 

 
  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        setIsLoggedIn(true);
       
        const token = await user.getIdToken();
        localStorage.setItem("firebaseToken", token);
        
        
        setUserData({
          name: user.displayName || user.email?.split('@')[0] || "User",
          email: user.email,
          avatar: user.photoURL
        });
      } else {
        setIsLoggedIn(false);
        setUserData(null);
        localStorage.removeItem("firebaseToken");
      }
    });

    
    return () => unsubscribe();
  }, []);

  const handleTryClick = () => {
    if (isLoggedIn) {
      navigate("/chatpage");
    } else {
      navigate("/auth");
    }
  };

  const handleLogoClick = () => {
    navigate("/"); 
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-gray-500" style={{fontFamily: 'Google Sans Display, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", Segoe UI Symbol, "Noto Color Emoji"'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          letter-spacing: -0.02em;
        } `}</style>
        <div className="flex items-center justify-between">
          <div 
            onClick={handleLogoClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleLogoClick();
              }
            }}
            className="text-3xl font-bold bg-linear-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(251,146,60,0.5)] tracking-wide leading-tight hover:opacity-80 transition-opacity rounded cursor-pointer"
          >
            MindScope
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-400 hover:text-white transition-colors tracking-wider letter-spacing-wide leading-relaxed">
              Features
            </a>
            <a href="#about" className="text-sm font-medium text-gray-400 hover:text-white transition-colors tracking-wider letter-spacing-wide leading-relaxed">
              About
            </a>
            <a href="#resources" className="text-sm font-medium text-gray-400 hover:text-white transition-colors tracking-wider letter-spacing-wide leading-relaxed">
              Resources
            </a>
          
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                {userData?.avatar && (
                  <img 
                    src={userData.avatar} 
                    alt={userData.name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <button 
                  onClick={handleTryClick}
                  className="px-6 py-2.5 border border-gray-700 rounded-full hover:bg-white hover:text-black transition-all duration-300 text-sm font-medium tracking-wider letter-spacing-wide text-gray-400 leading-relaxed"
                >
                  Go to Chat
                </button>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={handleTryClick}
                className="px-6 py-2.5 border border-gray-700 rounded-full hover:bg-white hover:text-black transition-all duration-300 text-sm font-medium tracking-wider letter-spacing-wide text-gray-400 leading-relaxed"
              >
                Start Session
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-4">
              <a 
                href="#features" 
                className="text-sm font-medium mask-l-from-black hover:text-white transition-colors tracking-wider letter-spacing-wide leading-relaxed py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FEATURES
              </a>
              <a 
                href="#about" 
                className="text-sm font-medium mask-l-from-black hover:text-white transition-colors tracking-wider letter-spacing-wide leading-relaxed py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ABOUT
              </a>
              <a 
                href="#resources" 
                className="text-sm font-medium mask-l-from-black hover:text-white transition-colors tracking-wider letter-spacing-wide leading-relaxed py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                RESOURCES
              </a>
              <a 
                href="#support" 
                className="text-sm font-medium mask-l-from-black hover:text-white transition-colors tracking-wider letter-spacing-wide leading-relaxed py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                SUPPORT
              </a>
              
              {isLoggedIn ? (
                <>
                  {userData && (
                    <div className="flex items-center gap-3 py-2">
                      {userData.avatar && (
                        <img 
                          src={userData.avatar} 
                          alt={userData.name}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <span className="text-sm text-white">{userData.name}</span>
                    </div>
                  )}
                  <button 
                    onClick={() => {
                      handleTryClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-6 py-2.5 border border-gray-700 rounded-full hover:bg-white hover:text-black transition-all duration-300 font-medium text-sm tracking-wider letter-spacing-wide text-white leading-relaxed w-fit"
                  >
                    GO TO CHAT
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="px-6 py-2.5 text-red-400 hover:text-red-300 transition-colors font-medium text-sm tracking-wider letter-spacing-wide text-left"
                  >
                    LOGOUT
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    handleTryClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-6 py-2.5 border border-gray-700 rounded-full hover:bg-white hover:text-black transition-all duration-300 font-medium text-sm tracking-wider letter-spacing-wide text-white leading-relaxed w-fit"
                >
                  TRY MINDSCOPE
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .letter-spacing-wide {
          letter-spacing: 0.05em;
        }
        .leading-relaxed {
          line-height: 1.625;
        }
        .leading-tight {
          line-height: 1.25;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
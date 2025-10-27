import React, { useState, useRef, useEffect } from "react";
import { ArrowRight, ArrowDown, Loader, Menu, X, Paperclip, Sparkles, Brain, Shield, Zap, Star, MessageCircle, Users, Target, Plus, Trash2 } from "lucide-react";
import Navbar from "../components/Navbar";

const Home = () => {
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLoginTooltip, setShowLoginTooltip] = useState(false);
  const [chats, setChats] = useState([{ id: 1, title: "Current Chat", messages: [] }]);
  const [activeChatId, setActiveChatId] = useState(1);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const createNewChat = () => {
    const newChatId = Date.now();
    const newChat = {
      id: newChatId,
      title: `Chat ${chats.length + 1}`,
      messages: []
    };
    setChats(prev => [...prev, newChat]);
    setActiveChatId(newChatId);
    setMessages([]);
  };

  const deleteChat = (chatId, e) => {
    e.stopPropagation();
    if (chats.length === 1) {
      
      setMessages([]);
      setChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, messages: [] } : chat
      ));
    } else {
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      if (activeChatId === chatId) {
        const remainingChats = chats.filter(chat => chat.id !== chatId);
        setActiveChatId(remainingChats[0].id);
        setMessages(remainingChats[0].messages);
      }
    }
  };

  const switchChat = (chatId) => {
    setActiveChatId(chatId);
    const chat = chats.find(c => c.id === chatId);
    setMessages(chat.messages);
  };

  const handleTryClick = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    const updatedMessages = [...messages, { type: 'user', content: userMessage }];
    setMessages(updatedMessages);
    setInputValue("");
    setLoading(true);

    // Update current chat with user message
    setChats(prev => prev.map(chat => 
      chat.id === activeChatId 
        ? { ...chat, messages: updatedMessages }
        : chat
    ));

    try {
      const formData = new FormData();
      formData.append("text", userMessage);

      const result = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!result.ok) {
        throw new Error(`HTTP error! status: ${result.status}`);
      }

      const data = await result.json();
      const finalMessages = [...updatedMessages, { type: 'assistant', content: data.llm_response }];
      setMessages(finalMessages);
      
      
      setChats(prev => prev.map(chat => 
        chat.id === activeChatId 
          ? { ...chat, messages: finalMessages }
          : chat
      ));
      
    } catch (error) {
      console.error("Error calling API:", error);
      const errorMessages = [...updatedMessages, { type: 'error', content: "Failed to connect to the server. Make sure the backend is running on port 8000." }];
      setMessages(errorMessages);
      setChats(prev => prev.map(chat => 
        chat.id === activeChatId 
          ? { ...chat, messages: errorMessages }
          : chat
      ));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      handleTryClick();
    }
  };



  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer",
      content: "MindScope helped me navigate through work stress with practical, actionable advice.",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      role: "Student",
      content: "The AI understands context better than any other mental health app I've tried.",
      rating: 5
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Therapist",
      content: "An excellent tool for clients to use between sessions. Evidence-based and compassionate.",
      rating: 4
    }
  ];

  const activeChat = chats.find(chat => chat.id === activeChatId);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden relative font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          letter-spacing: -0.02em;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .gradient-border {
          background: linear-gradient(45deg, transparent, transparent),
                    linear-gradient(45deg, #f59e0b, #f97316, #ef4444);
          background-clip: padding-box, border-box;
          background-origin: padding-box, border-box;
          border: 1px solid transparent;
        }
        .gradient-border-blue {
          background: linear-gradient(45deg, transparent, transparent),
                    linear-gradient(45deg, #f59e0b, #f97316, #ef4444);
          background-clip: padding-box, border-box;
          background-origin: padding-box, border-box;
          border: 1px solid transparent;
        }
        .glow-effect {
          box-shadow: 0 0 50px -12px rgba(245, 158, 11, 0.25);
        }
        .gradient-bg {
          background: linear-gradient(135deg, #f59e0b, #f97316, #ef4444);
        }
        .gradient-text {
          background: linear-gradient(135deg, #f59e0b, #f97316, #ef4444);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

    
      <Navbar/>
    
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-linear-to-br from-yellow-600/5 to-red-600/5 rounded-full blur-3xl"></div>
        
       
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[64px_64px] mask-[radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
      </div>

     
      <div className="relative z-10 pt-24 pb-32 min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          {messages.length === 0 ? (
            <>
              
              <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-16">
                <div className="w-full space-y-12">
                  {/* Main Heading */}
                  <div className="text-center space-y-6">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-linear-to-r from-yellow-500/20 to-red-500/20 border border-yellow-500/20 rounded-full mb-4">
                      <Sparkles className="w-5 h-5 text-yellow-400" />
                      <span className="text-sm font-medium text-yellow-300">AI-Powered Mental Wellness</span>
                    </div>
                    <h1 className="text-6xl md:text-7xl font-bold tracking-tight bg-linear-to-br from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                      Your Mind
                      <span className="block bg-linear-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
                        Deserves Clarity
                      </span>
                    </h1>
                    <p className="text-0.5xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-sans letter-spacing-wide tracking-wide">
                      MindScope provides compassionate, intelligent mental health support with advanced emotional understanding and personalized guidance.
                    </p>
                  </div>

                  {/* Search Input */}
                  <div className="max-w-3xl mx-auto">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-linear-to-r from-yellow-400 via-orange-500 to-red-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                      <div className="relative bg-gray-900/80 border border-gray-800 rounded-3xl backdrop-blur-xl overflow-hidden">
                        <div className="flex items-center px-6 py-2">
                          <button
                            onClick={() => setShowLoginTooltip(true)}
                            onMouseLeave={() => setShowLoginTooltip(false)}
                            className="p-3 hover:bg-gray-800 rounded-xl transition-all z-10"
                            title="Please login to attach files"
                          >
                            <Paperclip className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                          </button>
                          
                          {showLoginTooltip && (
                            <div className="absolute left-16 top-full mt-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 whitespace-nowrap z-0">
                              Please login to attach files
                            </div>
                          )}
                          
                          <input
                            type="text"
                            placeholder="What's on your mind today? Share your thoughts..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                            className="flex-1 px-6 py-6 bg-transparent text-xl font-light text-white placeholder-gray-500 focus:outline-none tracking-tight disabled:opacity-50"
                            style={{ fontWeight: 300 }}
                          />
                          <button 
                            onClick={handleTryClick}
                            disabled={loading || !inputValue.trim()}
                            className="p-4 bg-linear-to-r from-yellow-400 via-orange-500 to-red-600 hover:from-yellow-500 hover:via-orange-600 hover:to-red-700 rounded-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed glow-effect"
                          >
                            {loading ? (
                              <Loader className="w-6 h-6 animate-spin" strokeWidth={1} />
                            ) : (
                              <ArrowRight className="w-6 h-6" strokeWidth={1} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  
                </div>

                {/* Scroll Indicator */}
                <div className="flex flex-col items-center gap-3 text-gray-600 animate-bounce">
                  <span className="text-sm font-medium">Explore </span>
                  <ArrowDown className="w-5 h-5" strokeWidth={2} />
                </div>
              </div>

              {/* Features Section */}
              <div className="py-20 space-y-16">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl  font-semibold bg-linear-to-tl from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent ">
                    Why Choose MindScope?
                  </h2>
                  <p className="text-0.4xl text-gray-400 max-w-2xl mx-auto letter-spacing-wide">
                    Advanced AI technology meets compassionate mental health support
                  </p>
                </div>

                
              </div>

              {/* Stats Section with Gradient Background */}
              <div className="py-16 rounded-3xl bg-linear-to-r from-yellow-400/10 via-orange-500/10 to-red-600/10 border border-yellow-500/20">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-white">10K+</div>
                    <div className="text-gray-300">Active Users</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-white">24/7</div>
                    <div className="text-gray-300">Support Available</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-white">98%</div>
                    <div className="text-gray-300">Satisfaction Rate</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-white">50+</div>
                    <div className="text-gray-300">Therapists Network</div>
                  </div>
                </div>
              </div>

              {/* Testimonials */}
              <div className="py-20 space-y-16">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-bold bg-linear-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
                    Trusted by Thousands
                  </h2>
                  <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    Hear what our community has to say about their MindScope journey
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="p-8 border border-gray-800 rounded-2xl bg-gray-900/30 backdrop-blur-xl hover:bg-gray-900/50 transition-all">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${
                              i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
                            }`} 
                          />
                        ))}
                      </div>
                      <p className="text-gray-300 leading-relaxed mb-6">"{testimonial.content}"</p>
                      <div>
                        <div className="font-semibold text-white">{testimonial.name}</div>
                        <div className="text-gray-400 text-sm">{testimonial.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Final CTA */}
              <div className="text-center py-20 space-y-8">
                <h2 className="text-5xl font-bold bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Ready to Start Your Journey?
                </h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                  Join thousands of users who have found clarity and support with MindScope
                </p>
                
              </div>
            </>
          ) : (
            
            <div className="flex gap-5">
              {/* Chat Sidebar */}
             

              {/* Chat Messages */}
              <div className="flex-1">
  <div ref={chatContainerRef} className="flex flex-col items-center space-y-6 py-8">
    {messages.map((message, index) => (
      <div
        key={index}
        className={`flex w-full ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
      >
        {message.type === 'user' ? (
          <div className="max-w-[80%] px-6 py-4 bg-linear-to-r from-yellow-400/10 via-orange-500/10 to-red-600/10 border border-yellow-500/20 rounded-3xl backdrop-blur-xl">
            <p className="text-lg text-gray-100 leading-relaxed">
              {message.content}
            </p>
          </div>
        ) : message.type === 'error' ? (
          <div className="max-w-[80%] px-6 py-4 bg-red-500/10 border border-red-500/20 rounded-3xl backdrop-blur-xl">
            <p className="text-lg text-red-300 leading-relaxed">
              {message.content}
            </p>
          </div>
        ) : (
          <div className="max-w-[80%] px-6 py-4]rounded-3xl backdrop-blur-xl">
            <p className="text-lg text-gray-100 leading-relaxed">
              {message.content}
            </p>
          </div>
        )}
      </div>
    ))}
    {loading && (
      <div className="flex justify-center">
        <div className="flex items-center gap-3 text-gray-400 px-6 py-4 bg-gray-800/30 rounded-3xl">
          <Loader className="w-5 h-5 animate-spin" strokeWidth={1.5} />
          <span className="text-lg">MindScope is thinking...</span>
        </div>
      </div>
    )}
    <div ref={messagesEndRef} />
  </div>
</div>

            </div>
          )}
        </div>
      </div>

      {/* Fixed Input at Bottom (for chat mode) */}
      {messages.length > 0 && (
  <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-xl py-6">
    <div className="max-w-3xl mx-auto px-6">
      <div className="flex justify-center">
        <div className="flex-1 max-w-2xl">
          <div className="relative group">
            <div className="absolute inset-0 bg-linear-to-r from-yellow-400 via-orange-500 to-red-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-gray-900/80 border border-gray-700 rounded-2xl backdrop-blur-xl overflow-hidden">
              <input
                type="text"
                placeholder="Share your thoughts..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="w-full px-6 py-5 bg-transparent text-lg font-light text-white placeholder-gray-500 focus:outline-none tracking-tight disabled:opacity-50"
                style={{ fontWeight: 300 }}
              />
              <button
                onClick={handleTryClick}
                disabled={loading || !inputValue.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-linear-to-r from-yellow-400 via-orange-500 to-red-600 hover:from-yellow-500 hover:via-orange-600 hover:to-red-700 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" strokeWidth={1} />
                ) : (
                  <ArrowRight className="w-5 h-5" strokeWidth={1} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default Home;
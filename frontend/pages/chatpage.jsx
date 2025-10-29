import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom"; 
import { Settings, User, MessageCircle, Search, Sidebar, Lightbulb, LogOut, X, SlidersHorizontal, Brain, Mic, Sun, Image, Clock, Activity, Send, Loader, Heart } from 'lucide-react';
import { auth, onAuthChange, getCurrentUser, formatUserData } from "/src/firebase.js";
import { signOut } from "firebase/auth";
import { fetchUserChats, saveUserChat, updateUserChat } from '../src/api/chatAPI';

export default function ChatPage() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [isListening, setIsListening] = useState(false); 
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isAssessmentMode, setIsAssessmentMode] = useState(false); 

  const [assessmentProgress, setAssessmentProgress] = useState({
    questions_asked: 0,
    total_questions: 5,
    assessment_complete: false,
    current_phase: 'initial'
  });

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    email: "",
    avatar: "",
    isLoggedIn: false
  });

  const handleLogoClick = () => {
    navigate("/"); 
  };

  
  const MENTAL_HEALTH_QUESTIONS = [
    "How have you been sleeping lately? Have you noticed any changes in your sleep patterns?",
    "What's your energy level been like recently? Have you felt more tired or fatigued than usual?",
    "How is your appetite? Have there been any significant changes in your eating habits?",
    "Have you been able to enjoy activities that usually bring you pleasure?",
    "How have you been coping with stress recently? What helps you feel better when you're struggling?"
  ];

  const createChat = async (token, messages, title) => {
    const chatData = {
      title: title?.slice(0, 50) || 'New Chat', 
      messages: messages, 
      createdAt: new Date().toISOString()
    };
    return await saveUserChat(token, chatData);
  };

  const updateChat = async (token, chatId, messages) => {
    return await updateUserChat(token, chatId, messages);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const userData = formatUserData(firebaseUser);
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('firebaseToken', await firebaseUser.getIdToken());
      } else {
        setUser({
          name: "",
          email: "",
          avatar: "",
          isLoggedIn: false
        });
        localStorage.removeItem('user');
        localStorage.removeItem('firebaseToken');
        navigate("/");
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);
    
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('firebaseToken');
    
    if (storedUser && token) {
      try {
        const userData = JSON.parse(storedUser);
        setUser({
          ...userData,
          isLoggedIn: true
        });
      } catch (error) {
        console.error('Error parsing stored user data:', error);
      }
    }
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    const fetchChats = async () => {
      const token = localStorage.getItem('firebaseToken');
      if (!token) return;
      const chats = await fetchUserChats(token);
      setChatHistory(chats);
    };

    if (user.isLoggedIn) fetchChats();
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('firebaseToken');
      setUser({
        name: "",
        email: "",
        avatar: "",
        isLoggedIn: false
      });
      navigate("/");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser. Try Chrome or Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('Voice recognition started');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(prev => prev + ' ' + transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        alert('Microphone permission denied. Please allow microphone access.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
    }
  };

  const sendMessage = async () => {
  if (!inputValue.trim() && selectedFiles.length === 0) return;

  const userMessage = {
    id: Date.now(),
    type: 'user',
    text: inputValue,
    files: selectedFiles,
  };

  const newMessages = [...messages, userMessage];
  setMessages(newMessages);
  setInputValue('');
  setSelectedFiles([]);
  setLoading(true);

  try {
    const formData = new FormData();
    if (inputValue.trim()) formData.append('text', inputValue);
    selectedFiles.forEach((file) => formData.append('files', file));

    if (isAssessmentMode) {
      formData.append('is_assessment_mode', 'true');
      
      // Send assessment progress to backend
      formData.append('assessment_progress', JSON.stringify(assessmentProgress));
    } else {
      formData.append('is_assessment_mode', 'false');
    }
  
    if (sessionId) {
      formData.append('session_id', sessionId);
    }

    const token = localStorage.getItem('firebaseToken');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('http://localhost:8000/analyze', {
      method: 'POST',
      body: formData,
      headers: headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Handle session ID
    if (data.session_id && !sessionId) {
      setSessionId(data.session_id);
    }

    // Handle assessment progress from backend
    if (data.assessment_progress) {
      setAssessmentProgress(data.assessment_progress);
    }

    const aiMessage = {
      id: Date.now() + 1,
      type: 'ai',
      text: data.llm_response,
      sentiment: data.combined_sentiment,
      isAssessmentQuestion: data.assessment_progress && !data.assessment_progress.assessment_complete
    };

    const updatedMessages = [...newMessages, aiMessage];
    setMessages(updatedMessages);

    // Save chat only when assessment is complete or not in assessment mode
    if (data.assessment_progress?.assessment_complete || !isAssessmentMode) {
      if (!activeChatId) {
        const newChat = await createChat(token, updatedMessages, newMessages[0]?.text);
        if (newChat?._id) setActiveChatId(newChat._id);
      } else {
        await updateChat(token, activeChatId, updatedMessages);
      }
    }

  } catch (error) {
    console.error('Error sending message:', error);

    const errorMessage = {
      id: Date.now() + 1,
      type: 'error',
      text: 'Sorry, I encountered an error. Please try again.',
    };

    setMessages(prev => [...prev, errorMessage]);
  } finally {
    setLoading(false);
  }
};

  const startNewAssessment = async () => {
  setMessages([]);
  setActiveChatId(null);
  setSessionId(null);
  setIsAssessmentMode(true);
  setAssessmentProgress({
    questions_asked: 0,
    total_questions: 5,
    assessment_complete: false, 
    current_phase: 'initial'
  });
  
  // Add welcome message
  const welcomeMessage = {
    id: Date.now(),
    type: 'ai',
    text: "Welcome to the Mental Health Check! I'm going to ask you 5 questions to better understand how you've been feeling. Let's begin...",
    isAssessmentQuestion: false
  };
  
  setMessages([welcomeMessage]);
  setLoading(true);

  try {
    const formData = new FormData();
    formData.append('text', 'start assessment');
    formData.append('is_assessment_mode', 'true');
    formData.append('assessment_progress', JSON.stringify({
      questions_asked: 0,
      total_questions: 5,
      assessment_complete: false,
      current_phase: 'initial'
    }));

    const token = localStorage.getItem('firebaseToken');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('http://localhost:8000/analyze', {
      method: 'POST',
      body: formData,
      headers: headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.session_id) {
      setSessionId(data.session_id);
    }

    if (data.assessment_progress) {
      setAssessmentProgress(data.assessment_progress);
    }

    const aiMessage = {
      id: Date.now() + 1,
      type: 'ai',
      text: data.llm_response,
      isAssessmentQuestion: true
    };

    setMessages(prev => [...prev, aiMessage]);

  } catch (error) {
    console.error('Error starting assessment:', error);
    
    const errorMessage = {
      id: Date.now() + 1,
      type: 'error',
      text: 'Sorry, I encountered an error starting the assessment. Please try again.',
    };

    setMessages(prev => [...prev, errorMessage]);
  } finally {
    setLoading(false);
  }
};
  const startNewChat = () => {
    setMessages([]);
    setActiveChatId(null);
    setSessionId(null);
    setIsAssessmentMode(false);
    setAssessmentProgress({
      questions_asked: 0,
      total_questions: 5,
      assessment_complete: true,
      current_phase: 'initial'
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen bg-zinc-950 text-white items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-zinc-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user.isLoggedIn) {
    return (
      <div className="flex h-screen bg-zinc-950 text-white items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-zinc-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-white">
    
      <div className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-stone-950 border-r border-zinc-800 flex flex-col transition-all duration-300 ease-in-out relative z-30`}>
        
       
        <div className={`h-15 flex flex-col ${isSidebarCollapsed ? 'justify-center' : 'justify-start'}`}>
          <button
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
            className={`group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 relative ${
              isSidebarCollapsed ? 'mx-auto' : 'mx-3 mt-3'
            }`}
          >
            {isSidebarCollapsed ? (
              <>
                <Brain className="w-6 h-6 text-white transition-opacity duration-200 group-hover:opacity-0" />
                <Sidebar  className="w-6 h-6 text-white transition-opacity duration-200 opacity-0 group-hover:opacity-100 absolute" />
              </>
            ) : (
              <>
                <Brain 
              
            className="w-6 h-6 text-white" />
                <h1  onClick={handleLogoClick} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleLogoClick();
              }
            }} className="text-white font-semibold text-lg">MindScope</h1>
              </>
            )}
          </button>
        </div>

        
        <div className="flex-1 px-3 space-y-1 py-4">
          {[
            { icon: MessageCircle, label: "New Chat", action: startNewChat },
            { icon: Search, label: "Search Chat" },
            { icon: Heart, label: "Mental Health Check", action: () => {
  setIsAssessmentMode(true);
  setMessages([]);
  setActiveChatId(null);
  setSessionId(null);
  setAssessmentProgress({
    questions_asked: 0,
    total_questions: 5,
    assessment_complete: false,
    current_phase: 'initial'
  });
}},
          
            { icon: Image, label: "Imagine" },
          ].map((item, index) => (
            <button
              key={index}
              onClick={item.action || (() => {
                setMessages([]);
                setActiveChatId(null);
                setSessionId(null);
                setIsAssessmentMode(true);
                setAssessmentProgress({
                  questions_asked: 0,
                  total_questions: 5,
                  assessment_complete: false,
                  current_phase: 'initial'
                });
              })}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                item.active 
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                  : 'hover:bg-zinc-800 hover:text-zinc-200'
              } ${isSidebarCollapsed ? 'justify-center' : ''}`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!isSidebarCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          ))}
        </div>

       {!isSidebarCollapsed && !assessmentProgress.assessment_complete && isAssessmentMode && (
  <div className="px-4 py-3 border-y border-zinc-800 bg-blue-500/5">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-blue-400 font-medium">Mental Health Check</span>
      <span className="text-xs text-blue-300">
        {assessmentProgress.questions_asked}/{assessmentProgress.total_questions}
      </span>
    </div>
    <div className="w-full bg-zinc-700 rounded-full h-2">
      <div 
        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
        style={{ width: `${(assessmentProgress.questions_asked / assessmentProgress.total_questions) * 100}%` }}
      ></div>
    </div>
    <p className="text-xs text-zinc-400 mt-2">
      {assessmentProgress.questions_asked === 0 ? 'Getting started...' : 
       `Question ${assessmentProgress.questions_asked} of ${assessmentProgress.total_questions}`}
    </p>
  </div>
)}

        
        {!isSidebarCollapsed && (
          <div className="mt-4 border-t border-zinc-800 pt-2">
            <div className="flex items-center gap-2 px-4 py-2 text-zinc-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm">History</span>
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-1">
              {chatHistory.length === 0 ? (
                <p className="text-xs text-zinc-600 px-4">No chats yet</p>
              ) : (
                chatHistory.map((chat) => (
                  <button
                    key={chat._id}
                    onClick={() => {
                      setMessages(chat.messages);
                      setActiveChatId(chat._id);
                      setSessionId(null);
                      setIsAssessmentMode(false); 
                      setAssessmentProgress({
                        questions_asked: 0,
                        total_questions: 5,
                        assessment_complete: false,
                        current_phase: 'initial'
                      });
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left hover:bg-zinc-800 ${
                      activeChatId === chat._id
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : ''
                    }`}
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    <span className="truncate text-sm">
                      {chat.title || chat.messages?.[0]?.text?.slice(0, 25) || 'Untitled Chat'}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        
        )}

       
        <div className="p-2 relative" ref={profileMenuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`flex items-center gap-3 w-full hover:bg-zinc-800 rounded-xl p-2 transition-colors ${
              isSidebarCollapsed ? 'justify-center' : ''
            }`}
          >
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
            )}
            {!isSidebarCollapsed && (
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-medium text-white truncate">{user.name || "User"}</div>
              </div>
            )}
          </button>

         
          {showProfileMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowProfileMenu(false)}
              />
              
              <div className={`absolute bottom-full mb-2 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg z-50 ${
                isSidebarCollapsed 
                  ? 'left-full ml-2 w-48' 
                  : 'left-2 right-2'
              }`}>
                <button
                  onClick={() => {
                    setShowSettings(true);
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-700 transition-colors text-left"
                >
                  <Settings className="w-5 h-5" />
                  {!isSidebarCollapsed && <span>Settings</span>}
                  {isSidebarCollapsed && <span>Settings</span>}
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-700 transition-colors text-left border-t border-zinc-700 text-red-400 hover:text-red-300"
                >
                  <LogOut className="w-5 h-5" />
                  {!isSidebarCollapsed && <span>Sign Out</span>}
                  {isSidebarCollapsed && <span>Sign Out</span>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-zinc-950 relative z-20">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 transition-all duration-300 flex flex-col items-center">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-8 text-zinc-400">
              <div className="text-center">
                <h1 className="text-6xl font-bold mb-4  mask-b-from-fuchsia-500">
                  MindScope
                </h1>
                <p className="text-lg text-center mb-8">
                  Start a conversation with your AI mental health companion
                </p>
                
                {isAssessmentMode && (
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-6 max-w-md">
                  <div className="flex items-center gap-3 mb-4">
                    <Heart className="w-8 h-8 text-blue-400" />
                    <h3 className="text-xl font-semibold text-white">Mental Health Check</h3>
                  </div>
                  <p className="text-zinc-300 mb-4">
                    Begin with a brief 5-question assessment to help me understand how you've been feeling. This will help me provide better support.
                  </p>
                  <button
                    onClick={startNewAssessment}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                  >
                    Start Assessment
                  </button>
                </div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full max-w-3xl space-y-8">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col ${
                    message.type === "user" ? "items-end" : "items-start"
                  } w-full`}
                >
                  {message.type === "user" ? (
                    <div className="bg-zinc-800 text-zinc-100 rounded-2xl px-4 py-3 max-w-[75%] wrap-break-words whitespace-pre-wrap leading-relaxed">
                      {message.text}
                      {message.files?.length > 0 && (
                        <div className="mt-3 flex gap-2 flex-wrap">
                          {message.files.map((file, index) => (
                            <div
                              key={index}
                              className="text-xs bg-zinc-700/30 px-2 py-1 rounded"
                            >
                              {file.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full">
                      {message.isAssessmentQuestion && isAssessmentMode && (
                        <div className="flex items-center gap-2 mb-2 text-blue-400 text-sm">
                          <Heart className="w-4 h-4" />
                          <span>Mental Health Check • Question {assessmentProgress.questions_asked} of 5</span>
                        </div>
                      )}
                      <p className="text-zinc-100 text-lg leading-relaxed whitespace-pre-wrap">
                        {message.text}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {loading && (
            <div className="flex justify-start w-full max-w-3xl">
              <div className="flex items-center gap-2 text-zinc-400">
                <Loader className="w-4 h-4 animate-spin" />
                <span>MindScope is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

     
        {selectedFiles.length > 0 && (
          <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-zinc-400">Selected files:</span>
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-1 bg-zinc-800 px-3 py-1 rounded-full text-sm">
                  <span>{file.name}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-zinc-400 hover:text-zinc-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        
        <div className={`p-6 ${messages.length > 0 ? 'flex justify-center' : ''}`}>
          <div className={`${messages.length > 0 ? 'w-full max-w-4xl' : 'max-w-4xl mx-auto'} bg-zinc-900/80 border border-zinc-800 rounded-4xl shadow-2xl backdrop-blur-sm relative`}>
            
            
            {isListening && (
              <div className="absolute left-16 top-1/2 transform -translate-y-1/2 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 3, 2, 1].map((height, index) => (
                    <div
                      key={index}
                      className="w-1 bg-red-400 rounded-full animate-wave"
                      style={{
                        height: `${height * 4}px`,
                        animationDelay: `${index * 0.1}s`
                      }}
                    ></div>
                  ))}
                </div>

                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm animate-pulse whitespace-nowrap">
                  Listening...
                </div>
              </div>
            )}

            <div className="flex items-center px-6 py-4">
              <button
                onClick={handleVoiceInput}
                disabled={loading}
                className={`p-2 rounded-lg transition-all duration-200 relative ${
                  isListening 
                    ? 'text-red-500 bg-red-500/20 scale-110' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                title={isListening ? "Listening... Click to stop" : "Start voice input"}
              >
                <Mic className="w-5 h-5" />
                
                {isListening && (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-red-500 rounded-full animate-ping"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-red-400 rounded-full animate-pulse"></div>
                    </div>
                  </>
                )}
              </button>
              
              <input
                type="text"
                placeholder={isListening ? "" : "What's on your mind?"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress} 
                disabled={loading}
                className="flex-1 bg-transparent text-lg outline-none text-zinc-200 placeholder-zinc-500 px-4 disabled:opacity-50"
              />
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                accept="image/*,audio/*,video/*"
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Image className="w-5 h-5" />
              </button>
              
              <button
                onClick={sendMessage}
                disabled={loading || (!inputValue.trim() && selectedFiles.length === 0)}
                className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-all duration-100 shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      
      {showSettings && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setShowSettings(false)}>
          <div
            className="bg-zinc-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                Settings
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex h-[500px]">
              <div className="w-72 border-r border-zinc-800 p-4 space-y-2">
                {[
                  { icon: User, label: "Account", active: true },
                  { icon: Sun, label: "Appearance" },
                  { icon: Lightbulb, label: "Behavior" },
                  { icon: SlidersHorizontal, label: "Customize" }
                ].map((item, index) => (
                  <button
                    key={index}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      item.active 
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                        : 'hover:bg-zinc-800'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex-1 p-8 overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-semibold">{user.name || "User"}</h3>
                      <p className="text-zinc-400">{user.email || "No email"}</p>
                    </div>
                  </div>
                  <button className="px-6 py-2 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors">
                    Manage
                  </button>
                </div>

                <div className="mb-8">
                  <h4 className="text-lg font-semibold mb-4">Voice Input</h4>
                  <div className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
                    <p className="text-sm text-zinc-400">
                      Supported browsers: Chrome, Edge, Safari
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-8 p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${navigator.onLine ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div>
                      <div className="font-semibold">API Connection</div>
                      <div className="text-sm text-zinc-400">
                        {navigator.onLine ? 'Connected to MindScope API' : 'Offline - check connection'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
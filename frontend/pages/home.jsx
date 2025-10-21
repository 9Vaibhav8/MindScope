import React, { useState, useRef, useEffect } from "react";
import { Menu, X, Send, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar";



const Home = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      content:
        "Hello! I'm here to support your mental health journey. How are you feeling today?",
    },
    {
      id: 2,
      type: "user",
      content: "I've been feeling a bit overwhelmed lately with work stress.",
    },
    {
      id: 3,
      type: "ai",
      content:
        "I hear you, and it's completely valid to feel overwhelmed. Work stress is something many people experience. Would you like to explore some coping strategies together, or would you prefer to talk about what's contributing to these feelings?",
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const chatMessagesRef = useRef(null);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;

    const userMessage = {
      id: messages.length + 1,
      type: "user",
      content: inputValue,
    };

    setMessages([...messages, userMessage]);
    setInputValue("");

    setTimeout(() => {
      const aiMessage = {
        id: messages.length + 2,
        type: "ai",
        content: "Thank you for sharing. I'm here to listen and support you.",
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Navbar />

      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 py-12 lg:py-16">
            {/* Hero Section */}
            <div className="flex flex-col justify-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full w-fit border border-purple-100">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">AI-Powered Mental Health Support</span>
              </div>

              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Your Mental Health
                  </span>
                  <br />
                  <span className="text-gray-900">Companion</span>
                </h1>

                <p className="text-xl text-gray-600 max-w-xl leading-relaxed">
                  AI-powered support for your emotional wellbeing, available 24/7. 
                  Start a conversation and take the first step towards better mental health.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-xl hover:scale-105 transition-all duration-200">
                  Get Started Free
                </button>
                <button className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all duration-200 border border-gray-200">
                  Learn More
                </button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-gray-900">10k+</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">24/7</div>
                  <div className="text-sm text-gray-600">Available</div>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">95%</div>
                  <div className="text-sm text-gray-600">Satisfaction</div>
                </div>
              </div>
            </div>

            {/* Chat Panel */}
            <div className="w-full">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 h-[600px] flex flex-col">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold">
                      AI
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">MindScope AI</h3>
                      <p className="text-white/80 text-sm">Always here to listen</p>
                    </div>
                    <div className="ml-auto">
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-white text-sm font-medium">Online</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div 
                  ref={chatMessagesRef}
                  className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50 to-white"
                >
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.type === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${
                          message.type === "ai"
                            ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white"
                            : "bg-gradient-to-br from-gray-700 to-gray-900 text-white"
                        }`}
                      >
                        {message.type === "ai" ? "AI" : "You"}
                      </div>
                      <div
                        className={`max-w-[75%] ${
                          message.type === "user" ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`px-4 py-3 rounded-2xl ${
                            message.type === "ai"
                              ? "bg-white border border-gray-200 rounded-tl-none shadow-sm"
                              : "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-tr-none"
                          }`}
                        >
                          <p className={`text-sm leading-relaxed ${
                            message.type === "ai" ? "text-gray-800" : "text-white"
                          }`}>
                            {message.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-gray-100">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Type your message..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    <button
                      onClick={handleSendMessage}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
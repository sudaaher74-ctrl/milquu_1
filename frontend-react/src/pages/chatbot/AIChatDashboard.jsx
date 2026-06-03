import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Send, Mic, Sparkles, AlertCircle, RefreshCw, Loader2, Download, Bot, User, ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import api from '../../utils/api';
import { generateDeliveryReportPDF } from '../../utils/reportUtils';

const AIChatDashboard = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hello! I'm your AI Business Assistant. I've analyzed your dashboard. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  
  const synth = window.speechSynthesis;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;
  if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const speakText = (text) => {
    if (synth.speaking) {
      synth.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();
    const femaleVoice = voices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha')) || voices[0];
    if (femaleVoice) utterance.voice = femaleVoice;
    utterance.rate = 1;
    utterance.pitch = 1.2;
    synth.speak(utterance);
  };

  const handleAction = async (action) => {
    if (action === 'download_delivery_report') {
      try {
        const reportRes = await api.get('/api/subscriptions/today-orders');
        generateDeliveryReportPDF(reportRes.data, 'All');
      } catch (err) {
        console.error("Error downloading report", err);
        alert("Could not download the delivery report.");
      }
    }
  };

  const sendMessage = async (text, useVoice = false) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const response = await api.post('/api/ai/chat', { messages: newMessages });
      const data = response.data;

      if (data.success && data.isFrontendMode && data.apiKey) {
        // We received the context and API key from the backend. 
        // Make the Gemini request directly from the browser to bypass Render region blocks.
        let hasInjectedSystemPrompt = false;
        
        // Filter out any previous empty bubbles to avoid breaking the Gemini API
        const validMessages = newMessages.filter(msg => msg.text && msg.text.trim().length > 0);
        
        const formattedHistory = validMessages.map((msg) => {
          let role = msg.role === 'assistant' ? 'model' : 'user';
          let msgText = msg.text;
          
          if (role === 'user' && !hasInjectedSystemPrompt) {
            msgText = data.systemPrompt + "\n\nUser Query: " + msgText;
            hasInjectedSystemPrompt = true;
          }
          
          return { role, parts: [{ text: msgText }] };
        });

        // The REST API uses gemini-1.5-flash for the fastest, most reliable JSON generation
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${data.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: formattedHistory })
        });
        
        const geminiData = await geminiRes.json();
        setIsTyping(false);

        let aiReply = "Sorry, I couldn't understand that.";
        let action = "none";
        
        if (geminiData.candidates && geminiData.candidates[0].content) {
          const rawText = geminiData.candidates[0].content.parts[0].text;
          try {
            const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanText);
            // Robust fallback if the AI uses the wrong JSON key
            aiReply = parsed.reply || parsed.response || parsed.text || parsed.answer || rawText;
            action = parsed.action || 'none';
          } catch(e) {
            aiReply = rawText; // Fallback if not strict JSON
          }
        } else if (geminiData.error) {
          console.error("Gemini Frontend Error:", geminiData.error);
          aiReply = "Google API Error: " + geminiData.error.message;
        }

        // Failsafe in case it's still completely empty
        if (!aiReply || aiReply.trim() === '') {
            aiReply = "I processed your request, but generated an empty response. Please try asking again in a different way.";
        }

        const aiMessage = { role: 'assistant', text: aiReply, action: action !== 'none' ? action : null };
        setMessages(prev => [...prev, aiMessage]);

        if (voiceEnabled || useVoice) speakText(aiReply);
        if (action && action !== 'none') handleAction(action);
        
      } else if (data.success) {
        // Fallback for regular or rule-based response
        setIsTyping(false);
        const aiMessage = { 
          role: 'assistant', 
          text: data.reply,
          action: data.action !== 'none' ? data.action : null
        };
        setMessages(prev => [...prev, aiMessage]);

        if (voiceEnabled || useVoice) speakText(data.reply);
        if (data.action && data.action !== 'none') handleAction(data.action);
      } else {
        setIsTyping(false);
        setMessages(prev => [...prev, { role: 'assistant', text: "I'm sorry, I encountered an error while processing that request." }]);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I am having trouble connecting to my servers right now." }]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input, false);
  };

  const toggleListen = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      if (synth.speaking) synth.cancel();
      if (recognition) {
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setIsListening(false);
          sendMessage(transcript, true);
        };
        recognition.onerror = (event) => {
          console.error("Speech Recognition Error:", event.error);
          setIsListening(false);
        };
        recognition.onend = () => setIsListening(false);
        recognition.start();
      } else {
        alert("Speech recognition is not supported in this browser.");
      }
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-white shadow-sm overflow-hidden relative w-full max-w-full">
      
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin')}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
            title="Back to Admin"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="w-10 h-10 bg-gradient-to-r from-milquu-blue to-indigo-600 rounded-full flex items-center justify-center text-white shadow-md">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-lg">AI Business Assistant</h1>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Online & Analyzing
            </p>
          </div>
        </div>
        
        <button
          onClick={() => {
            if (voiceEnabled && synth.speaking) synth.cancel();
            setVoiceEnabled(!voiceEnabled);
          }}
          className={`p-2 rounded-full transition-colors ${voiceEnabled ? 'text-milquu-blue bg-blue-50' : 'text-gray-400 hover:bg-gray-100'}`}
          title={voiceEnabled ? 'Disable Voice' : 'Enable Voice'}
        >
          {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>

      {/* Chat History Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-gray-50">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-milquu-blue to-indigo-600 flex-shrink-0 flex items-center justify-center text-white mr-3 mt-1 shadow-sm">
                <Bot size={16} />
              </div>
            )}
            
            <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-milquu-blue text-white rounded-br-none' 
                : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
            }`}>
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm max-w-none prose-blue">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.text}</p>
              )}

              {/* Action Buttons inside chat */}
              {msg.action === 'download_delivery_report' && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <button 
                    onClick={() => handleAction('download_delivery_report')}
                    className="flex items-center gap-2 text-sm text-milquu-blue font-medium bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Download size={16} />
                    Download Delivery Report Again
                  </button>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-gray-600 ml-3 mt-1 shadow-sm">
                <User size={16} />
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-milquu-blue to-indigo-600 flex-shrink-0 flex items-center justify-center text-white mr-3 mt-1 shadow-sm">
              <Bot size={16} />
            </div>
            <div className="bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-100 p-4">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-3">
          <button
            type="button"
            onClick={toggleListen}
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isListening ? 'bg-red-100 text-red-500 animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Mic size={20} />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening..." : "Ask me anything about your business..."}
            className="flex-1 bg-gray-100 text-gray-800 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-milquu-blue/50"
            disabled={isListening}
          />
          
          <button
            type="submit"
            disabled={!input.trim() || isTyping || isListening}
            className="flex-shrink-0 w-12 h-12 rounded-full bg-milquu-blue text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            <Send size={18} className="ml-1" />
          </button>
        </form>
        <p className="text-center text-[10px] text-gray-400 mt-3">
          AI can make mistakes. Verify important business metrics from your reports.
        </p>
      </div>
    </div>
  );
};

export default AIChatDashboard;

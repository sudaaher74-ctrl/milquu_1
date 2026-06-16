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
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && !recognitionRef.current) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';
      recognitionRef.current = rec;
    }
  }, []);

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
    
    // Some browsers load voices asynchronously, so we fetch them exactly when needed
    let voices = synth.getVoices();
    
    // Comprehensive list of common female voices across Windows, Mac, Chrome, iOS, and Android
    const femaleNames = ['female', 'zira', 'samantha', 'victoria', 'karen', 'moira', 'tessa', 'veena', 'hazel', 'catherine', 'susan', 'fiona', 'lekha'];
    
    // 1. Try to find an explicit female voice by name
    let femaleVoice = voices.find(v => femaleNames.some(name => v.name.toLowerCase().includes(name)));
    
    // 2. Fallback to Google's standard voices (US/UK English are female by default on many devices)
    if (!femaleVoice) {
      femaleVoice = voices.find(v => v.name.includes('Google UK English Female') || v.name === 'Google US English');
    }
    
    // 3. Fallback to a localized Indian English voice (which is usually female like Veena on Mac)
    if (!femaleVoice) {
      femaleVoice = voices.find(v => v.lang === 'en-IN');
    }
    
    // Assign the selected female voice, otherwise it defaults to the OS standard
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.2; // Slightly higher pitch often sounds more female
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

        // The REST API uses gemini-2.5-flash for the fastest, most reliable JSON generation
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${data.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            contents: formattedHistory,
            tools: [{ googleSearch: {} }] // Enable Google Web Search for real-time market analysis
          })
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
    const recognition = recognitionRef.current;
    
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
      // We don't automatically send here to allow them to edit, 
      // but if they hit Send, it will send normally.
    } else {
      if (synth.speaking) synth.cancel();
      if (recognition) {
        let finalTranscript = '';
        recognition.onstart = () => {
          setIsListening(true);
          setInput(''); // Clear input for fresh speech
        };
        
        recognition.onresult = (event) => {
          let interimTranscript = '';
          let currentFinal = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              currentFinal += event.results[i][0].transcript + ' ';
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          finalTranscript += currentFinal;
          // Update input so they can see what they are saying in real-time
          setInput(finalTranscript + interimTranscript);
        };
        
        recognition.onerror = (event) => {
          console.error("Speech Recognition Error:", event.error);
          setIsListening(false);
        };
        
        recognition.onend = () => {
          setIsListening(false);
          // When it ends (either manually or by long pause), they can hit Send
        };
        
        recognition.start();
      } else {
        alert("Speech recognition is not supported in this browser.");
      }
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-gradient-to-br from-[#FDFBF7] to-white relative overflow-hidden w-full max-w-full">
      
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[120px] bg-milquu-blue/10 opacity-70"></div>
        <div className="absolute bottom-10 -right-20 w-[500px] h-[500px] rounded-full blur-[100px] bg-milquu-gold/20 opacity-60"></div>
      </div>

      {/* Chat Header */}
      <div className="bg-white/70 backdrop-blur-md border-b border-white/60 p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
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
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 relative z-10">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-milquu-blue to-indigo-600 flex-shrink-0 flex items-center justify-center text-white mr-3 mt-1 shadow-sm">
                <Bot size={16} />
              </div>
            )}
            
            <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-sm backdrop-blur-sm ${
              msg.role === 'user' 
                ? 'bg-gradient-to-r from-milquu-blue to-indigo-600 text-white rounded-br-none shadow-[0_4px_15px_rgb(0,0,0,0.1)]' 
                : 'bg-white/80 border border-white/60 text-gray-800 rounded-bl-none shadow-[0_4px_20px_rgb(0,0,0,0.03)]'
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
                <div className="mt-4 pt-3 border-t border-white/40">
                  <button 
                    onClick={() => handleAction('download_delivery_report')}
                    className="flex items-center gap-2 text-sm text-milquu-blue font-bold bg-white/50 px-3 py-2 rounded-lg hover:bg-white transition-colors"
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
            <div className="bg-white/80 backdrop-blur-md border border-white/60 text-gray-800 rounded-2xl rounded-bl-none p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-center gap-2">
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
      <div className="bg-white/70 backdrop-blur-md border-t border-white/60 p-4 relative z-10">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-3">
          <button
            type="button"
            onClick={toggleListen}
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm ${
              isListening ? 'bg-red-50 text-red-500 animate-pulse border border-red-200' : 'bg-white/80 text-gray-600 hover:bg-white border border-white/60'
            }`}
          >
            <Mic size={20} />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening..." : "Ask me anything about your business..."}
            className="flex-1 bg-white/80 backdrop-blur-sm border border-white/60 text-gray-800 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-milquu-gold/50 shadow-sm placeholder-gray-400"
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

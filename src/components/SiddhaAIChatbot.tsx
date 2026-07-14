import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "../context/AppContext";
import { MessageSquare, Send, Loader2, Sparkles, User, HelpCircle, ArrowRight } from "lucide-react";

export default function SiddhaAIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([
    {
      role: "bot",
      text: "Vanakkam! I am Sidha Agathiyar AI, a traditional therapist chatbot trained on ancient Tamil Siddha medical secrets. How can I assist you with natural healing remedies or our herbal products today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Suggested quick prompts the user can tap
  const quickPrompts = [
    "Herbal remedy for cough",
    "Benefits of Nalangu Maavu",
    "How to take Kabasura Kudineer",
    "Traditional tips for digestion",
    "Root causes of sleep loss"
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const textStr = textToSend || input;
    if (!textStr.trim() || sending) return;

    if (!textToSend) setInput("");
    setSending(true);

    const updatedUserMsgs = [...messages, { role: "user" as const, text: textStr }];
    setMessages(updatedUserMsgs);

    try {
      const chatHistoryForAPI = updatedUserMsgs.slice(-5).map(m => ({
        role: m.role === "user" ? "user" : "model",
        text: m.text
      }));

      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textStr, chatHistory: chatHistoryForAPI })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: "bot", text: data.response }]);
      } else {
        setMessages(prev => [...prev, { role: "bot", text: "I experienced a connection issue reaching Agathiyar. Please retry your traditional query." }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: "bot", text: "Server connection timed out. Please try again later." }]);
    } finally {
      setSending(false);
    }
  };

  const handleQuickPromptClick = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <div className="fixed bottom-6 right-6 z-45">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl border border-emerald-100 flex flex-col w-85 sm:w-96 h-136 sm:h-144 overflow-hidden glow-green mb-4"
          >
            {/* Header */}
            <div className="bg-siddha-dark p-4 flex items-center justify-between text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-800 rounded-full filter blur-2xl opacity-40 -mr-6 -mt-6"></div>
              <div className="flex items-center space-x-3 z-10">
                <div className="w-10 h-10 rounded-full bg-siddha-light flex items-center justify-center border border-emerald-700">
                  <Sparkles className="w-5 h-5 text-siddha-dark animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-display leading-tight flex items-center">
                    Agathiyar Siddha AI
                    <span className="ml-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  </h3>
                  <p className="text-[10px] text-emerald-200 font-medium">Traditional Health Counselor</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-emerald-100 hover:text-white hover:bg-emerald-800 rounded-full transition-colors cursor-pointer z-10"
              >
                <span className="text-xs font-semibold px-1">Close</span>
              </button>
            </div>

            {/* Chat Body */}
            <div 
              ref={scrollRef}
              className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 relative"
            >
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex items-start max-w-[85%] space-x-2 ${
                      m.role === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      m.role === "user" ? "bg-siddha-gold text-siddha-dark" : "bg-siddha-dark text-white"
                    }`}>
                      {m.role === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-3.5 h-3.5" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-siddha-dark text-white rounded-tr-none"
                        : "bg-white text-gray-800 shadow-xs border border-gray-100 rounded-tl-none font-sans"
                    }`}>
                      {m.text}
                    </div>
                  </div>
                </div>
              ))}
              
              {sending && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-2 bg-white p-3 rounded-2xl shadow-xs border border-gray-100">
                    <Loader2 className="w-4 h-4 text-siddha-dark animate-spin" />
                    <span className="text-xs text-gray-500 font-medium">Agathiyar translating secrets...</span>
                  </div>
                </div>
              )}

              {/* Quick Prompts Suggestions (only visible if messages are basic/just started) */}
              {messages.length === 1 && (
                <div className="pt-3 space-y-2">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center select-none">
                    <HelpCircle className="w-3.5 h-3.5 mr-1 text-siddha-dark" />
                    Common Traditional Queries:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {quickPrompts.map((p) => (
                      <button
                        key={p}
                        onClick={() => handleQuickPromptClick(p)}
                        className="text-[11px] font-medium bg-emerald-50 text-emerald-800 hover:bg-siddha-light hover:text-siddha-dark border border-emerald-100/60 transition-colors px-2.5 py-1.5 rounded-full text-left flex items-center cursor-pointer"
                      >
                        <span>{p}</span>
                        <ArrowRight className="w-3 h-3 ml-1 opacity-70" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 border-t border-gray-100 bg-white flex items-center space-x-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about skin, immunity, or digest..."
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark rounded-xl text-xs focus:outline-none focus:bg-white text-gray-800 transition-colors"
                disabled={sending}
              />
              <button
                type="submit"
                className="p-2.5 bg-siddha-dark hover:bg-emerald-800 text-white rounded-xl transition-colors shrink-0 cursor-pointer flex items-center justify-center disabled:opacity-55 shadow-xs"
                disabled={!input.trim() || sending}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggler button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-siddha-dark hover:bg-emerald-800 text-white shadow-xl flex items-center justify-center cursor-pointer relative group ring-4 ring-emerald-950/20 active:scale-95 transition-transform"
        id="chatbot-floating-toggle"
        title="Ask Agathiyar Siddha AI"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-siddha-gold opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-siddha-gold text-[9px] text-siddha-dark font-black items-center justify-center">AI</span>
        </span>
        <MessageSquare className="w-6 h-6 text-siddha-light group-hover:rotate-6 transition-transform" />
      </button>
    </div>
  );
}

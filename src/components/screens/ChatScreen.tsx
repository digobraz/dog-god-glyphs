import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import dogyptLogo from '@/assets/dogypt-logo.png';
import hekthorImg from '@/assets/hekthor.png';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  options?: string[];
}

export function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: "Hi, I'm HEKTHOR.\nWhat's your dog's name?",
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="papyrus-bg flex flex-col h-[100dvh] overflow-hidden">
      {/* Logo */}
      <div className="flex-shrink-0 flex justify-center pt-4 pb-2">
        <img src={dogyptLogo} alt="DOGYPT" className="h-10 md:h-12 object-contain" />
      </div>

      {/* Main content — centered vertically */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-xl flex flex-col items-center gap-6">

          {/* BLOCK 1: HEKTHOR + question */}
          <motion.div
            className="w-full rounded-2xl border border-border/40 p-6 flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={hekthorImg}
              alt="HEKTHOR"
              className="w-56 h-56 md:w-64 md:h-64 object-contain"
            />

            <AnimatePresence mode="popLayout">
              {messages.filter(m => m.sender === 'bot').slice(-1).map((msg) => (
                <motion.p
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-foreground text-center text-xl md:text-2xl leading-relaxed whitespace-pre-line"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  {msg.text}
                </motion.p>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* BLOCK 2: Answer area */}
          <motion.div
            className="w-full rounded-2xl border border-border/40 p-4 flex flex-col gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Option buttons when present */}
            {messages.length > 0 && messages[messages.length - 1].options && (
              <div className="flex flex-wrap gap-2 justify-center">
                {messages[messages.length - 1].options!.map((option) => (
                  <Button
                    key={option}
                    variant="outline"
                    className="border-primary text-foreground hover:bg-primary hover:text-primary-foreground rounded-full px-5 py-2 text-sm font-medium"
                    style={{ fontFamily: "'Cinzel', serif" }}
                    onClick={() => {
                      const userMsg: Message = {
                        id: Date.now().toString(),
                        sender: 'user',
                        text: option,
                      };
                      setMessages((prev) => [...prev, userMsg]);
                    }}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            )}

            {/* Text input */}
            <div className="flex items-center gap-2 bg-card rounded-full px-4 py-2 border border-border/30">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer..."
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-base md:text-lg"
                style={{ fontFamily: "'Inter', sans-serif" }}
                autoFocus
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim()}
                size="icon"
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/80 h-9 w-9 flex-shrink-0 disabled:opacity-30"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}

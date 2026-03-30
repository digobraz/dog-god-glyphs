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
      text: "Hi, I'm HEKTHOR. What's your dog's name?",
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

      {/* Chat area */}
      <div className="flex-1 flex flex-col items-center overflow-hidden px-4">
        <div className="w-full max-w-lg flex flex-col flex-1 overflow-hidden">
          {/* Messages scroll area */}
          <div className="flex-1 overflow-y-auto space-y-3 py-3 scrollbar-hide">
            {/* HEKTHOR avatar + first message block */}
            <motion.div
              className="flex flex-col items-center gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={hekthorImg}
                alt="HEKTHOR"
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-primary shadow-lg"
              />
            </motion.div>

            <AnimatePresence mode="popLayout">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm md:text-base ${
                      msg.sender === 'bot'
                        ? 'bg-card text-card-foreground border border-primary/30'
                        : 'bg-primary text-primary-foreground'
                    }`}
                    style={{ fontFamily: msg.sender === 'bot' ? "'Cinzel', serif" : "'Inter', sans-serif" }}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Option buttons when present */}
            {messages.length > 0 && messages[messages.length - 1].options && (
              <motion.div
                className="flex flex-wrap gap-2 justify-center pt-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
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
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="flex-shrink-0 pb-4 pt-2">
            <div className="flex items-center gap-2 bg-card border border-primary/30 rounded-full px-4 py-2 shadow-sm">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer..."
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm md:text-base"
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
          </div>
        </div>
      </div>
    </div>
  );
}

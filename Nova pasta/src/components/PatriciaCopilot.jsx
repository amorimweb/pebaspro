import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, User, FileText, ChevronRight } from 'lucide-react';
import './PatriciaCopilot.css';

const PatriciaCopilot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([
    {
      id: 1,
      sender: 'ai',
      time: 'Agora',
      type: 'text',
      content: 'Olá! Sou a Patrícia, sua assistente de inteligência artificial de RH. Tenho 2 alertas sobre o eSocial e 1 currículo de alta aderência para a vaga de "Tech Lead". Como posso ajudar hoje?'
    },
    {
      id: 2,
      sender: 'ai',
      time: 'Agora',
      type: 'insight',
      title: 'Match de Candidato Encontrado',
      content: 'Carlos Mendes possui 98% de aderência na vaga "Tech Lead" pelos critérios de React e Node.js.',
      actionText: 'Ver Currículo'
    }
  ]);
  
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat, isOpen]);

  const handleSend = () => {
    if (!message.trim()) return;

    // Add user message
    const newUserMsg = {
      id: Date.now(),
      sender: 'user',
      time: 'Agora',
      type: 'text',
      content: message
    };
    
    setChat(prev => [...prev, newUserMsg]);
    setMessage('');

    // Mock AI response
    setTimeout(() => {
      const resp = {
        id: Date.now() + 1,
        sender: 'ai',
        time: 'Agora',
        type: 'text',
        content: 'Entendi! Estou cruzando os dados do Banco de Talentos com os requisitos solicitados. Posso gerar um dashboard analítico disso em instantes.'
      };
      setChat(prev => [...prev, resp]);
    }, 1500);
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            className="patricia-fab"
            onClick={() => setIsOpen(true)}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Bot size={28} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <div className="patricia-drawer-overlay">
            <motion.div
              className="patricia-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 250, damping: 30 }}
            >
              {/* Header */}
              <div className="patricia-header">
                <div className="patricia-identity">
                  <div className="patricia-avatar">P</div>
                  <div>
                    <h3 className="patricia-title">Patrícia AI</h3>
                    <p className="patricia-subtitle">
                      <span className="patricia-status-dot"></span>
                      Copiloto de RH On-line
                    </p>
                  </div>
                </div>
                <button className="patricia-close" onClick={() => setIsOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              {/* Chat Body */}
              <div className="patricia-body">
                {chat.map((msg) => (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`patricia-message ${msg.sender}`}
                  >
                    {msg.type === 'text' ? (
                      <div className="msg-bubble">{msg.content}</div>
                    ) : (
                      <div className="patricia-insight">
                        <div className="insight-icon">
                          <Sparkles size={16} />
                        </div>
                        <div className="insight-content">
                          <h4>{msg.title}</h4>
                          <p>{msg.content}</p>
                          <button className="insight-action-btn">
                            {msg.actionText} <ChevronRight size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                    <span className="msg-time">{msg.time}</span>
                  </motion.div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Footer Input */}
              <div className="patricia-footer">
                <input 
                  type="text" 
                  className="patricia-input" 
                  placeholder="Pergunte sobre um candidato ou indicador..." 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button 
                  className="patricia-send" 
                  onClick={handleSend}
                  disabled={!message.trim()}
                >
                  <Send size={18} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PatriciaCopilot;

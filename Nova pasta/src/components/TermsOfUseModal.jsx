import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText } from 'lucide-react';

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '24px'
  },
  modal: {
    background: '#fff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '700px',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden'
  },
  header: {
    padding: '20px 24px',
    borderBottom: '1px solid #E2E8F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#0F172A'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748B',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
    borderRadius: '6px'
  },
  content: {
    padding: '24px',
    overflowY: 'auto',
    color: '#334155',
    lineHeight: '1.6',
    fontSize: '14px'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#0F172A',
    marginTop: '24px',
    marginBottom: '8px'
  },
  footer: {
    padding: '16px 24px',
    borderTop: '1px solid #E2E8F0',
    display: 'flex',
    justifyContent: 'flex-end',
    background: '#F8FAFC'
  },
  acceptBtn: {
    background: '#3B82F6',
    color: 'white',
    border: 'none',
    padding: '8px 24px',
    borderRadius: '6px',
    fontWeight: '500',
    cursor: 'pointer'
  }
};

const TermsOfUseModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          style={modalStyles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            style={modalStyles.modal}
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
          >
            <div style={modalStyles.header}>
              <div style={modalStyles.titleGroup}>
                <FileText size={24} color="#3B82F6" />
                <h2 style={modalStyles.title}>Termos de Uso</h2>
              </div>
              <button style={modalStyles.closeBtn} onClick={onClose}>
                <X size={20} />
              </button>
            </div>
            
            <div style={modalStyles.content}>
              <p>Última atualização: 14 de Abril de 2026</p>
              
              <p>
                Bem-vindo à Plataforma Pebaspro. Ao acessar e utilizar o nosso dashboard, você concorda em cumprir 
                e estar vinculado aos seguintes termos e condições gerais de uso.
              </p>

              <h3 style={modalStyles.sectionTitle}>1. Aceitação dos Termos</h3>
              <p>
                O seu acesso à Pebaspro está condicionado à sua aceitação e conformidade constante com estes Termos. 
                Se você discorda de qualquer parte dos termos, não deve acessar o serviço.
              </p>

              <h3 style={modalStyles.sectionTitle}>2. Uso do Serviço</h3>
              <p>
                Você é o único responsável por garantir que o uso do serviço atenda aos regulamentos aplicáveis. 
                Não deverá utilizar o nosso dashboard para qualquer propósito ilegal, nem realizar engenharia reversa.
              </p>

              <h3 style={modalStyles.sectionTitle}>3. Responsabilidades e Contas</h3>
              <p>
                Quando você cria uma conta conosco, deve nos fornecer informações precisas, completas e atualizadas 
                constantemente. O não cumprimento dessas regras constitui violação dos Termos, podendo resultar no 
                cancelamento imediato da sua conta.
              </p>

              <h3 style={modalStyles.sectionTitle}>4. Limitações de Responsabilidade</h3>
              <p>
                A Pebaspro não será responsável por quaisquer danos indiretos, incidentais, especiais, consequenciais 
                ou punitivos, incluindo sem limitação, perda de lucros, dados, uso, ou outras perdas intangíveis.
              </p>

            </div>

            <div style={modalStyles.footer}>
              <button style={modalStyles.acceptBtn} onClick={onClose}>
                Fechar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TermsOfUseModal;

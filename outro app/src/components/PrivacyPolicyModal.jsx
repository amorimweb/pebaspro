import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield } from 'lucide-react';

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

const PrivacyPolicyModal = ({ isOpen, onClose }) => {
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
                <Shield size={24} color="#3B82F6" />
                <h2 style={modalStyles.title}>Política de Privacidade</h2>
              </div>
              <button style={modalStyles.closeBtn} onClick={onClose}>
                <X size={20} />
              </button>
            </div>
            
            <div style={modalStyles.content}>
              <p>Última atualização: 14 de Abril de 2026</p>
              
              <p>
                A Pebaspro compromete-se a proteger e respeitar a sua privacidade. Esta Política de Privacidade 
                explica como os seus dados pessoais são coletados, usados e protegidos de acordo com a Lei Geral de 
                Proteção de Dados (LGPD - Lei nº 13.709/2018).
              </p>

              <h3 style={modalStyles.sectionTitle}>1. Coleta de Dados</h3>
              <p>
                Coletamos informações para fornecer serviços melhores a todos os nossos usuários. 
                Isso inclui informações essenciais de perfil profissional, dados da empresa, registros operacionais e 
                comportamento de navegação na plataforma.
              </p>

              <h3 style={modalStyles.sectionTitle}>2. Uso de Dados</h3>
              <p>
                As informações que recolhemos são usadas exclusivamente para provisionar, manter e melhorar os nossos 
                serviços. Utilizamos as suas informações de contato para comunicar sobre atualizações, novos serviços 
                e questões relacionadas ao suporte técnico.
              </p>
              
              <h3 style={modalStyles.sectionTitle}>3. Direitos do Titular</h3>
              <p>
                De acordo com a LGPD, você possui o direito de solicitar a confirmação da existência de tratamento, 
                o acesso aos dados, correção de dados incompletos, inexatos ou desatualizados e a anonimização, 
                bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com o disposto na Lei.
              </p>

              <h3 style={modalStyles.sectionTitle}>4. Cookies</h3>
              <p>
                Utilizamos cookies e tecnologias semelhantes para fornecer e apoiar os nossos Serviços e recolher informações 
                como seu endereço IP, detalhes sobre seu dispositivo e atividades de navegação na Plataforma.
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

export default PrivacyPolicyModal;

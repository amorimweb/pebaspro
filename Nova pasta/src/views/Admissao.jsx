import React from 'react';
import { motion } from 'framer-motion';
import DigitalAdmission from '../components/DigitalAdmission';
import { UserCheck } from 'lucide-react';
import './Views.css';
import { useDashboard } from '../context/DashboardContext';

const Admissao = () => {
  const { showToast, exportData } = useDashboard();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="view-container"
    >
      <div className="view-header">
        <div className="title-group">
          <h2>Admissão Digital</h2>
          <p>Acompanhe em tempo real o processo de entrada e conformidade dos novos colaboradores.</p>
        </div>
        <div className="view-actions" style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={() => exportData('Checklist Geral de Admissão')}>Checklist Geral</button>
          <button className="btn-primary" onClick={() => exportData('Relatório de Onboarding (PDF)')}>Relatório de Onboarding</button>
        </div>
      </div>
      
      <div className="admission-content-wrapper" style={{ margin: '0 -32px' }}>
        <DigitalAdmission />
      </div>
    </motion.div>
  );
};

export default Admissao;

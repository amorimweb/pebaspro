import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck, CheckCircle } from 'lucide-react';
import './DigitalAdmission.css';
import { useDashboard } from '../context/DashboardContext';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};

const AdmissionRow = ({ cand }) => {
  const { updateAdmissionProgress, showToast } = useDashboard();
  
  const steps = [
    { label: 'Matriz', status: cand.progress > 20 ? 'completed' : 'active' },
    { label: 'Exames', status: cand.progress > 40 ? 'completed' : cand.progress > 20 ? 'active' : '' },
    { label: 'Docs', status: cand.progress > 60 ? 'completed' : cand.progress > 40 ? 'active' : '' },
    { label: 'eSocial', status: cand.progress > 80 ? 'completed' : cand.progress > 60 ? 'active' : '' },
    { label: 'Liberação', status: cand.progress >= 100 ? 'completed' : cand.progress > 80 ? 'active' : '' },
  ];

  return (
    <motion.div className="admission-row" variants={itemVariants}>
      <div className="row-info">
        <strong>{cand.name}</strong>
        <span>{cand.role}</span>
      </div>
      
      <div className="admission-steps">
        {steps.map((step, idx) => (
          <div key={idx} className={`step-item ${step.status}`}>
            {step.status === 'completed' && <CheckCircle size={10} style={{ marginRight: '4px' }} />}
            <span>{step.label}</span>
          </div>
        ))}
      </div>

      <div className="row-progress">
        <div className="progress-bar-container">
          <motion.div 
            className="progress-fill" 
            initial={{ width: 0 }}
            animate={{ width: `${cand.progress}%` }}
          />
        </div>
        <span className="progress-value">{cand.progress}%</span>
      </div>

      <div className="row-action">
        <button 
          className="btn-action" 
          onClick={() => {
            if (cand.progress < 100) {
              updateAdmissionProgress(cand.id, 20);
              showToast(`Etapa concluída para ${cand.name}`);
            }
          }}
          disabled={cand.progress >= 100}
        >
          {cand.progress >= 100 ? 'Finalizado' : 'Avançar'}
        </button>
      </div>
    </motion.div>
  );
};

const DigitalAdmission = () => {
  const { candidates } = useDashboard();
  const admissionCandidates = candidates.filter(c => c.status === 'Admissão');

  return (
    <motion.section className="admission-section" variants={itemVariants}>
      <div className="admission-container">
        <div className="admission-list">
          <div className="list-header" style={{ display: 'grid', gridTemplateColumns: '2fr 2.5fr 1.2fr 0.8fr', padding: '0 16px 12px 16px', fontSize: '11px', fontWeight: '700', color: 'var(--pb-gray-text)', textTransform: 'uppercase' }}>
            <span>Colaborador</span>
            <span>Etapas</span>
            <span>Progresso</span>
            <span>Ação</span>
          </div>
          {admissionCandidates.map((cand) => (
            <AdmissionRow key={cand.id} cand={cand} />
          ))}
          {admissionCandidates.length === 0 && (
            <div className="empty-state">Nenhuma admissão em processamento.</div>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default DigitalAdmission;

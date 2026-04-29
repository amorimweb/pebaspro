import React from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, MapPin, Star } from 'lucide-react';
import './RecruitmentPipeline.css';
import { useDashboard } from '../context/DashboardContext';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};

const CandidateCard = ({ id, name, role, location, score, status, pending }) => {
  const { moveCandidate, showToast } = useDashboard();
  
  const getNextStatus = (current) => {
    const flow = ['Triagem', 'Entrevista', 'Documentação', 'Contratação'];
    const idx = flow.indexOf(current);
    return idx < flow.length - 1 ? flow[idx + 1] : null;
  };

  const nextStatus = getNextStatus(status);

  return (
    <motion.div 
      className="candidate-card" 
      variants={itemVariants}
      onClick={() => showToast(`Detalhes de ${name} (Simulação de Modal)`)}
      style={{ cursor: 'pointer' }}
    >
      <div className="candidate-header">
        <div className="candidate-info">
          <h4>{name}</h4>
          <span>{role}</span>
        </div>
        <button className="icon-btn"><MoreHorizontal size={16} /></button>
      </div>
      
      <div className="candidate-details">
        <div className="detail-item">
          <MapPin size={12} />
          <span>{location}</span>
        </div>
        <div className="detail-item">
          <Star size={12} fill="var(--pb-green-primary)" stroke="var(--pb-green-primary)" />
          <span className="score">{score}% Aderência</span>
        </div>
      </div>

      <div className="candidate-footer">
        <span className={`status-badge ${status.toLowerCase().replace(' ', '-')}`}>{status}</span>
        {pending && <span className="pending-text">Pendente: {pending}</span>}
        
        {nextStatus && (
          <button 
            className="move-btn"
            onClick={(e) => {
              e.stopPropagation();
              moveCandidate(id, nextStatus);
            }}
          >
            Mover para {nextStatus}
          </button>
        )}
      </div>
    </motion.div>
  );
};

const RecruitmentPipeline = () => {
  const { candidates, addVaga } = useDashboard();
  
  const columns = [
    { title: 'Triagem', slug: 'Triagem' },
    { title: 'Entrevista', slug: 'Entrevista' },
    { title: 'Documentação', slug: 'Documentação' },
    { title: 'Contratação', slug: 'Contratação' }
  ];

  return (
    <motion.section className="pipeline-section" variants={itemVariants}>
      <div className="section-header">
        <div className="header-flex">
          <div className="title-group">
            <h3>Pipeline de Recrutamento</h3>
            <span className="subtitle">Gerencie o fluxo de candidatos em tempo real</span>
          </div>
          <div className="actions">
            <button className="btn-secondary">Filtrar</button>
            <button 
              className="btn-primary" 
              onClick={() => addVaga({ title: 'Nova Vaga PEBAS', setor: 'Geral' })}
            >
              + Nova Vaga
            </button>
          </div>
        </div>
      </div>
      
      <div className="pipeline-container">
        {columns.map((column, idx) => (
          <motion.div key={idx} className="pipeline-column" variants={itemVariants}>
            <div className="column-header">
              <div className="column-title">
                <h4>{column.title}</h4>
                <span className="count">
                  {candidates.filter(c => c.status === column.slug).length}
                </span>
              </div>
            </div>
            <div className="column-body">
              {candidates
                .filter(c => c.status === column.slug)
                .map((cand) => (
                  <CandidateCard key={cand.id} {...cand} />
                ))}
              <button className="add-card-btn">+ Adicionar Candidato</button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default RecruitmentPipeline;

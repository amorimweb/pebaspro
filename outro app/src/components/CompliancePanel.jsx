import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';
import './CompliancePanel.css';
import { useDashboard } from '../context/DashboardContext';

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};

const ComplianceItem = ({ alert }) => {
  const { resolveAlert } = useDashboard();
  
  const getIcon = () => {
    switch (alert.status) {
      case 'crítico': return <ShieldAlert size={18} />;
      case 'atenção': return <AlertCircle size={18} />;
      case 'regular': return <Clock size={18} />;
      case 'concluído': return <CheckCircle2 size={18} />;
      default: return <AlertCircle size={18} />;
    }
  };

  return (
    <motion.div className={`compliance-item ${alert.status}`} variants={itemVariants}>
      <div className="item-icon">
        {getIcon()}
      </div>
      <div className="item-content">
        <h5>{alert.title}</h5>
        <div className="item-footer">
          <span className="type">{alert.type}</span>
          <span className="date">{alert.date}</span>
        </div>
      </div>
      <button 
        className="btn-resolve-mini"
        onClick={() => resolveAlert(alert.id)}
      >
        Limpar
      </button>
    </motion.div>
  );
};

const CompliancePanel = () => {
  const { alerts } = useDashboard();
  const baseScore = 82;
  const currentScore = Math.min(100, baseScore + (6 - alerts.length) * 3);

  return (
    <motion.aside className="compliance-panel" variants={itemVariants}>
      <div className="panel-header">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h4>Compliance SST + eSocial</h4>
          <span style={{ fontSize: '11px', color: 'var(--pb-gray-text)' }}>Gestão de conformidade ativa</span>
        </div>
        <button className="view-all">Histórico</button>
      </div>
      
      <div className="alerts-list">
        {alerts.map((alert) => (
          <ComplianceItem key={alert.id} alert={alert} />
        ))}
        {alerts.length === 0 && (
          <div className="empty-state-panel">
            <CheckCircle2 size={32} color="var(--pb-green-primary)" />
            <p>Sua empresa está 100% regular hoje.</p>
          </div>
        )}
      </div>

      <div className="compliance-score">
        <div className="score-header">
          <span>Índice de Conformidade</span>
          <span className="percentage">{currentScore}%</span>
        </div>
        <div className="score-bar">
          <motion.div 
            className="score-fill" 
            initial={{ width: 0 }}
            animate={{ width: `${currentScore}%` }}
          />
        </div>
        <p className="score-note">
          {currentScore > 90 ? 'Nível Excelente' : currentScore > 80 ? 'Nível Regular' : 'Nível Crítico'}
        </p>
      </div>
    </motion.aside>
  );
};

export default CompliancePanel;

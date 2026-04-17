import React from 'react';
import { motion } from 'framer-motion';
import CompliancePanel from '../components/CompliancePanel';
import { ShieldCheck, Download, AlertTriangle } from 'lucide-react';
import './Views.css';

const Compliance = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="view-container"
    >
      <div className="view-header">
        <div className="title-group">
          <h2>Compliance SST / eSocial</h2>
          <p>Central de riscos, exames ocupacionais e conformidade legal PEBASPRO.</p>
        </div>
        <div className="view-actions" style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary">
            <Download size={18} />
            Exportar LNT
          </button>
          <button className="btn-primary">
            <AlertTriangle size={18} />
            Novo Alerta
          </button>
        </div>
      </div>

      <div className="compliance-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
        <div className="compliance-main">
          <div className="pb-table-container" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--pb-blue-deep)', fontWeight: '800', marginBottom: '16px' }}>Visão Geral de Regulamentação</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div style={{ padding: '20px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid var(--pb-gray-light)' }}>
                <span style={{ fontSize: '12px', color: 'var(--pb-text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>ASOs Pendentes</span>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#FF5252', marginTop: '4px' }}>14</div>
                <p style={{ fontSize: '12px', color: 'var(--pb-text-secondary)', marginTop: '8px' }}>Necessário agendamento imediato</p>
              </div>
              <div style={{ padding: '20px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid var(--pb-gray-light)' }}>
                <span style={{ fontSize: '12px', color: 'var(--pb-text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>CIPA / Brigada</span>
                <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--pb-green-main)', marginTop: '4px' }}>100%</div>
                <p style={{ fontSize: '12px', color: 'var(--pb-text-secondary)', marginTop: '8px' }}>Certificações em dia</p>
              </div>
            </div>
          </div>
          
          <div className="pb-table-container" style={{ padding: '24px' }}>
             <h3 style={{ fontSize: '18px', color: 'var(--pb-blue-deep)', fontWeight: '800', marginBottom: '16px' }}>Histórico de Inspeções</h3>
             <p style={{ color: 'var(--pb-text-secondary)', fontSize: '14px' }}>Nenhuma inspeção recente registrada no sistema.</p>
          </div>
        </div>

        <div className="compliance-sidebar">
          <CompliancePanel />
        </div>
      </div>
    </motion.div>
  );
};

export default Compliance;

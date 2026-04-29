import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, CheckCircle, XCircle, Clock, Download, MoreVertical } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import './Views.css';

const Documents = () => {
  const { showToast, exportData } = useDashboard();
  const [activeTab, setActiveTab] = useState('Todos');

  const mockDocs = [
    { id: 1, name: 'RG_Ricardo_Santos.pdf', type: 'Identidade', candidate: 'Ricardo Santos', status: 'Aprovado', date: '10/04/2026' },
    { id: 2, name: 'CPF_Ricardo_Santos.pdf', type: 'Identidade', candidate: 'Ricardo Santos', status: 'Pendente', date: '09/04/2026' },
    { id: 3, name: 'ASO_Ana_Souza.pdf', type: 'Saúde', candidate: 'Ana Beatriz Souza', status: 'Aprovado', date: '08/04/2026' },
    { id: 4, name: 'NR10_Certificado.pdf', type: 'Treinamento', candidate: 'Carlos Eduardo', status: 'Atenção', date: '07/04/2026' },
    { id: 5, name: 'Contrato_Operador.pdf', type: 'Contratual', candidate: 'Ricardo Santos', status: 'Aprovado', date: '06/04/2026' },
    { id: 6, name: 'Diploma_Engenharia.pdf', type: 'Escolaridade', candidate: 'Ana Beatriz Souza', status: 'Pendente', date: '05/04/2026' },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Aprovado': return { color: 'var(--pb-green-main)', bg: 'rgba(76, 217, 100, 0.1)', icon: <CheckCircle size={14} /> };
      case 'Pendente': return { color: 'var(--pb-turquoise)', bg: 'rgba(33, 199, 199, 0.1)', icon: <Clock size={14} /> };
      case 'Atenção': return { color: '#FF5252', bg: 'rgba(255, 82, 82, 0.1)', icon: <XCircle size={14} /> };
      default: return { color: 'var(--pb-text-secondary)', bg: 'var(--pb-gray-light)', icon: <Clock size={14} /> };
    }
  };

  const filteredDocs = activeTab === 'Todos' ? mockDocs : mockDocs.filter(doc => doc.status === activeTab.slice(0, -1) || doc.status === activeTab);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="view-container"
    >
      <div className="view-header">
        <div className="title-group">
          <h2>Gestão de Documentos</h2>
          <p>Centralize e valide documentos de colaboradores e candidatos em um único local seguro.</p>
        </div>
        <button className="btn-primary" onClick={() => showToast('Simulação: Abrindo seletor de arquivos...', 'info')}>
          <Upload size={18} />
          Enviar Documento
        </button>
      </div>

      <div className="doc-tabs" style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--pb-gray-light)', marginBottom: '32px' }}>
        {['Todos', 'Pendentes', 'Aprovados', 'Atenção'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ 
              padding: '14px 0', 
              background: 'none', 
              border: 'none', 
              borderBottom: activeTab === tab ? '3px solid var(--pb-green-main)' : '3px solid transparent',
              color: activeTab === tab ? 'var(--pb-blue-deep)' : 'var(--pb-text-secondary)',
              fontWeight: activeTab === tab ? '800' : '600',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="doc-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {filteredDocs.map(doc => {
          const style = getStatusStyle(doc.status);
          return (
            <motion.div 
              key={doc.id}
              whileHover={{ y: -5, boxShadow: '0 12px 30px rgba(13, 71, 161, 0.08)' }}
              style={{ 
                background: 'white', 
                padding: '24px', 
                borderRadius: '16px', 
                border: '1px solid var(--pb-gray-light)', 
                boxShadow: 'var(--pb-shadow)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ 
                  padding: '12px', 
                  background: 'rgba(30, 136, 229, 0.05)', 
                  borderRadius: '12px', 
                  color: 'var(--pb-blue-brand)',
                  border: '1px solid rgba(30, 136, 229, 0.1)'
                }}>
                  <FileText size={24} />
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  fontSize: '11px', 
                  fontWeight: '800', 
                  padding: '6px 12px', 
                  borderRadius: '20px', 
                  background: style.bg, 
                  color: style.color,
                  textTransform: 'uppercase'
                }}>
                  {style.icon}
                  {doc.status}
                </div>
              </div>
              
              <h4 style={{ fontSize: '15px', marginBottom: '4px', color: 'var(--pb-blue-deep)', fontWeight: '800' }}>{doc.name}</h4>
              <p style={{ fontSize: '12.5px', color: 'var(--pb-text-secondary)', marginBottom: '20px', fontWeight: '500' }}>
                {doc.candidate} <span style={{ opacity: 0.5, margin: '0 4px' }}>•</span> {doc.type}
              </p>
              
              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11.5px', color: 'var(--pb-text-secondary)', fontWeight: '500' }}>{doc.date}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-icon-sml" onClick={() => exportData(doc.name)}><Download size={16} /></button>
                  <button className="btn-icon-sml" onClick={() => showToast('Ações adicionais do documento', 'info')}><MoreVertical size={16} /></button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      {filteredDocs.length === 0 && (
        <div style={{ padding: '80px', textAlign: 'center', color: 'var(--pb-text-secondary)', fontWeight: '600' }}>
          Nenhum documento encontrado nesta categoria.
        </div>
      )}
    </motion.div>
  );
};

export default Documents;

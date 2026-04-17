import React from 'react';
import { motion } from 'framer-motion';
import OperationalReports from '../components/OperationalReports';
import { FileDown, Printer, BarChart3 } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import './Views.css';

const Reports = () => {
  const { exportData } = useDashboard();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="view-container"
    >
      <div className="view-header">
        <div className="title-group">
          <h2>Relatórios Operacionais</h2>
          <p>Análise de performance, contratação e indicadores estratégicos da PEBASPRO.</p>
        </div>
        <div className="view-actions" style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={() => window.print()}>
            <Printer size={18} />
            Imprimir
          </button>
          <button className="btn-primary" onClick={() => exportData('Dados Operacionais (XLSX)')}>
            <FileDown size={18} />
            Exportar Dados
          </button>
        </div>
      </div>
      
      <div className="reports-content-wrapper" style={{ margin: '0 -32px' }}>
        <OperationalReports />
      </div>
    </motion.div>
  );
};

export default Reports;

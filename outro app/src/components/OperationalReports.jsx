import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Download, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDashboard } from '../context/DashboardContext';
import './OperationalReports.css';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};

const data = [
  { name: 'Operacional', value: 45, color: '#4CD964' },
  { name: 'Técnico', value: 30, color: '#21C7C7' },
  { name: 'Engenharia', value: 15, color: '#1E88E5' },
  { name: 'ADM', value: 25, color: '#31D3A4' },
  { name: 'Logística', value: 20, color: '#0D47A1' },
];

const StatItem = ({ label, value, subtext }) => (
  <motion.div className="stat-item" whileHover={{ x: 5 }}>
    <span className="stat-label">{label}</span>
    <h4 className="stat-value">{value}</h4>
    <span className="stat-subtext">{subtext}</span>
  </motion.div>
);

const OperationalReports = () => {
  const { showToast } = useDashboard();

  return (
    <motion.div className="reports-section" variants={itemVariants}>
      <div className="section-header">
        <div className="header-info">
          <h3>Relatórios Operacionais</h3>
          <span className="subtitle">Análise avançada de performance e produtividade</span>
        </div>
        <div className="header-controls">
          <button className="control-btn" onClick={() => showToast('Simulação de Filtros Ativada')}><Filter size={16} /> Filtrar</button>
          <button className="control-btn" onClick={() => showToast('Iniciando exportação PDF...')}><Download size={16} /> Exportar</button>
        </div>
      </div>

      <div className="reports-content">
        <div className="chart-container">
          <div className="chart-header">
            <h4>Vagas por Setor</h4>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#7B8794' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#7B8794' }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="stats-panel">
          <div className="stats-grid">
            <StatItem label="Taxa de Conversão" value="28.4%" subtext="+2.1% este mês" />
            <StatItem label="Admissões Finalizadas" value="142" subtext="Meta anual: 200" />
            <StatItem label="Candidatos em Processo" value="582" subtext="Ativos em todos os fluxos" />
            <StatItem label="Documentos Pendentes" value="12" subtext="Ação necessária imediata" />
            <StatItem label="Colaboradores Aptos" value="3.2k" subtext="Base PEBASPRO" />
            <StatItem label="Bloqueios SST" value="02" subtext="Monitoramento ativo" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OperationalReports;

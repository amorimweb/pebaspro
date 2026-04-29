import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users, 
  Briefcase, 
  FileCheck, 
  AlertTriangle, 
  Send 
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import './Header.css';

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};

const KPICard = ({ icon, label, value, trend, trendValue, color, path = "/dashboard" }) => (
  <motion.div className="kpi-card" variants={itemVariants}>
    <Link to={path} style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%', textDecoration: 'none' }}>
      <div className={`kpi-icon ${color}`}>
        {icon}
      </div>
      <div className="kpi-content">
        <span className="kpi-label">{label}</span>
        <div className="kpi-value-row">
          <h3 className="kpi-value">{value}</h3>
          {trend && (
            <span className={`kpi-trend ${trend}`}>
              {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trendValue}
            </span>
          )}
        </div>
      </div>
    </Link>
  </motion.div>
);

const Header = () => {
  const navigate = useNavigate();
  const { openVagaForm, exportData } = useDashboard();

  const handleNewVaga = () => {
    openVagaForm();
    navigate('/recrutamento');
  };

  const kpis = [
    { 
      icon: <Briefcase size={20} />, 
      label: 'Vagas Abertas', 
      value: '24', 
      trend: 'up', 
      trendValue: '12%', 
      color: 'blue',
      path: '/recrutamento'
    },
    { 
      icon: <Users size={20} />, 
      label: 'Candidatos Ativos', 
      value: '158', 
      trend: 'up', 
      trendValue: '8%', 
      color: 'green',
      path: '/talentos'
    },
    { 
      icon: <FileCheck size={20} />, 
      label: 'Admissões em Andamento', 
      value: '12', 
      trend: 'down', 
      trendValue: '4%', 
      color: 'aqua',
      path: '/admissao'
    },
    { 
      icon: <AlertTriangle size={20} />, 
      label: 'Pendências SST', 
      value: '05', 
      trend: 'down', 
      trendValue: '20%', 
      color: 'red',
      path: '/compliance'
    },
    { 
      icon: <Send size={20} />, 
      label: 'Eventos eSocial', 
      value: '03', 
      trend: 'up', 
      trendValue: '2%', 
      color: 'turquoise',
      path: '/esocial'
    },
    { 
      icon: <Clock size={20} />, 
      label: 'Média Contratação', 
      value: '14d', 
      trend: 'down', 
      trendValue: '1d', 
      color: 'gray',
      path: '/relatorios'
    },
  ];

  return (
    <header className="main-header">
      <div className="header-top">
        <div className="title-group">
          <h2>Dashboard Empresarial Integrado</h2>
          <p>Recrutamento, admissão, compliance SST e eSocial em um único painel</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => exportData('Relatório Geral')}>Exportar Relatórios</button>
          <button className="btn-primary" onClick={handleNewVaga}>+ Nova Vaga</button>
        </div>
      </div>
      
      <div className="kpi-grid">
        {kpis.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>
    </header>
  );
};

export default Header;

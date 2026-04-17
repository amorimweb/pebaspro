import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserPlus, FileText,
  ShieldCheck, AlertCircle, BarChart3, Settings,
  Search, Briefcase, Zap, ChevronRight
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { plansDefinition, modeModules } from '../data/mockData';
import './Sidebar.css';

const ALL_MENU_ITEMS = [
  { id: 'dashboard',   icon: <LayoutDashboard size={20} />, label: 'Visão Geral',      path: '/dashboard' },
  { id: 'recrutamento',icon: <Briefcase size={20} />,       label: 'Recrutamento',     path: '/recrutamento' },
  { id: 'talentos',    icon: <Search size={20} />,          label: 'Banco de Talentos',path: '/talentos' },
  { id: 'admissao',    icon: <UserPlus size={20} />,        label: 'Admissão Digital', path: '/admissao' },
  { id: 'documentos',  icon: <FileText size={20} />,        label: 'Documentos',       path: '/documentos' },
  { id: 'compliance',  icon: <ShieldCheck size={20} />,     label: 'Compliance SST',   path: '/compliance' },
  { id: 'esocial',     icon: <AlertCircle size={20} />,     label: 'eSocial & Alertas',path: '/esocial' },
  { id: 'relatorios',  icon: <BarChart3 size={20} />,       label: 'Relatórios',       path: '/relatorios' },
  { id: 'configuracoes',icon:<Settings size={20} />,        label: 'Configurações',    path: '/configuracoes' },
];

const MODE_LABELS = {
  essencial:   { label: 'Essencial',   color: '#1FAE66' },
  operacional: { label: 'Operacional', color: '#1787D4' },
  corporativo: { label: 'Corporativo', color: '#0D2E5C' },
};

const Sidebar = () => {
  const { company }  = useDashboard();
  const navigate     = useNavigate();
  const activeMode   = company?.mode || 'corporativo';
  const activePlan   = company?.plan || 'corporativo';
  const allowedIds   = modeModules[activeMode] || modeModules.corporativo;
  const planDef      = plansDefinition[activePlan];
  const modeDef      = MODE_LABELS[activeMode];
  const menuItems    = ALL_MENU_ITEMS.filter(m => allowedIds.includes(m.id));

  return (
    <aside className="sidebar">
      <div className="sidebar-header" style={{ padding: '32px 24px' }}>
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #1FAE66 0%, #1787D4 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(23, 135, 212, 0.4)',
            flexShrink: 0,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)' }} />
            <svg viewBox="0 0 24 24" width="26" height="26" fill="white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))', zIndex: 1 }}>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              <path d="M13.5 8.5l-2 2v2h2l2-2h-2z" fill="#1787D4" /> 
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1 style={{ 
              fontSize: '22px', fontWeight: '900', color: 'white', 
              textShadow: '0 3px 6px rgba(0,0,0,0.3)', margin: 0, letterSpacing: '-0.5px', lineHeight: '1' 
            }}>
              PEBASPRO
            </h1>
            <span className="brand-subtitle" style={{ fontSize: '10px', color: '#1FAE66', marginTop: '4px', letterSpacing: '0.5px' }}>
              Profissionais Locais
            </span>
          </div>
        </div>
        
        <div style={{ marginTop: '12px' }}>
          <span className="panel-tag">Painel Empresarial</span>
        </div>

        {/* Badge do Modo de Experiência */}
        <div className="mode-badge" style={{ borderColor: modeDef.color, color: modeDef.color }}>
          <Zap size={10} fill={modeDef.color} />
          Modo {modeDef.label}
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id}>
              <NavLink to={item.path} className={({ isActive }) => isActive ? 'active' : ''}>
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="plan-card">
          <div className="plan-header">
            <h4>Plano {planDef?.label}</h4>
            <span className="plan-price">{planDef?.price}</span>
          </div>
          <p className="plan-desc">{planDef?.description}</p>
          <div className="progress-bar">
            <div
              className="progress"
              style={{ width: activePlan === 'essencial' ? '33%' : activePlan === 'operacional' ? '66%' : '100%', background: modeDef.color }}
            />
          </div>
          <button className="upgrade-btn" onClick={() => navigate('/planos')}>
            Gerenciar Plano <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

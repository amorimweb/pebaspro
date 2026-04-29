import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Save, X, Building, Bell, Globe, Lock, Zap, ArrowRight, Check, Plus, Trash2, Edit2, ShieldAlert } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { useNavigate } from 'react-router-dom';

const TABS = [
  { id: 'geral',    label: 'Geral',                  icon: <Building size={18} /> },
  { id: 'plano',    label: 'Plano e Perfil',          icon: <Zap size={18} /> },
  { id: 'usuarios', label: 'Usuários e Permissões',   icon: <Lock size={18} /> },
  { id: 'notif',   label: 'Notificações',             icon: <Bell size={18} /> },
  { id: 'integ',   label: 'Integrações eSocial',      icon: <Globe size={18} /> },
];

const MODES = [
  {
    id: 'essencial',
    label: 'Essencial',
    desc: 'Foco em recrutamento, admissão e documentos. Ideal para pequenos negócios.',
    color: '#1FAE66',
    modules: '6 módulos',
  },
  {
    id: 'operacional',
    label: 'Operacional',
    desc: 'Adiciona relatórios e alertas. Para empresas com rotina de contratação.',
    color: '#1787D4',
    modules: '7 módulos',
  },
  {
    id: 'corporativo',
    label: 'Corporativo',
    desc: 'Todos os módulos: Compliance SST, eSocial e relatórios avançados.',
    color: '#0D2E5C',
    modules: '9 módulos',
  },
];

const Settings = () => {
  const { company, setMode, showToast } = useDashboard();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('geral');
  const [formData, setFormData]   = useState({
    companyName: company?.name    || 'PEBASPRO Soluções em Mineração',
    email:       company?.email   || 'contato@pebaspro.com.br',
    phone:       company?.phone   || '(94) 3346-0000',
    address:     company?.address || 'Av. Liberdade, 120 - Parauapebas, PA',
    notifications: true,
    darkMode: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast('Configurações salvas com sucesso!');
  };

  const inputStyle = {
    width: '100%', padding: '12px', borderRadius: '8px',
    border: '1px solid var(--pb-gray-light)', fontSize: '14px',
    outline: 'none', fontFamily: 'inherit',
  };

  const labelStyle = {
    display: 'block', fontSize: '12px', fontWeight: '700',
    color: 'var(--pb-gray-text)', textTransform: 'uppercase', marginBottom: '8px',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ padding: '32px' }}
    >
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '26px', color: 'var(--pb-blue-deep)', fontWeight: '700' }}>Configurações</h2>
        <p style={{ color: 'var(--pb-gray-text)', fontSize: '14px' }}>Gerencie dados da empresa, plano, usuários e preferências de sistema.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '32px' }}>
        {/* Nav lateral */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', borderRadius: '8px', border: 'none',
                background: activeTab === tab.id ? 'rgba(23,135,212,0.08)' : 'transparent',
                color: activeTab === tab.id ? 'var(--pb-blue-brand)' : 'var(--pb-gray-text)',
                fontWeight: activeTab === tab.id ? '600' : '500',
                cursor: 'pointer', textAlign: 'left', fontSize: '14px',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Conteúdo */}
        <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: 'var(--pb-shadow)' }}>

          {/* ── Aba Geral ─────────────────────────────────────────── */}
          {activeTab === 'geral' && (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                {[
                  { name: 'companyName', label: 'Nome da Empresa', type: 'text' },
                  { name: 'email',       label: 'E-mail Administrativo', type: 'email' },
                  { name: 'phone',       label: 'Telefone de Contato', type: 'text' },
                  { name: 'address',     label: 'Endereço Matriz', type: 'text' },
                ].map(field => (
                  <div key={field.name}>
                    <label style={labelStyle}>{field.label}</label>
                    <input type={field.type} name={field.name} value={formData[field.name]} onChange={handleChange} style={inputStyle} />
                  </div>
                ))}
              </div>

              <div style={{ padding: '24px', background: '#F8FAFC', borderRadius: '12px', marginBottom: '32px' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '16px', color: 'var(--pb-blue-deep)' }}>Preferências do Sistema</h4>
                {[
                  { name: 'notifications', label: 'Receber alertas críticos de SST e eSocial por e-mail' },
                  { name: 'darkMode',      label: 'Ativar interface de alto contraste (Acessibilidade)' },
                ].map(pref => (
                  <label key={pref.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '12px' }}>
                    <input type="checkbox" name={pref.name} checked={formData[pref.name]} onChange={handleChange} style={{ width: '17px', height: '17px' }} />
                    <span style={{ fontSize: '14px' }}>{pref.label}</span>
                  </label>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><X size={18} /> Cancelar</button>
                <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Save size={18} /> Salvar Alterações</button>
              </div>
            </form>
          )}

          {/* ── Aba Plano e Perfil ─────────────────────────────────── */}
          {activeTab === 'plano' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--pb-blue-deep)', marginBottom: '8px' }}>Modo de Experiência do Painel</h3>
              <p style={{ fontSize: '14px', color: 'var(--pb-gray-text)', marginBottom: '28px' }}>
                O modo adapta quais módulos ficam visíveis no menu, sem criar sistemas separados. Mude quando quiser.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '40px' }}>
                {MODES.map(m => {
                  const isSelected = company?.mode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      style={{
                        padding: '20px', borderRadius: '14px', textAlign: 'left',
                        border: `2px solid ${isSelected ? m.color : 'var(--pb-gray-light)'}`,
                        background: isSelected ? `${m.color}0f` : 'white',
                        cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
                      }}
                    >
                      {isSelected && (
                        <div style={{
                          position: 'absolute', top: '12px', right: '12px',
                          width: '20px', height: '20px', borderRadius: '50%',
                          background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Check size={11} color="white" strokeWidth={3} />
                        </div>
                      )}
                      <p style={{ fontSize: '12px', fontWeight: '800', color: m.color, textTransform: 'uppercase', marginBottom: '6px' }}>
                        {m.label}
                      </p>
                      <p style={{ fontSize: '13px', color: 'var(--pb-blue-deep)', fontWeight: '600', marginBottom: '6px' }}>{m.modules} ativos</p>
                      <p style={{ fontSize: '12px', color: 'var(--pb-gray-text)', lineHeight: '1.4' }}>{m.desc}</p>
                    </button>
                  );
                })}
              </div>

              <div style={{ borderTop: '1px solid var(--pb-gray-light)', paddingTop: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--pb-blue-deep)', marginBottom: '8px' }}>Plano Atual</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid var(--pb-gray-light)' }}>
                  <div>
                    <p style={{ fontWeight: '700', color: 'var(--pb-blue-deep)', fontSize: '16px', textTransform: 'capitalize' }}>
                      Plano {company?.plan}
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--pb-gray-text)' }}>
                      {company?.plan === 'corporativo' ? 'Todos os módulos disponíveis' : 'Upgrade disponível para mais recursos'}
                    </p>
                  </div>
                  <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => navigate('/planos')}>
                    {company?.plan === 'corporativo' ? 'Ver Planos' : 'Fazer Upgrade'} <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Aba Usuários e Permissões ──────────────────────────── */}
          {activeTab === 'usuarios' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--pb-blue-deep)', marginBottom: '4px' }}>Gestão de Acessos</h3>
                  <p style={{ fontSize: '13px', color: 'var(--pb-gray-text)' }}>Controle quem tem acesso à plataforma e suas permissões.</p>
                </div>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={16} /> Novo Usuário
                </button>
              </div>

              <div className="pb-table-container">
                <table className="pb-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--pb-gray-light)', color: 'var(--pb-gray-text)', fontSize: '13px' }}>
                      <th style={{ padding: '16px' }}>Usuário</th>
                      <th style={{ padding: '16px' }}>Papel</th>
                      <th style={{ padding: '16px' }}>Último Acesso</th>
                      <th style={{ padding: '16px', textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Evanio Vodison', email: 'admin@pebaspro.com.br', role: 'Administrador Global', last: 'Hoje, 08:30' },
                      { name: 'Patrícia Mendes', email: 'rh@pebaspro.com.br', role: 'Gestora de RH', last: 'Ontem, 16:45' },
                      { name: 'Dr. Silva', email: 'sst@pebaspro.com.br', role: 'Eng. de Segurança (SST)', last: '09/04/2026' }
                    ].map((usr, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--pb-gray-light)' }}>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(23,135,212,0.1)', color: 'var(--pb-blue-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                              {usr.name.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: 'var(--pb-blue-deep)', fontSize: '14px' }}>{usr.name}</div>
                              <div style={{ fontSize: '12px', color: 'var(--pb-gray-text)' }}>{usr.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ padding: '6px 12px', background: 'var(--pb-gray-light)', borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: 'var(--pb-text-secondary)' }}>
                            {usr.role}
                          </span>
                        </td>
                        <td style={{ padding: '16px', fontSize: '13px', color: 'var(--pb-gray-text)' }}>{usr.last}</td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          <button className="btn-icon-sml"><Edit2 size={16} /></button>
                          <button className="btn-icon-sml" style={{ color: '#FF5252' }}><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Aba Notificações ─────────────────────────────────────── */}
          {activeTab === 'notif' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--pb-blue-deep)', marginBottom: '24px' }}>Preferências de Alertas</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { title: 'Novos Candidatos', desc: 'Ser notificado quando uma candidatura de alto match de perfil ocorrer.', checked: true },
                  { title: 'Alertas de SST (ASO / NR)', desc: 'Envio imediato por email quando exames ocupacionais estiverem próximos ao vencimento.', checked: true },
                  { title: 'Transmissão eSocial', desc: 'Resumo semanal dos status dos eventos S-2210, S-2220 e S-2240.', checked: true },
                  { title: 'Atualizações do Sistema', desc: 'Novidades referentes a plataforma PEBASPRO Corporativo.', checked: false }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '20px', border: '1px solid var(--pb-gray-light)', borderRadius: '12px' }}>
                    <input type="checkbox" defaultChecked={item.checked} style={{ marginTop: '4px', width: '18px', height: '18px' }} />
                    <div>
                      <h4 style={{ fontSize: '15px', color: 'var(--pb-blue-deep)', fontWeight: '600', marginBottom: '4px' }}>{item.title}</h4>
                      <p style={{ fontSize: '13px', color: 'var(--pb-gray-text)' }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-primary" onClick={() => showToast('Preferências de notificação atualizadas.')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Save size={18} /> Salvar Preferências
                </button>
              </div>
            </div>
          )}

          {/* ── Aba Integrações eSocial ──────────────────────────────── */}
          {activeTab === 'integ' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--pb-blue-deep)', marginBottom: '8px' }}>Integração Governo</h3>
                  <p style={{ fontSize: '13px', color: 'var(--pb-gray-text)' }}>Configurações atreladas ao envio de eventos XML.</p>
                </div>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(31,174,102,0.1)', color: '#1FAE66', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>
                  <Globe size={14} /> AMBIENTE DE PRODUÇÃO ATIVO
                </span>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid var(--pb-gray-light)', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ padding: '12px', background: 'rgba(23,135,212,0.1)', color: 'var(--pb-blue-brand)', borderRadius: '12px' }}>
                    <ShieldAlert size={24} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', color: 'var(--pb-blue-deep)', fontWeight: '700' }}>Certificado Digital A1</h4>
                    <p style={{ fontSize: '13px', color: 'var(--pb-gray-text)' }}>Válido até <strong>21/11/2026</strong>. Emitido por AC Certifica.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn-secondary" style={{ fontSize: '13px' }} onClick={() => showToast('Abrindo seletor de arquivo de certificado digital...', 'info')}>Substituir Certificado PFX</button>
                  <button className="btn-secondary" style={{ fontSize: '13px', color: '#FF5252', borderColor: 'rgba(255,82,82,0.2)' }} onClick={() => showToast('Acesso de integração governamental revogado.', 'error')}>Revogar Acesso</button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>Responsável pelos Envios (CPF)</label>
                  <input type="text" defaultValue="000.000.000-00" style={inputStyle} disabled />
                </div>
                <div>
                  <label style={labelStyle}>Transmissão Automática (SST)</label>
                  <select style={inputStyle}>
                    <option>Ativada - Lote Diário (23:00)</option>
                    <option>Desativada - Apenas manual</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-primary" onClick={() => showToast('Configurações do eSocial atualizadas.')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Save size={18} /> Aplicar Integrações
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;

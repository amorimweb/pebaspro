import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, CheckCircle, Clock, Send, Info, Filter, Download, Wifi } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import './Views.css';

const ESocial = () => {
  const { showToast, exportData } = useDashboard();

  const events = [
    { id: 'S-2200', title: 'Admissão de Trabalhador', status: 'Transmitido', date: '09/04/2026 14:30', resp: 'Patrícia Mendes', protocol: '1.20260409.12345' },
    { id: 'S-2210', title: 'Comunicação de Acidente de Trabalho (CAT)', status: 'Pendente', date: 'Hoje', resp: 'Sistema Automático', protocol: '---' },
    { id: 'S-2220', title: 'Monitoramento da Saúde do Trabalhador', status: 'Processando', date: 'Hoje 09:15', resp: 'Dr. Evanio (SST)', protocol: '2.20260410.98765' },
    { id: 'S-2240', title: 'Condições Ambientais do Trabalho (Risco)', status: 'Transmitido', date: '08/04/2026 16:45', resp: 'Eng. Segurança', protocol: '1.20260408.55443' },
    { id: 'S-1200', title: 'Remuneração de Trabalhador', status: 'Transmitido', date: '05/04/2026 10:00', resp: 'Departamento Pessoal', protocol: '1.20260405.00112' },
  ];

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Transmitido': return { color: 'var(--pb-green-main)', icon: <CheckCircle size={14} /> };
      case 'Pendente': return '#FF5252';
      case 'Processando': return 'var(--pb-turquoise)';
      default: return 'var(--pb-text-secondary)';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Transmitido': return <CheckCircle size={14} />;
      case 'Pendente': return <ShieldAlert size={14} />;
      case 'Processando': return <Clock size={14} />;
      default: return <Info size={14} />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="view-container"
    >
      <div className="view-header">
        <div className="title-group">
          <h2>Monitoramento eSocial</h2>
          <p>Acompanhe a transmissão e conformidade dos eventos SST e Trabalhistas em tempo real.</p>
        </div>
        <div className="view-actions" style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={() => exportData('Relatório eSocial Consolidado - PDF')}>
            <Download size={18} /> 
            Relatório eSocial
          </button>
          <button className="btn-primary" onClick={() => exportData('Processamento em Lote dos Eventos eSocial')}>
            <Send size={18} /> 
            Transmitir Lote
          </button>
        </div>
      </div>

      <div className="esocial-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
        <div className="events-main">
          <div className="pb-table-container" style={{ padding: '24px' }}>
            <div className="section-title-row">
              <h3>Linha do Tempo de Eventos</h3>
              <button className="btn-icon-sml" onClick={() => showToast('Aplicando filtros avançados na timeline...', 'info')}><Filter size={16} /></button>
            </div>

            <div className="timeline-wrapper" style={{ position: 'relative', marginTop: '20px' }}>
              <div style={{ position: 'absolute', left: '16px', top: '10px', bottom: '10px', width: '2px', background: 'var(--pb-gray-light)' }}></div>
              
              {events.map((event, idx) => {
                const config = getStatusConfig(event.status);
                const color = typeof config === 'string' ? config : config.color;
                return (
                  <div key={idx} className="timeline-item" style={{ position: 'relative', paddingLeft: '50px', marginBottom: '32px' }}>
                    <div style={{ 
                      position: 'absolute', left: '0', top: '0', width: '34px', height: '34px', borderRadius: '50%', background: 'white', 
                      border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, zIndex: 1,
                      boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                    }}>
                      {getStatusIcon(event.status)}
                    </div>
                    <div className="event-card" style={{ padding: '20px', borderRadius: '16px', background: '#F8FAFC', border: '1px solid var(--pb-gray-light)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <span style={{ fontSize: '11px', fontWeight: '900', color: color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{event.id} • {event.status}</span>
                          <h4 style={{ fontSize: '16px', color: 'var(--pb-blue-deep)', fontWeight: '800' }}>{event.title}</h4>
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--pb-text-secondary)', fontWeight: '600' }}>{event.date}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px', paddingTop: '12px', borderTop: '1px solid #EDEDED' }}>
                        <div>
                          <span style={{ color: 'var(--pb-text-secondary)', fontWeight: '600' }}>Responsável</span>
                          <p style={{ fontWeight: '700', color: 'var(--pb-blue-deep)' }}>{event.resp}</p>
                        </div>
                        <div>
                          <span style={{ color: 'var(--pb-text-secondary)', fontWeight: '600' }}>Protocolo</span>
                          <p style={{ fontWeight: '700', fontFamily: 'monospace', color: 'var(--pb-blue-deep)' }}>{event.protocol}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="esocial-sidebar">
          <div style={{ background: 'var(--pb-blue-deep)', padding: '24px', borderRadius: '20px', color: 'white', marginBottom: '24px', boxShadow: '0 10px 20px rgba(13, 71, 161, 0.2)' }}>
            <h4 style={{ fontSize: '16px', marginBottom: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} color="var(--pb-green-main)" />
              Conformidade
            </h4>
            <div style={{ fontSize: '36px', fontWeight: '900', marginBottom: '4px' }}>98.2%</div>
            <p style={{ fontSize: '13px', opacity: 0.8, fontWeight: '500' }}>Aderência ao leiaute eSocial</p>
            <div style={{ marginTop: '20px', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: '98.2%', height: '100%', background: 'var(--pb-green-main)', borderRadius: '10px' }}></div>
            </div>
          </div>

          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: 'var(--pb-shadow)', border: '1px solid var(--pb-gray-light)' }}>
            <h4 style={{ fontSize: '15px', color: 'var(--pb-blue-deep)', marginBottom: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wifi size={18} color="var(--pb-blue-brand)" />
              Serviços Externos
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Ambiente de Produção', status: 'ONLINE' },
                { label: 'Certificado Digital', status: 'VÁLIDO' },
                { label: 'Webservices Governo', status: 'OPERACIONAL' }
              ].map((svc, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: i < 2 ? '12px' : 0, borderBottom: i < 2 ? '1px solid #F1F5F9' : 'none' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--pb-text-main)' }}>{svc.label}</span>
                  <span style={{ color: 'var(--pb-green-main)', fontSize: '11px', fontWeight: '900' }}>{svc.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ESocial;

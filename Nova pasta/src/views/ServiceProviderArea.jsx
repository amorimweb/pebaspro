import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Star, MapPin, Clock, ArrowRight, CheckCircle, Lock } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { useNavigate } from 'react-router-dom';

const ServiceProviderArea = () => {
  const { company } = useDashboard();
  const navigate    = useNavigate();
  const isActive    = company?.serviceProviderActive;

  // Se não está ativado, mostrar tela de bloqueio
  if (!isActive) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}
      >
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(23,135,212,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '28px' }}>
          <Lock size={36} color="var(--pb-blue-brand)" />
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--pb-blue-deep)', marginBottom: '12px' }}>
          Área de Prestador não ativada
        </h2>
        <p style={{ fontSize: '15px', color: 'var(--pb-gray-text)', maxWidth: '420px', lineHeight: '1.6', marginBottom: '32px' }}>
          Ative a prestação de serviço a partir da Visão Geral para acessar este painel. Não é necessário criar uma nova conta.
        </p>
        <button className="btn-primary" onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 28px' }}>
          Ir para Visão Geral <ArrowRight size={18} />
        </button>
      </motion.div>
    );
  }

  // Dados do perfil ativado
  const sp = company.serviceProviderData;

  const mockServices = [
    { title: 'Manutenção de Equipamentos', views: 142, leads: 18, rating: 4.8 },
    { title: 'Treinamento NR-35', views: 89, leads: 11, rating: 4.9 },
    { title: 'Fornecimento de EPIs', views: 220, leads: 34, rating: 4.7 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: '32px' }}
    >
      {/* Header do Perfil */}
      <div style={{ background: 'linear-gradient(135deg, #0D2E5C 0%, #1787D4 100%)', borderRadius: '20px', padding: '32px', color: 'white', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-30px', top: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <CheckCircle size={18} color="#1FAE66" />
              <span style={{ fontSize: '12px', fontWeight: '700', opacity: 0.8, textTransform: 'uppercase' }}>Perfil Ativo como Prestador</span>
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '4px' }}>{company?.name}</h2>
            <div style={{ display: 'flex', gap: '20px', marginTop: '12px', fontSize: '13px', opacity: 0.85 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Briefcase size={14} />{sp?.categoria}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} />{sp?.area}</span>
            </div>
          </div>
          <button className="btn-secondary" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(10px)' }}
            onClick={() => {}}>
            Editar Perfil
          </button>
        </div>
      </div>

      {/* KPIs do Prestador */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        {[
          { label: 'Visualizações do Perfil', value: '1.4k', sub: 'Últimos 30 dias' },
          { label: 'Leads Recebidos', value: '63', sub: 'Este mês' },
          { label: 'Contratos Ativos', value: '7', sub: 'Vigentes' },
          { label: 'Avaliação Média', value: '4.8★', sub: '12 avaliações' },
        ].map((kpi, idx) => (
          <div key={idx} style={{ background: 'white', padding: '20px 24px', borderRadius: '14px', border: '1px solid var(--pb-gray-light)', boxShadow: 'var(--pb-shadow)' }}>
            <p style={{ fontSize: '12px', color: 'var(--pb-gray-text)', marginBottom: '8px', fontWeight: '600' }}>{kpi.label}</p>
            <h3 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--pb-blue-deep)', marginBottom: '4px' }}>{kpi.value}</h3>
            <span style={{ fontSize: '12px', color: 'var(--pb-gray-text)' }}>{kpi.sub}</span>
          </div>
        ))}
      </div>

      {/* Serviços */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: 'var(--pb-shadow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--pb-blue-deep)' }}>Meus Serviços</h3>
          <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }}>+ Publicar Serviço</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mockServices.map((svc, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #EEF2F7' }}>
              <div>
                <p style={{ fontWeight: '600', color: 'var(--pb-blue-deep)', marginBottom: '4px' }}>{svc.title}</p>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--pb-gray-text)' }}>
                  <span>{svc.views} visualizações</span>
                  <span>{svc.leads} leads</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Star size={14} fill="#F9C74F" stroke="#F9C74F" />
                <span style={{ fontWeight: '700', fontSize: '14px' }}>{svc.rating}</span>
              </div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: '20px', fontSize: '13px', color: 'var(--pb-gray-text)', textAlign: 'center', fontStyle: 'italic' }}>
          Esta é a área da plataforma de prestadores já existente no PEBASPRO, acessível com a mesma conta.
        </p>
      </div>
    </motion.div>
  );
};

export default ServiceProviderArea;

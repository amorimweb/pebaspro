import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, CheckCircle, ExternalLink } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import ServiceProviderModal from './ServiceProviderModal';
import { useNavigate } from 'react-router-dom';

const ServiceProviderCard = () => {
  const { company } = useDashboard();
  const [modalOpen, setModalOpen]  = useState(false);
  const navigate = useNavigate();
  const isActive = company?.serviceProviderActive;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="service-provider-card"
        style={{
          background: isActive
            ? 'linear-gradient(135deg, #0D2E5C 0%, #1787D4 100%)'
            : 'linear-gradient(135deg, #0D2E5C 0%, #1a3d6b 60%, #1787D4 100%)',
          borderRadius: '16px',
          padding: '28px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          margin: '0 32px 32px 32px',
        }}
      >
        {/* Elemento decorativo */}
        <div style={{
          position: 'absolute', right: '-40px', top: '-40px',
          width: '180px', height: '180px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }} />
        <div style={{
          position: 'absolute', right: '40px', bottom: '-60px',
          width: '140px', height: '140px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.12)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {isActive
              ? <CheckCircle size={24} color="#1FAE66" />
              : <Zap size={24} color="#F9C74F" fill="#F9C74F" />
            }
          </div>
          <div>
            {isActive ? (
              <>
                <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', opacity: 0.7, marginBottom: '4px', letterSpacing: '0.5px' }}>
                  Prestação de Serviço Ativa
                </p>
                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
                  Sua empresa também é prestadora
                </h3>
                <p style={{ fontSize: '13px', opacity: 0.75, marginTop: '4px' }}>
                  Categoria: <strong>{company?.serviceProviderData?.categoria}</strong> • {company?.serviceProviderData?.area}
                </p>
              </>
            ) : (
              <>
                <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', opacity: 0.7, marginBottom: '4px', letterSpacing: '0.5px' }}>
                  Expanda seus negócios
                </p>
                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
                  Ative a Prestação de Serviço
                </h3>
                <p style={{ fontSize: '13px', opacity: 0.75, marginTop: '4px' }}>
                  Use a mesma conta para oferecer serviços a outras empresas no PEBASPRO.
                </p>
              </>
            )}
          </div>
        </div>

        <div style={{ flexShrink: 0, position: 'relative' }}>
          {isActive ? (
            <button
              onClick={() => navigate('/prestador')}
              style={{
                padding: '12px 24px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.12)', color: 'white', fontWeight: '600', fontSize: '14px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap',
                backdropFilter: 'blur(10px)',
              }}
            >
              <ExternalLink size={16} /> Acessar Área de Prestador
            </button>
          ) : (
            <button
              onClick={() => setModalOpen(true)}
              style={{
                padding: '14px 28px', borderRadius: '10px', border: 'none',
                background: '#1FAE66', color: 'white', fontWeight: '700', fontSize: '14px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap',
                boxShadow: '0 4px 20px rgba(31,174,102,0.4)',
              }}
            >
              Ativar Agora <ArrowRight size={16} />
            </button>
          )}
        </div>
      </motion.div>

      <ServiceProviderModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default ServiceProviderCard;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Building2, Rocket, ArrowRight, Shield } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { plansDefinition } from '../data/mockData';

const PLAN_ICONS = {
  essencial:   <Zap size={28} />,
  operacional: <Building2 size={28} />,
  corporativo: <Rocket size={28} />,
};

const PLAN_FEATURES = {
  essencial: [
    { text: '3 vagas ativas simultâneas', ok: true },
    { text: '1 usuário administrador', ok: true },
    { text: 'Banco de Talentos', ok: true },
    { text: 'Admissão Digital simples', ok: true },
    { text: 'Gestão de Documentos', ok: true },
    { text: 'Relatórios avançados', ok: false },
    { text: 'Compliance SST', ok: false },
    { text: 'eSocial integrado', ok: false },
    { text: 'Prestação de serviço', ok: false },
  ],
  operacional: [
    { text: '15 vagas ativas simultâneas', ok: true },
    { text: 'Até 5 usuários internos', ok: true },
    { text: 'Banco de Talentos avançado', ok: true },
    { text: 'Admissão Digital completa', ok: true },
    { text: 'Gestão de Documentos', ok: true },
    { text: 'Relatórios operacionais', ok: true },
    { text: 'Compliance SST', ok: false },
    { text: 'eSocial integrado', ok: false },
    { text: 'Prestação de serviço (add-on)', ok: true },
  ],
  corporativo: [
    { text: 'Vagas ilimitadas', ok: true },
    { text: 'Usuários ilimitados', ok: true },
    { text: 'Banco de Talentos premium', ok: true },
    { text: 'Admissão Digital multifilial', ok: true },
    { text: 'Gestão de Documentos', ok: true },
    { text: 'Relatórios avançados + exportação', ok: true },
    { text: 'Compliance SST completo', ok: true },
    { text: 'eSocial integrado', ok: true },
    { text: 'Prestação de serviço incluída', ok: true },
  ],
};

const Plans = () => {
  const { company, setPlan } = useDashboard();
  const [hovered, setHovered] = useState(null);
  const currentPlan = company?.plan || 'corporativo';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: '40px' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '56px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--pb-blue-deep)', marginBottom: '12px' }}>
          Escolha o plano ideal para sua empresa
        </h2>
        <p style={{ fontSize: '16px', color: 'var(--pb-gray-text)', maxWidth: '540px', margin: '0 auto', lineHeight: '1.6' }}>
          Do pequeno comércio à grande operação — o PEBASPRO escala com você. Mude de plano quando precisar, sem perder dados.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
        {Object.values(plansDefinition).map((plan) => {
          const isCurrent   = plan.id === currentPlan;
          const isHovered   = hovered === plan.id;
          const isHighlight = plan.id === 'corporativo';

          return (
            <motion.div
              key={plan.id}
              whileHover={{ y: -6 }}
              onHoverStart={() => setHovered(plan.id)}
              onHoverEnd={() => setHovered(null)}
              style={{
                background: isHighlight ? `linear-gradient(160deg, ${plan.color} 0%, #1787D4 100%)` : 'white',
                color: isHighlight ? 'white' : 'inherit',
                borderRadius: '20px',
                padding: '32px',
                border: isCurrent ? `2px solid ${plan.color}` : isHighlight ? 'none' : '1px solid var(--pb-gray-light)',
                boxShadow: isHighlight
                  ? `0 20px 60px rgba(13,46,92,0.25)`
                  : isHovered ? '0 12px 40px rgba(0,0,0,0.08)' : 'var(--pb-shadow)',
                position: 'relative',
                transition: 'box-shadow 0.3s',
              }}
            >
              {isHighlight && (
                <div style={{
                  position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
                  background: '#1FAE66', color: 'white', padding: '4px 16px', borderRadius: '20px',
                  fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px',
                  whiteSpace: 'nowrap',
                }}>
                  Mais Popular
                </div>
              )}

              {isCurrent && (
                <div style={{
                  position: 'absolute', top: '-14px', right: '20px',
                  background: plan.color, color: 'white', padding: '4px 14px', borderRadius: '20px',
                  fontSize: '11px', fontWeight: '800', textTransform: 'uppercase',
                }}>
                  Plano Atual
                </div>
              )}

              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px', marginBottom: '16px',
                  background: isHighlight ? 'rgba(255,255,255,0.15)' : `rgba(${plan.color === '#1FAE66' ? '31,174,102' : plan.color === '#1787D4' ? '23,135,212' : '13,46,92'},0.1)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isHighlight ? 'white' : plan.color,
                }}>
                  {PLAN_ICONS[plan.id]}
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '4px' }}>{plan.label}</h3>
                <p style={{ fontSize: '13px', opacity: isHighlight ? 0.8 : undefined, color: isHighlight ? 'inherit' : 'var(--pb-gray-text)', marginBottom: '16px' }}>{plan.description}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '32px', fontWeight: '800' }}>{plan.price.split('/')[0]}</span>
                  <span style={{ fontSize: '14px', opacity: 0.7 }}>/mês</span>
                </div>
              </div>

              <div style={{ marginBottom: '28px' }}>
                {PLAN_FEATURES[plan.id].map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', fontSize: '13px', opacity: feat.ok ? 1 : 0.4 }}>
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                      background: feat.ok ? (isHighlight ? 'rgba(255,255,255,0.2)' : 'rgba(31,174,102,0.15)') : 'transparent',
                      border: feat.ok ? 'none' : `1px solid ${isHighlight ? 'rgba(255,255,255,0.2)' : '#E2E8F0'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {feat.ok && <Check size={10} color={isHighlight ? 'white' : '#1FAE66'} strokeWidth={3} />}
                    </div>
                    {feat.text}
                  </div>
                ))}
              </div>

              <button
                onClick={() => !isCurrent && setPlan(plan.id)}
                style={{
                  width: '100%', padding: '14px', borderRadius: '12px',
                  background: isCurrent
                    ? 'transparent'
                    : isHighlight ? '#1FAE66' : plan.color,
                  color: isCurrent ? (isHighlight ? 'white' : plan.color) : 'white',
                  border: isCurrent ? `1.5px solid ${isHighlight ? 'rgba(255,255,255,0.4)' : plan.color}` : 'none',
                  fontSize: '14px', fontWeight: '700', cursor: isCurrent ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                {isCurrent ? (
                  <><Check size={16} /> Plano Atual</>
                ) : (
                  <>Assinar {plan.label} <ArrowRight size={16} /></>
                )}
              </button>

              {plan.id === 'corporativo' && (
                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: 0.7, fontSize: '12px' }}>
                  <Shield size={12} />
                  Suporte premium incluído
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Plans;

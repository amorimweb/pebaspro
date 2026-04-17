import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, ArrowRight, Building, MapPin, Tag, FileText } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { useNavigate } from 'react-router-dom';

const CATEGORIAS = [
  'Construção Civil', 'Limpeza e Conservação', 'Segurança Patrimonial',
  'Tecnologia da Informação', 'Alimentação e Catering', 'Logística e Transporte',
  'Saúde Ocupacional', 'Treinamento e Capacitação', 'Consultoria Empresarial',
  'Manutenção Industrial', 'Serviços Elétricos e Hidráulicos', 'Outro',
];

const ServiceProviderModal = ({ isOpen, onClose }) => {
  const { company, activateServiceProvider } = useDashboard();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ categoria: '', area: '', descricao: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleActivate = () => {
    setLoading(true);
    setTimeout(() => {
      activateServiceProvider(form);
      setLoading(false);
      setStep(3);
    }, 1500);
  };

  const handleRedirect = () => {
    onClose();
    navigate('/prestador');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(13,46,92,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(4px)',
        }}
      >
        <motion.div
          key="modal-content"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'white', borderRadius: '20px', width: '100%', maxWidth: '520px',
            padding: '40px', boxShadow: '0 30px 80px rgba(0,0,0,0.2)', position: 'relative',
          }}
        >
          <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
            <X size={22} />
          </button>

          {/* Indicador de etapas */}
          {step < 3 && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
              {[1, 2].map(s => (
                <div key={s} style={{
                  height: '4px', flex: 1, borderRadius: '4px',
                  background: s <= step ? 'var(--pb-blue-brand)' : '#E2E8F0',
                  transition: 'background 0.3s',
                }} />
              ))}
            </div>
          )}

          {/* ── Passo 1: Confirmação ──────────────────────────────── */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(23,135,212,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Building size={24} color="var(--pb-blue-brand)" />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--pb-blue-deep)', marginBottom: '8px' }}>
                Ativar Prestação de Serviço
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--pb-gray-text)', marginBottom: '28px', lineHeight: '1.6' }}>
                Vamos habilitar o perfil de prestador para <strong>{company?.name}</strong> usando a mesma conta e login que você já possui. Nenhum novo cadastro é necessário.
              </p>

              <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '20px', marginBottom: '28px' }}>
                <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--pb-gray-text)', textTransform: 'uppercase', marginBottom: '12px' }}>Dados que serão reaproveitados</p>
                {[
                  { label: 'Empresa', value: company?.name },
                  { label: 'CNPJ', value: company?.cnpj },
                  { label: 'E-mail', value: company?.email },
                  { label: 'Telefone', value: company?.phone },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                    <span style={{ color: 'var(--pb-gray-text)' }}>{row.label}</span>
                    <span style={{ fontWeight: '600', color: 'var(--pb-blue-deep)' }}>{row.value}</span>
                  </div>
                ))}
              </div>

              <button className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }} onClick={() => setStep(2)}>
                Continuar <ArrowRight size={18} />
              </button>
            </motion.div>
          )}

          {/* ── Passo 2: Dados Complementares ───────────────────────── */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(31,174,102,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Tag size={24} color="var(--pb-green-primary)" />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--pb-blue-deep)', marginBottom: '8px' }}>
                Dados Complementares
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--pb-gray-text)', marginBottom: '28px' }}>
                Apenas as informações necessárias para sua empresa aparecer como prestadora de serviços.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--pb-gray-text)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    <Tag size={12} style={{ marginRight: '4px' }} /> Categoria de Serviço
                  </label>
                  <select name="categoria" value={form.categoria} onChange={handleChange}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--pb-gray-light)', fontSize: '14px', background: 'white' }}>
                    <option value="">Selecione uma categoria...</option>
                    {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--pb-gray-text)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    <MapPin size={12} style={{ marginRight: '4px' }} /> Área de Atendimento
                  </label>
                  <input type="text" name="area" value={form.area} onChange={handleChange}
                    placeholder="Ex: Parauapebas, Canaã dos Carajás, Marabá..."
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--pb-gray-light)', fontSize: '14px' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--pb-gray-text)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    <FileText size={12} style={{ marginRight: '4px' }} /> Descrição Comercial
                  </label>
                  <textarea name="descricao" value={form.descricao} onChange={handleChange}
                    placeholder="Descreva brevemente os serviços que sua empresa oferece..."
                    rows={3}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--pb-gray-light)', fontSize: '14px', resize: 'vertical' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-secondary" style={{ flex: 1, padding: '14px' }} onClick={() => setStep(1)}>Voltar</button>
                <button
                  className="btn-primary"
                  style={{ flex: 2, padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px' }}
                  onClick={handleActivate}
                  disabled={!form.categoria || !form.area || loading}
                >
                  {loading ? 'Ativando...' : <>Ativar e Acessar <ArrowRight size={16} /></>}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Passo 3: Sucesso ─────────────────────────────────────── */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(31,174,102,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}
              >
                <CheckCircle size={36} color="var(--pb-green-primary)" />
              </motion.div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--pb-blue-deep)', marginBottom: '12px' }}>
                Perfil Ativado!
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--pb-gray-text)', marginBottom: '32px', lineHeight: '1.6' }}>
                Sua empresa agora também é prestadora de serviços no PEBASPRO. Use a mesma conta para acessar a área de prestador.
              </p>
              <button className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px' }} onClick={handleRedirect}>
                Acessar Área de Prestador
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ServiceProviderModal;

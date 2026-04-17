import React from 'react';
import { motion } from 'framer-motion';

const MockView = ({ title, description }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    style={{ padding: '40px' }}
  >
    <h2 style={{ fontSize: '24px', color: 'var(--pb-blue-deep)', marginBottom: '8px' }}>{title}</h2>
    <p style={{ color: 'var(--pb-gray-text)' }}>{description}</p>
    <div style={{ marginTop: '32px', padding: '100px', border: '2px dashed var(--pb-gray-light)', borderRadius: '12px', textAlign: 'center', color: 'var(--pb-gray-text)' }}>
      Conteúdo em desenvolvimento para a view de {title}.
      <br /> Todos os dados simulados estão ativos no motor central.
    </div>
  </motion.div>
);

export const RecruitmentView = () => <MockView title="Recrutamento" description="Gerencie suas vagas e processos seletivos de ponta a ponta." />;
export const TalentBankView = () => <MockView title="Banco de Talentos" description="Pesquise e gerencie profissionais de Parauapebas e região." />;
export const DocumentsView = () => <MockView title="Documentos" description="Central de gestão documental e conformidade trabalhista." />;
export const ConfigurationView = () => <MockView title="Configurações" description="Ajuste as preferências do seu portal empresarial PEBASPRO." />;

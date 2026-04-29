import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Plus, Search, Filter, MoreVertical, ExternalLink, Trash2 } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import RecruitmentPipeline from '../components/RecruitmentPipeline';
import './Views.css';

const Recruitment = () => {
  const { vagas, addVaga, deleteVaga, showToast, isVagaFormOpen, openVagaForm, closeVagaForm } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');
  const [newVagaData, setNewVagaData] = useState({ title: '', setor: '', status: 'Aberta' });

  const filteredVagas = vagas.filter(v => 
    v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.setor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveVaga = (e) => {
    e.preventDefault();
    if (!newVagaData.title || !newVagaData.setor) {
      showToast('Por favor, preencha todos os campos.', 'error');
      return;
    }
    addVaga(newVagaData);
    setNewVagaData({ title: '', setor: '', status: 'Aberta' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="view-container"
    >
      <div className="view-header">
        <div className="title-group">
          <h2>Gestão de Recrutamento</h2>
          <p>Gerencie suas vagas abertas e o fluxo de candidatos em um único lugar.</p>
        </div>
        <button className="btn-primary" onClick={openVagaForm}>
          <Plus size={18} />
          Nova Vaga
        </button>
      </div>

      {isVagaFormOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="pb-table-container" 
          style={{ marginBottom: '40px', padding: '32px', background: 'var(--pb-blue-deep)', color: 'white' }}
        >
          <h3 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: '800' }}>Configurar Nova Vaga</h3>
          <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '20px', alignItems: 'flex-end' }} onSubmit={handleSaveVaga}>
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', opacity: 0.8 }}>Título do Cargo</label>
              <input 
                type="text" 
                placeholder="Ex: Operador de Escavadeira" 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white' }}
                value={newVagaData.title}
                onChange={(e) => setNewVagaData({...newVagaData, title: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', opacity: 0.8 }}>Setor / Departamento</label>
              <input 
                type="text" 
                placeholder="Ex: Operacional" 
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white' }}
                value={newVagaData.setor}
                onChange={(e) => setNewVagaData({...newVagaData, setor: e.target.value})}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" className="btn-secondary" onClick={closeVagaForm} style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', background: 'transparent' }}>Cancelar</button>
              <button type="submit" className="btn-primary" style={{ background: 'var(--pb-green-main)', border: 'none' }}>Publicar Vaga</button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="vacancies-section" style={{ marginBottom: '40px' }}>
        <div className="section-title-row">
          <h3>Vagas Ativas</h3>
          <div className="filters-bar" style={{ marginBottom: 0 }}>
            <div className="search-box">
              <Search size={14} />
              <input 
                type="text" 
                placeholder="Buscar vagas..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn-icon-sml" title="Filtros" onClick={() => showToast('Aplicando filtros avançados nas vagas...', 'info')}>
              <Filter size={16} />
            </button>
          </div>
        </div>

        <div className="pb-table-container">
          <table className="pb-table">
            <thead>
              <tr>
                <th>Cargo / Título</th>
                <th>Setor</th>
                <th>Status</th>
                <th>Candidatos</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredVagas.map((vaga) => (
                <tr key={vaga.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="btn-icon-sml" style={{ background: 'rgba(30, 136, 229, 0.08)', borderColor: 'transparent', color: 'var(--pb-blue-brand)' }}>
                        <Briefcase size={18} />
                      </div>
                      <span style={{ fontWeight: '700', color: 'var(--pb-blue-deep)' }}>{vaga.title}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>{vaga.setor}</span>
                  </td>
                  <td>
                    <span className="status-badge" style={{ background: 'rgba(76, 217, 100, 0.1)', color: 'var(--pb-green-main)' }}>
                      {vaga.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--pb-blue-deep)' }}>{vaga.candidatos}</span>
                      <span style={{ fontSize: '12px', color: 'var(--pb-text-secondary)', fontWeight: '500' }}>inscritos</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="btn-icon-sml" onClick={() => showToast('Abrindo visualização da vaga...')}><ExternalLink size={16} /></button>
                      <button className="btn-icon-sml" onClick={() => deleteVaga(vaga.id)} style={{ color: '#FF5252' }}><Trash2 size={16} /></button>
                      <button className="btn-icon-sml" onClick={() => showToast('Exibindo menu de ações avançadas...', 'info')}><MoreVertical size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredVagas.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--pb-text-secondary)' }}>
              Nenhuma vaga encontrada para sua busca.
            </div>
          )}
        </div>
      </div>

      <div className="pipeline-section-wrapper" style={{ margin: '0 -32px' }}>
        <RecruitmentPipeline />
      </div>
    </motion.div>
  );
};

export default Recruitment;

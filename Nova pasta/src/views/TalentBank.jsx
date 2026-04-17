import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Filter, MoreVertical, Download, UserPlus, Star } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import './Views.css';

const TalentBank = () => {
  const { candidates, toggleFavorite, showToast, exportData } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTalents = candidates.filter(cand => 
    cand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cand.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="view-container"
    >
      <div className="view-header">
        <div className="title-group">
          <h2>Banco de Talentos</h2>
          <p>Pesquise e gerencie profissionais qualificados da região de Parauapebas.</p>
        </div>
        <button className="btn-primary" onClick={() => showToast('Abrindo formulário de cadastro...', 'info')}>
          <UserPlus size={18} />
          Cadastrar Talento
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome, cargo ou palavra-chave..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn-secondary" onClick={() => showToast('Painel de filtros avançados em desenvolvimento.', 'info')}>
          <Filter size={18} />
          Filtros Avançados
        </button>
        <button className="btn-secondary" onClick={() => exportData('Banco de Talentos (Planilha)')}>
          <Download size={18} />
          Exportar Lista
        </button>
      </div>

      <div className="pb-table-container">
        <table className="pb-table">
          <thead>
            <tr>
              <th>Profissional</th>
              <th>Cargo / Skill</th>
              <th>Aderência</th>
              <th>Localização</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredTalents.map((talent) => (
              <tr key={talent.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '12px', 
                      background: 'var(--pb-blue-deep)', 
                      color: 'white', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontWeight: '800', 
                      fontSize: '15px',
                      boxShadow: '0 4px 10px rgba(13, 71, 161, 0.2)'
                    }}>
                      {talent.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', color: 'var(--pb-blue-deep)', fontSize: '15px' }}>{talent.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--pb-text-secondary)', fontWeight: '500' }}>ID: #{talent.id}PT26</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--pb-text-main)' }}>{talent.role}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '80px', height: '8px', background: 'var(--pb-gray-light)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ width: `${talent.score}%`, height: '100%', background: 'var(--pb-green-main)' }}></div>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--pb-green-main)' }}>{talent.score}%</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--pb-text-secondary)', fontSize: '13px', fontWeight: '500' }}>
                    <MapPin size={14} color="var(--pb-blue-brand)" />
                    {talent.location}
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button 
                      className="btn-icon-sml" 
                      onClick={() => toggleFavorite(talent.id)}
                      style={{ color: talent.isFavorite ? '#FFB800' : 'var(--pb-text-secondary)' }}
                    >
                      <Star size={18} fill={talent.isFavorite ? '#FFB800' : 'none'} />
                    </button>
                    <button className="btn-icon-sml" onClick={() => exportData(`Currículo - ${talent.name}`)}><Download size={18} /></button>
                    <button className="btn-icon-sml" onClick={() => showToast('Exibindo ações do candidato...', 'info')}><MoreVertical size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTalents.length === 0 && (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--pb-text-secondary)' }}>
            Nenhum talento encontrado para "{searchTerm}".
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TalentBank;

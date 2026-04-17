import React, { createContext, useContext, useState, useCallback } from 'react';
import { initialCandidates, initialAlerts, initialVagas, companyProfileMock } from '../data/mockData';

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [candidates, setCandidates]     = useState(initialCandidates);
  const [alerts, setAlerts]             = useState(initialAlerts);
  const [vagas, setVagas]               = useState(initialVagas);
  const [toast, setToast]               = useState(null);
  const [company, setCompany]           = useState(companyProfileMock);
  const [isVagaFormOpen, setIsVagaFormOpen] = useState(false);

  // ── Toast ────────────────────────────────────────────────────────────────
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Modo de experiência ──────────────────────────────────────────────────
  const setMode = (mode) => {
    setCompany(prev => ({ ...prev, mode }));
    showToast(`Modo alterado para ${mode.charAt(0).toUpperCase() + mode.slice(1)}!`);
  };

  // ── Plano ────────────────────────────────────────────────────────────────
  const setPlan = (plan) => {
    setCompany(prev => ({ ...prev, plan }));
    showToast(`Plano "${plan}" ativado com sucesso!`);
  };

  // ── Ativar prestador de serviço ──────────────────────────────────────────
  const activateServiceProvider = (data) => {
    setCompany(prev => ({
      ...prev,
      serviceProviderActive: true,
      serviceProviderData: {
        categoria: data.categoria,
        area: data.area,
        descricao: data.descricao,
        activatedAt: new Date().toISOString(),
      },
    }));
    showToast('Perfil de prestador ativado com sucesso!');
  };

  // ── Candidatos ───────────────────────────────────────────────────────────
  const moveCandidate = (candidateId, newStatus) => {
    setCandidates(prev => prev.map(c =>
      c.id === candidateId ? { ...c, status: newStatus } : c
    ));
    showToast(`Candidato movido para ${newStatus}`);
  };

  const updateAdmissionProgress = (candidateId, increment) => {
    setCandidates(prev => prev.map(c =>
      c.id === candidateId ? { ...c, progress: Math.min(100, (c.progress || 0) + increment) } : c
    ));
  };

  // ── Alertas ──────────────────────────────────────────────────────────────
  const resolveAlert = (alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    showToast('Pendência regularizada com sucesso!');
  };

  // ── Vagas ────────────────────────────────────────────────────────────────
  const addVaga = (novaVaga) => {
    setVagas(prev => [...prev, { ...novaVaga, id: Date.now(), candidatos: 0, status: 'Aberta' }]);
    setIsVagaFormOpen(false);
    showToast('Nova vaga publicada!');
  };

  const deleteVaga = (vagaId) => {
    setVagas(prev => prev.filter(v => v.id !== vagaId));
    showToast('Vaga removida com sucesso!', 'error');
  };

  const openVagaForm  = () => setIsVagaFormOpen(true);
  const closeVagaForm = () => setIsVagaFormOpen(false);

  // ── Talentos ──────────────────────────────────────────────────────────────
  const toggleFavorite = (candidateId) => {
    setCandidates(prev => prev.map(c =>
      c.id === candidateId ? { ...c, isFavorite: !c.isFavorite } : c
    ));
  };

  // ── Exportação (simulada) ─────────────────────────────────────────────────
  const exportData = useCallback((label = 'Dados') => {
    showToast(`Exportando: ${label}...`, 'info');
  }, []);

  return (
    <DashboardContext.Provider value={{
      // dados
      candidates, alerts, vagas, company,
      // toast
      toast, showToast,
      // ações empresa
      setMode, setPlan, activateServiceProvider,
      // ações candidatos
      moveCandidate, updateAdmissionProgress, toggleFavorite,
      // ações alertas
      resolveAlert,
      // ações vagas
      addVaga, deleteVaga, isVagaFormOpen, openVagaForm, closeVagaForm,
      // utilitários
      exportData,
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be used within DashboardProvider');
  return context;
};

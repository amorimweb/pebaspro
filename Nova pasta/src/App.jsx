import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
// Views existentes
import Overview             from './views/Overview';
import Recruitment          from './views/Recruitment';
import TalentBank           from './views/TalentBank';
import Admissao             from './views/Admissao';
import Documents            from './views/Documents';
import Compliance           from './views/Compliance';
import ESocial              from './views/ESocial';
import Reports              from './views/Reports';
import Settings             from './views/Settings';
// Novos módulos estratégicos
import Plans                from './views/Plans';
import ServiceProviderArea  from './views/ServiceProviderArea';
// Context
import { useDashboard } from './context/DashboardContext';
import './App.css';
import CookieConsentBanner from './components/CookieConsentBanner';
import PatriciaCopilot from './components/PatriciaCopilot';

const Toast = ({ message, type }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, x: '50%' }}
    animate={{ opacity: 1, y: 0, x: 0 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className={`toast ${type}`}
  >
    <span>{message}</span>
  </motion.div>
);

function App() {
  const { toast } = useDashboard();

  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="content-wrapper">
          <Routes>
            <Route path="/"                element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard"       element={<Overview />} />
            <Route path="/recrutamento"    element={<Recruitment />} />
            <Route path="/talentos"        element={<TalentBank />} />
            <Route path="/admissao"        element={<Admissao />} />
            <Route path="/documentos"      element={<Documents />} />
            <Route path="/compliance"      element={<Compliance />} />
            <Route path="/esocial"         element={<ESocial />} />
            <Route path="/relatorios"      element={<Reports />} />
            <Route path="/configuracoes"   element={<Settings />} />
            {/* Novos módulos estratégicos */}
            <Route path="/planos"          element={<Plans />} />
            <Route path="/prestador"       element={<ServiceProviderArea />} />
            <Route path="*"               element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
        {toast && <Toast message={toast.message} type={toast.type} />}
        <CookieConsentBanner />
        <PatriciaCopilot />
      </div>
    </Router>
  );
}

export default App;

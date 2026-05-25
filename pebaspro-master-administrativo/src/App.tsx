import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import Integracao from './pages/Integracao';
import Empresas from './pages/Empresas';
import PainelRH from './pages/PainelRH';
import Talentos from './pages/Talentos';
import Prestadores from './pages/Prestadores';
import Vagas from './pages/Vagas';
import Servicos from './pages/Servicos';
import Financeiro from './pages/Financeiro';
import Moderacao from './pages/Moderacao';
import Suporte from './pages/Suporte';
import Conteudo from './pages/Conteudo';
import Relatorios from './pages/Relatorios';
import Cidades from './pages/Cidades';
import Configuracoes from './pages/Configuracoes';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="usuarios">
            <Route index element={<Usuarios />} />
            <Route path="talentos" element={<Talentos />} />
            <Route path="prestadores" element={<Prestadores />} />
            <Route path="empresas" element={<Empresas />} />
          </Route>
          <Route path="rh" element={<PainelRH />} />
          <Route path="integracao" element={<Integracao />} />
          <Route path="vagas" element={<Vagas />} />
          <Route path="servicos" element={<Servicos />} />
          <Route path="financeiro" element={<Financeiro />} />
          <Route path="moderacao" element={<Moderacao />} />
          <Route path="suporte" element={<Suporte />} />
          <Route path="conteudo" element={<Conteudo />} />
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="cidades" element={<Cidades />} />
          <Route path="configuracoes" element={<Configuracoes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

import React from 'react';
import { Users, Briefcase, Building2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Usuarios() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Central de Usuários</h1>
          <p className="mt-1 text-sm text-gray-500">
            Visão geral e acesso rápido aos diferentes tipos de usuários da plataforma.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100 sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Total de Talentos</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">45.231</dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100 sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Total de Prestadores</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">12.845</dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100 sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Total de Empresas</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">3.492</dd>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Card Talentos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Talentos</h2>
          </div>
          <p className="text-sm text-gray-500 flex-1 mb-6">
            Profissionais em busca de oportunidades. Gerencie perfis, bloqueios e validação de documentos.
          </p>
          <Link
            to="/usuarios/talentos"
            className="inline-flex items-center justify-between w-full rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Acessar Gestão de Talentos
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </Link>
        </div>

        {/* Card Prestadores */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <Briefcase className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Prestadores</h2>
          </div>
          <p className="text-sm text-gray-500 flex-1 mb-6">
            Profissionais autônomos e freelancers. Gerencie aprovações, selos e categorias de serviço.
          </p>
          <Link
            to="/usuarios/prestadores"
            className="inline-flex items-center justify-between w-full rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Acessar Gestão de Prestadores
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </Link>
        </div>

        {/* Card Empresas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
              <Building2 className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Empresas</h2>
          </div>
          <p className="text-sm text-gray-500 flex-1 mb-6">
            Contratantes B2B. Gerencie cadastros, integrações com RH e permissões de acesso.
          </p>
          <Link
            to="/usuarios/empresas"
            className="inline-flex items-center justify-between w-full rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Acessar Gestão de Empresas
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}

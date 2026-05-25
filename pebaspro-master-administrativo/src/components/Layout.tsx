import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  CalendarCheck,
  DollarSign,
  ShieldAlert,
  Headset,
  MessageSquare,
  Settings,
  FileText,
  MapPin,
  Menu,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  UserCircle
} from 'lucide-react';
import { cn } from '../lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Usuários', href: '/usuarios', icon: Users, children: [
    { name: 'Talentos', href: '/usuarios/talentos' },
    { name: 'Prestadores', href: '/usuarios/prestadores' },
    { name: 'Empresas', href: '/usuarios/empresas' },
  ]},
  { name: 'Painel RH', href: '/rh', icon: Briefcase },
  { name: 'Integração Emp > Prest', href: '/integracao', icon: Building2 },
  { name: 'Vagas', href: '/vagas', icon: FileText },
  { name: 'Serviços & Agenda', href: '/servicos', icon: CalendarCheck },
  { name: 'Financeiro', href: '/financeiro', icon: DollarSign },
  { name: 'Moderação', href: '/moderacao', icon: ShieldAlert },
  { name: 'Suporte', href: '/suporte', icon: Headset },
  { name: 'Conteúdo', href: '/conteudo', icon: MessageSquare },
  { name: 'Relatórios', href: '/relatorios', icon: FileText },
  { name: 'Cidades', href: '/cidades', icon: MapPin },
  { name: 'Configurações', href: '/configuracoes', icon: Settings },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/80 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-primary-900 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 shrink-0 items-center px-6 bg-primary-950">
          <span className="text-xl font-bold tracking-tight">PEBASPRO <span className="text-primary-400 font-medium">Master</span></span>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto pt-4 pb-4">
          <nav className="flex-1 space-y-1 px-3">
            {navigation.map((item) => {
              const active = isActive(item.href);

              return (
                <div key={item.name}>
                  <Link
                    to={item.href}
                    className={cn(
                      active ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white',
                      'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors'
                    )}
                  >
                    <item.icon
                      className={cn(
                        active ? 'text-white' : 'text-primary-300 group-hover:text-white',
                        'mr-3 h-5 w-5 shrink-0 transition-colors'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                  {item.children && active && (
                    <div className="mt-1 space-y-1 pl-11">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          to={child.href}
                          className={cn(
                            location.pathname === child.href ? 'text-white font-medium' : 'text-primary-200 hover:text-white',
                            'block rounded-md px-3 py-2 text-sm transition-colors'
                          )}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-primary-800 p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary-700 flex items-center justify-center">
              <UserCircle className="h-6 w-6 text-primary-200" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">Admin Master</span>
              <span className="text-xs text-primary-300">admin@pebaspro.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <form className="relative flex flex-1" action="#" method="GET">
              <label htmlFor="search-field" className="sr-only">
                Busca global
              </label>
              <Search
                className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
                aria-hidden="true"
              />
              <input
                id="search-field"
                className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                placeholder="Busca global por usuários, vagas, empresas..."
                type="search"
                name="search"
              />
            </form>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 relative">
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" aria-hidden="true" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              </button>

              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

              <div className="flex items-center gap-x-4">
                <button className="flex items-center gap-x-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                  <span>Opções</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

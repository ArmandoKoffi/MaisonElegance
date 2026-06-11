import React from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Package, LogOut, ShoppingBag, ShoppingCart, Users, BarChart3, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

const AdminLayout = () => {
  const location = useLocation();
  const { currentUser, isAdmin, logout, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Return a loading state while checking authentication
  if (isLoading) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white font-bold">Chargement...</div>;
  }

  // Redirect to admin login if not authenticated as admin
  if (!currentUser) return <Navigate to="/admin/connexion" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/admin' },
    { icon: Package, label: 'Produits', path: '/admin/produits' },
    { icon: ShoppingCart, label: 'Commandes', path: '/admin/commandes' },
    { icon: Users, label: 'Clients', path: '/admin/clients' },
    { icon: BarChart3, label: 'Finances', path: '/admin/finances' },
  ];

  const handleLogout = () => {
    logout();
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-gray-800">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <ShoppingBag className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-none">MimiÉlégance</p>
            <p className="text-gray-500 text-xs">Administration</p>
          </div>
        </Link>
      </div>

      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-white text-xs font-semibold">{currentUser.firstName} {currentUser.lastName}</p>
            <p className="text-gray-500 text-xs">Administrateur</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = item.path === '/admin'
            ? location.pathname === '/admin'
            : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium',
                isActive
                  ? 'bg-accent text-white shadow-lg shadow-accent/20'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800 space-y-1">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl transition-all text-sm"
        >
          <ShoppingBag className="h-4 w-4" />
          Voir la boutique
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-950/40 hover:text-red-300 rounded-xl transition-all text-sm"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="w-56 bg-gray-950 hidden md:flex flex-col fixed h-full shadow-2xl z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gray-950 border-b border-gray-800 z-30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
            <ShoppingBag className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-white font-bold text-sm">Admin</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-gray-400">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Overlay Sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute top-0 left-0 w-56 h-full bg-gray-950 flex flex-col" onClick={e => e.stopPropagation()}>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-56 p-6 md:p-8 pt-16 md:pt-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

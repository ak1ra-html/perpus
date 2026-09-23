import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiBook, 
  FiUsers, 
  FiBookmark, 
  FiRotateCcw, 
  FiLogOut, 
  FiMenu, 
  FiX 
} from 'react-icons/fi';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    // Tambahkan aksi pembersihan session/auth jika ada, lalu arahkan ke login
    navigate('/login');
  };

  const menuItems = [
    { path: '/', name: 'Dashboard', icon: <FiHome /> },
    { path: '/buku', name: 'Manajemen Buku', icon: <FiBook /> },
    { path: '/anggota', name: 'Manajemen Anggota', icon: <FiUsers /> },
    { path: '/peminjaman', name: 'Peminjaman', icon: <FiBookmark /> },
    { path: '/pengembalian', name: 'Pengembalian', icon: <FiRotateCcw /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Overlay untuk mobile saat sidebar terbuka */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header Sidebar */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <span className="p-2 bg-blue-600 rounded-lg text-white text-xl">
              <FiBook />
            </span>
            <span className="text-xl font-bold tracking-wide">PerpusKita</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-white focus:outline-none"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Tombol Keluar Sistem */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
          >
            <FiLogOut className="text-lg" />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>

      {/* Konten Utama */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none md:hidden cursor-pointer"
            >
              <FiMenu className="text-2xl" />
            </button>
            <h1 className="text-base md:text-lg font-semibold text-gray-800 truncate">
              Sistem Informasi Perpustakaan
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-800">Admin Perpus</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
              AP
            </div>
          </div>
        </header>

        {/* Area Halaman Konten */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
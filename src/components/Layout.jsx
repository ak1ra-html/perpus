import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FiHome, FiBookOpen, FiUsers, 
  FiArrowUpRight, FiArrowDownLeft, 
  FiLogOut, FiMenu 
} from 'react-icons/fi';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Daftar menu untuk Sidebar
  const menuItems = [
    { name: 'Dashboard', icon: <FiHome />, path: '/' },
    { name: 'Manajemen Buku', icon: <FiBookOpen />, path: '/buku' },
    { name: 'Manajemen Anggota', icon: <FiUsers />, path: '/anggota' },
    { name: 'Peminjaman', icon: <FiArrowUpRight />, path: '/peminjaman' },
    { name: 'Pengembalian', icon: <FiArrowDownLeft />, path: '/pengembalian' },
  ];

  const handleLogout = () => {
    const confirmLogout = window.confirm("Apakah Anda yakin ingin keluar dari sistem?");
    if (confirmLogout) {
      // Membersihkan sesi lokal
      localStorage.clear();
      sessionStorage.clear();
      
      // Mengarahkan ke halaman login
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* 1. Bagian Sidebar Kiri */}
      <aside className="w-64 bg-[#1e293b] text-white flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-gray-700/50">
          <FiBookOpen className="text-blue-400 text-3xl" />
          <span className="text-2xl font-bold tracking-wide">PerpusKita</span>
        </div>
        
        <nav className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700/50">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg w-full transition-colors cursor-pointer"
          >
            <FiLogOut className="text-xl" />
            <span className="font-medium">Keluar Sistem</span>
          </button>
        </div>
      </aside>

      {/* 2. Bagian Konten Utama (Kanan) */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Topbar / Header */}
        <header className="bg-white shadow-sm border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-4">
            <FiMenu className="text-gray-500 text-2xl cursor-pointer md:hidden" />
            <h1 className="text-lg font-semibold text-gray-800">Sistem Informasi Perpustakaan</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 pl-2">
              <div className="hidden md:block text-sm text-right">
                <p className="font-semibold text-gray-800">Admin Perpus</p>
                <p className="text-gray-500 text-xs">Administrator</p>
              </div>
              <img 
                src="https://ui-avatars.com/api/?name=Admin+Perpus&background=0D8ABC&color=fff" 
                alt="Profile" 
                className="w-10 h-10 rounded-full border-2 border-gray-100 object-cover"
              />
            </div>
          </div>
        </header>

        {/* Area Halaman Dinamis */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50/50">
          {children}
        </div>
        
      </main>
    </div>
  );
};

export default Layout;
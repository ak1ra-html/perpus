import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ManajemenBuku from './pages/ManajemenBuku';
import ManajemenAnggota from './pages/ManajemenAnggota';
import Peminjaman from './pages/Peminjaman';
import Pengembalian from './pages/Pengembalian';

// Fungsi untuk membungkus halaman yang wajib login
const ProtectedRoute = ({ children }) => {
  const isAuth = localStorage.getItem('isLoggedIn') === 'true';
  // Jika belum login, tendang kembali ke /login
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  // Jika sudah login, tampilkan Layout beserta halamannya
  return <Layout>{children}</Layout>;
};

function App() {
  const isAuth = localStorage.getItem('isLoggedIn') === 'true';

  return (
    <Routes>
      {/* Rute Login */}
      <Route path="/login" element={isAuth ? <Navigate to="/" replace /> : <Login />} />

      {/* Rute Utama: Wajibkan ProtectedRoute agar dicegat jika belum login */}
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/buku" element={<ProtectedRoute><ManajemenBuku /></ProtectedRoute>} />
      <Route path="/anggota" element={<ProtectedRoute><ManajemenAnggota /></ProtectedRoute>} />
      <Route path="/peminjaman" element={<ProtectedRoute><Peminjaman /></ProtectedRoute>} />
      <Route path="/pengembalian" element={<ProtectedRoute><Pengembalian /></ProtectedRoute>} />

      {/* Rute nyasar akan dikembalikan ke rute utama */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
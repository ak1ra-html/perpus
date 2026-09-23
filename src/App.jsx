import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ManajemenBuku from './pages/ManajemenBuku';
import ManajemenAnggota from './pages/ManajemenAnggota';
import Peminjaman from './pages/Peminjaman';
import Pengembalian from './pages/Pengembalian';

// Fungsi untuk mengecek status login dari localStorage
const isAuthenticated = () => {
  return localStorage.getItem('isLoggedIn') === 'true';
};

// Komponen Pelindung (Mencegah akses langsung ke Dashboard)
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    // Jika belum login, lemparkan ke halaman login
    return <Navigate to="/login" replace />;
  }
  // Jika sudah login, bungkus halaman dengan Layout Admin (Sidebar & Header)
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rute Login (Terbuka untuk umum, tanpa sidebar) */}
        <Route 
          path="/login" 
          element={isAuthenticated() ? <Navigate to="/" replace /> : <Login />} 
        />

        {/* Rute-rute di bawah ini DILINDUNGI (Wajib Login) */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/buku" element={<ProtectedRoute><ManajemenBuku /></ProtectedRoute>} />
        <Route path="/anggota" element={<ProtectedRoute><ManajemenAnggota /></ProtectedRoute>} />
        <Route path="/peminjaman" element={<ProtectedRoute><Peminjaman /></ProtectedRoute>} />
        <Route path="/pengembalian" element={<ProtectedRoute><Pengembalian /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ManajemenBuku from './pages/ManajemenBuku';
import ManajemenAnggota from './pages/ManajemenAnggota';
import Peminjaman from './pages/Peminjaman';
import Pengembalian from './pages/Pengembalian';

// Komponen Pelindung Rute Admin
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isLoggedIn') === 'true';
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rute Halaman Login */}
        <Route path="/login" element={<Login />} />

        {/* Rute Utama (Dialihkan otomatis ke /login jika belum masuk, atau ke Dashboard jika sudah) */}
        <Route 
          path="/" 
          element={
            localStorage.getItem('isLoggedIn') === 'true' ? (
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* Rute Halaman Admin Lainnya */}
        <Route path="/buku" element={<ProtectedRoute><ManajemenBuku /></ProtectedRoute>} />
        <Route path="/anggota" element={<ProtectedRoute><ManajemenAnggota /></ProtectedRoute>} />
        <Route path="/peminjaman" element={<ProtectedRoute><Peminjaman /></ProtectedRoute>} />
        <Route path="/pengembalian" element={<ProtectedRoute><Pengembalian /></ProtectedRoute>} />

        {/* Jika rute tidak ditemukan, kembalikan ke halaman utama/login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Buku from './pages/ManajemenBuku';
import Anggota from './pages/ManajemenAnggota';
import Peminjaman from './pages/Peminjaman';
import Pengembalian from './pages/Pengembalian';
import Login from './pages/Login';

function App() {
  return (
    <Routes>
      {/* Halaman Login (Tanpa Sidebar & Header Layout) */}
      <Route path="/login" element={<Login />} />

      {/* Halaman Utama Admin (Menggunakan Layout Sidebar & Header) */}
      <Route path="/*" element={
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/buku" element={<Buku />} />
            <Route path="/anggota" element={<Anggota />} />
            <Route path="/peminjaman" element={<Peminjaman />} />
            <Route path="/pengembalian" element={<Pengembalian />} />
          </Routes>
        </Layout>
      } />
    </Routes>
  );
}

export default App;
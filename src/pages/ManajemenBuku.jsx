import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiX } from 'react-icons/fi';

const ManajemenBuku = () => {
  const [buku, setBuku] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    judul_buku: '',
    penulis: '',
    penerbit: '',
    tahun_terbit: '',
    stok: 0,
    kategori: ''
  });

  useEffect(() => {
    fetchBuku();
  }, []);

  const fetchBuku = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('buku')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setBuku(data || []);
    } catch (error) {
      console.error("Error mengambil data buku:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const openModalForAdd = () => {
    setEditId(null);
    setFormData({ 
      judul_buku: '', 
      penulis: '', 
      penerbit: '', 
      tahun_terbit: '', 
      stok: 0, 
      kategori: '' 
    });
    setIsModalOpen(true);
  };

  const openModalForEdit = (item) => {
    setEditId(item.id);
    setFormData({
      judul_buku: item.judul_buku || '',
      penulis: item.penulis || '',
      penerbit: item.penerbit || '',
      tahun_terbit: item.tahun_terbit !== null ? item.tahun_terbit : '',
      stok: item.stok !== null ? item.stok : 0,
      kategori: item.kategori || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Bersihkan data: ubah string kosong pada angka menjadi null agar tidak error di database
    const payload = {
      judul_buku: formData.judul_buku,
      penulis: formData.penulis,
      penerbit: formData.penerbit || null,
      tahun_terbit: formData.tahun_terbit === '' ? null : parseInt(formData.tahun_terbit),
      stok: formData.stok === '' ? 0 : parseInt(formData.stok),
      kategori: formData.kategori || null
    };

    try {
      if (editId) {
        const { error } = await supabase
          .from('buku')
          .update(payload)
          .eq('id', editId);
        if (error) throw error;
        alert("Buku berhasil diperbarui!");
      } else {
        const { error } = await supabase
          .from('buku')
          .insert([payload]);
        if (error) throw error;
        alert("Buku berhasil ditambahkan!");
      }
      
      setIsModalOpen(false);
      fetchBuku(); 
    } catch (error) {
      console.error("Gagal menyimpan buku:", error.message);
      alert("Gagal menyimpan buku: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const isConfirm = window.confirm("Apakah Anda yakin ingin menghapus buku ini?");
    if (!isConfirm) return;

    try {
      const { error } = await supabase
        .from('buku')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert("Buku berhasil dihapus!");
      fetchBuku();
    } catch (error) {
      console.error("Gagal menghapus buku:", error.message);
      alert("Gagal menghapus data buku: " + error.message);
    }
  };

  const filteredBuku = buku.filter((item) => {
    const title = item.judul_buku || '';
    const author = item.penulis || '';
    const category = item.kategori || '';
    return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           author.toLowerCase().includes(searchTerm.toLowerCase()) ||
           category.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="animate-fade-in space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Buku</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola katalog buku perpustakaan Anda di sini.</p>
        </div>
        <button 
          onClick={openModalForAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm cursor-pointer"
        >
          <FiPlus className="text-lg" />
          Tambah Buku
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-full max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari judul, penulis, atau kategori..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 font-semibold w-16 text-center">No</th>
                <th className="p-4 font-semibold">Judul Buku</th>
                <th className="p-4 font-semibold">Penulis & Penerbit</th>
                <th className="p-4 font-semibold">Kategori</th>
                <th className="p-4 font-semibold text-center">Stok</th>
                <th className="p-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">Memuat data...</td>
                </tr>
              ) : filteredBuku.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">Belum ada data buku.</td>
                </tr>
              ) : (
                filteredBuku.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-center text-gray-500 font-semibold">#{index + 1}</td>
                    <td className="p-4 font-medium text-gray-900">{item.judul_buku || '-'}</td>
                    <td className="p-4">
                      <div className="text-gray-900">{item.penulis || '-'}</div>
                      <div className="text-xs text-gray-500">Penerbit: {item.penerbit || '-'} ({item.tahun_terbit || '-'})</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                        {item.kategori || 'Umum'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        (item.stok || 0) > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {item.stok || 0}
                      </span>
                    </td>
                    <td className="p-4 flex justify-center gap-2">
                      <button 
                        onClick={() => openModalForEdit(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" title="Edit">
                        <FiEdit />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" title="Hapus">
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <h2 className="text-lg font-bold text-gray-800">{editId ? 'Edit Buku' : 'Tambah Buku Baru'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-rose-500 transition-colors cursor-pointer">
                <FiX className="text-2xl" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Buku</label>
                <input 
                  type="text" name="judul_buku" required
                  value={formData.judul_buku} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Masukkan judul buku..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Penulis</label>
                <input 
                  type="text" name="penulis" required
                  value={formData.penulis} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Nama penulis..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Penerbit</label>
                  <input 
                    type="text" name="penerbit"
                    value={formData.penerbit} onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Nama penerbit..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Terbit</label>
                  <input 
                    type="number" name="tahun_terbit"
                    value={formData.tahun_terbit} onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Contoh: 2026"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stok (Jumlah)</label>
                  <input 
                    type="number" name="stok" min="0" required
                    value={formData.stok} onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <input 
                    type="text" name="kategori"
                    value={formData.kategori} onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Contoh: Fiksi, Sejarah"
                  />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-5 py-2 text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Buku'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManajemenBuku;
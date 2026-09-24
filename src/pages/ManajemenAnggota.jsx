import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiX } from 'react-icons/fi';

const ManajemenAnggota = () => {
  const [anggota, setAnggota] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    nama_anggota: '',
    nim: '',
    jenis_kelamin: 'Laki-laki',
    status: 'Aktif',
    email: '',
    no_telepon: '',
    alamat: ''
  });

  useEffect(() => {
    fetchAnggota();
  }, []);

  const fetchAnggota = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('anggota')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setAnggota(data || []);
    } catch (error) {
      console.error("Error mengambil data anggota:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModalForAdd = () => {
    setEditId(null);
    setFormData({ 
      nama_anggota: '', 
      nim: '', 
      jenis_kelamin: 'Laki-laki', 
      status: 'Aktif', 
      email: '', 
      no_telepon: '', 
      alamat: '' 
    });
    setIsModalOpen(true);
  };

  const openModalForEdit = (item) => {
    setEditId(item.id);
    setFormData({
      nama_anggota: item.nama_anggota || '',
      nim: item.nim || '',
      jenis_kelamin: item.jenis_kelamin || 'Laki-laki',
      status: item.status || 'Aktif',
      email: item.email || '',
      no_telepon: item.no_telepon || '',
      alamat: item.alamat || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editId) {
        const { error } = await supabase
          .from('anggota')
          .update(formData)
          .eq('id', editId);
        if (error) throw error;
        alert("Data anggota berhasil diperbarui!");
      } else {
        const { error } = await supabase
          .from('anggota')
          .insert([formData]);
        if (error) throw error;
        alert("Anggota baru berhasil ditambahkan!");
      }
      
      setIsModalOpen(false);
      fetchAnggota(); 
    } catch (error) {
      console.error("Gagal menyimpan anggota:", error.message);
      alert("Gagal menyimpan data: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const isConfirm = window.confirm("Apakah Anda yakin ingin menghapus anggota ini?");
    if (!isConfirm) return;

    try {
      const { error } = await supabase
        .from('anggota')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert("Anggota berhasil dihapus!");
      fetchAnggota();
    } catch (error) {
      console.error("Gagal menghapus anggota:", error.message);
      alert("Gagal menghapus data: " + error.message);
    }
  };

  const filteredAnggota = anggota.filter((item) => {
    const nama = item.nama_anggota || '';
    const nim = item.nim || '';
    const email = item.email || '';
    return nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
           nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
           email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="animate-fade-in space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Anggota</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola data pendaftaran anggota perpustakaan.</p>
        </div>
        <button 
          onClick={openModalForAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm cursor-pointer"
        >
          <FiPlus className="text-lg" />
          Tambah Anggota
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-full max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari nama, NIM, atau email..." 
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
                <th className="p-4 font-semibold">Nama</th>
                <th className="p-4 font-semibold">NIM / ID</th>
                <th className="p-4 font-semibold">Kontak</th>
                <th className="p-4 font-semibold">Alamat</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">Memuat data...</td>
                </tr>
              ) : filteredAnggota.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">Belum ada data anggota.</td>
                </tr>
              ) : (
                filteredAnggota.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-center text-gray-500 font-semibold">#{index + 1}</td>
                    <td className="p-4 font-medium text-gray-900">{item.nama_anggota || '-'}</td>
                    <td className="p-4 text-gray-600">{item.nim || '-'}</td>
                    <td className="p-4">
                      <div className="text-gray-900">{item.email || '-'}</div>
                      <div className="text-xs text-gray-500">{item.no_telepon || '-'}</div>
                    </td>
                    <td className="p-4 text-gray-600">{item.alamat || '-'}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {item.status || 'Aktif'}
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
              <h2 className="text-lg font-bold text-gray-800">{editId ? 'Edit Anggota' : 'Tambah Anggota Baru'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-rose-500 transition-colors cursor-pointer">
                <FiX className="text-2xl" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input 
                  type="text" name="nama_anggota" required
                  value={formData.nama_anggota} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Masukkan nama lengkap..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIM / ID Anggota</label>
                <input 
                  type="text" name="nim"
                  value={formData.nim} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Masukkan NIM atau ID..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                  <select 
                    name="jenis_kelamin"
                    value={formData.jenis_kelamin} onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    name="status"
                    value={formData.status} onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Non-Aktif">Non-Aktif</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" name="email"
                    value={formData.email} onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="email@domain.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                  <input 
                    type="text" name="no_telepon"
                    value={formData.no_telepon} onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                <textarea 
                  name="alamat" rows="2"
                  value={formData.alamat} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Alamat lengkap..."
                ></textarea>
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
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Anggota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManajemenAnggota;
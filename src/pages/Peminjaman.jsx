import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { FiPlus, FiSearch, FiX, FiCheckCircle } from 'react-icons/fi';

const Peminjaman = () => {
  const [peminjaman, setPeminjaman] = useState([]);
  const [listBuku, setListBuku] = useState([]);
  const [listAnggota, setListAnggota] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    id_buku: '',
    id_anggota: '',
    tanggal_pinjam: new Date().toISOString().split('T')[0],
    tanggal_kembali: '',
    status: 'Dipinjam'
  });

  useEffect(() => {
    fetchPeminjaman();
    fetchDropdownData();
  }, []);

  const fetchPeminjaman = async () => {
    try {
      setLoading(true);
      
      const { data: dataPinjam, error: errPinjam } = await supabase
        .from('peminjaman')
        .select('*')
        .order('id', { ascending: true });

      if (errPinjam) throw errPinjam;

      const { data: dataBuku } = await supabase.from('buku').select('id, judul_buku');
      // Perubahan ada di sini
      const { data: dataAnggota } = await supabase.from('anggota').select('id, nama_anggota, nim');

      const bukuMap = {};
      if (dataBuku) dataBuku.forEach(b => bukuMap[b.id] = b);

      const anggotaMap = {};
      if (dataAnggota) dataAnggota.forEach(a => anggotaMap[a.id] = a);

      const combinedData = (dataPinjam || []).map(item => ({
        ...item,
        buku: bukuMap[item.id_buku] || null,
        anggota: anggotaMap[item.id_anggota] || null
      }));

      setPeminjaman(combinedData);
    } catch (error) {
      console.error("Error mengambil data peminjaman:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const { data: bukuData } = await supabase.from('buku').select('*');
      const { data: anggotaData } = await supabase.from('anggota').select('*');
      setListBuku(bukuData || []);
      setListAnggota(anggotaData || []);
    } catch (error) {
      console.error("Gagal mengambil data referensi:", error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModalForAdd = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const formattedTenggat = nextWeek.toISOString().split('T')[0];

    setFormData({
      id_buku: '',
      id_anggota: '',
      tanggal_pinjam: new Date().toISOString().split('T')[0],
      tanggal_kembali: formattedTenggat,
      status: 'Dipinjam'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('peminjaman')
        .insert([formData]);

      if (error) throw error;
      
      alert("Transaksi peminjaman berhasil dicatat!");
      setIsModalOpen(false);
      fetchPeminjaman(); 
    } catch (error) {
      console.error("Gagal menyimpan peminjaman:", error.message);
      alert("Gagal memproses peminjaman: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturn = async (item) => {
    const isConfirm = window.confirm("Konfirmasi buku ini sudah dikembalikan?");
    if (!isConfirm) return;

    try {
      const today = new Date();
      const dueDate = new Date(item.tanggal_kembali);
      
      const diffTime = today - dueDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const keterlambatan = diffDays > 0 ? diffDays : 0;
      
      const tarifPerHari = 1000;
      const jumlahDenda = keterlambatan * tarifPerHari;

      const { error: updateError } = await supabase
        .from('peminjaman')
        .update({ status: 'Selesai' })
        .eq('id', item.id);

      if (updateError) throw updateError;

      const { error: insertPengembalian } = await supabase
        .from('pengembalian')
        .insert([{
          id_peminjaman: item.id,
          tanggal_dikembalikan: today.toISOString().split('T')[0],
          keterlambatan: keterlambatan,
          denda: jumlahDenda
        }]);

      if (insertPengembalian) throw insertPengembalian;

      if (jumlahDenda > 0) {
        const { error: insertDenda } = await supabase
          .from('denda')
          .insert([{
            id_peminjaman: item.id,
            jumlah_denda: jumlahDenda,
            status_denda: 'Belum Lunas'
          }]);
        if (insertDenda) throw insertDenda;
      }

      alert(`Buku berhasil dikembalikan! ${keterlambatan > 0 ? `Terlambat ${keterlambatan} hari. Denda: Rp ${jumlahDenda.toLocaleString()}` : 'Tanpa denda.'}`);
      fetchPeminjaman();
    } catch (error) {
      console.error("Gagal memproses pengembalian:", error.message);
      alert("Gagal mencatat pengembalian: " + error.message);
    }
  };

  const filteredPeminjaman = peminjaman.filter((item) => {
    const search = searchTerm.toLowerCase();
    const idPinjam = String(item.id || '').toLowerCase();
    // Perubahan ada di sini
    const namaAnggota = (item.anggota?.nama_anggota || '').toLowerCase();
    const judulBuku = (item.buku?.judul_buku || '').toLowerCase();
    return idPinjam.includes(search) || namaAnggota.includes(search) || judulBuku.includes(search);
  });

  return (
    <div className="animate-fade-in space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Transaksi Peminjaman</h1>
          <p className="text-gray-500 text-sm mt-1">Catat dan pantau aktivitas peminjaman buku perpustakaan.</p>
        </div>
        <button 
          onClick={openModalForAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm cursor-pointer"
        >
          <FiPlus className="text-lg" />
          Pinjamkan Buku
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-full max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari ID, Nama Anggota, atau Judul Buku..." 
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
                <th className="p-4 font-semibold w-16 text-center">ID</th>
                <th className="p-4 font-semibold">Nama Anggota</th>
                <th className="p-4 font-semibold">Judul Buku</th>
                <th className="p-4 font-semibold">Tanggal Pinjam</th>
                <th className="p-4 font-semibold">Tenggat Waktu</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">Memuat data transaksi...</td>
                </tr>
              ) : filteredPeminjaman.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">Belum ada transaksi peminjaman.</td>
                </tr>
              ) : (
                filteredPeminjaman.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-center text-gray-500 font-semibold">#{item.id}</td>
                    {/* Perubahan ada di sini */}
                    <td className="p-4 font-medium text-gray-900">{item.anggota?.nama_anggota || `Anggota ID: ${item.id_anggota}`}</td>
                    <td className="p-4 text-gray-800">{item.buku?.judul_buku || `Buku ID: ${item.id_buku}`}</td>
                    <td className="p-4 text-gray-600">{item.tanggal_pinjam || '-'}</td>
                    <td className="p-4 text-gray-600">{item.tanggal_kembali || '-'}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status || 'Dipinjam'}
                      </span>
                    </td>
                    <td className="p-4 flex justify-center gap-2">
                      {item.status !== 'Selesai' && (
                        <button 
                          onClick={() => handleReturn(item)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer" 
                          title="Tandai Selesai / Dikembalikan">
                          <FiCheckCircle /> Kembalikan
                        </button>
                      )}
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">Form Peminjaman Buku</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-rose-500 transition-colors cursor-pointer">
                <FiX className="text-2xl" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Anggota</label>
                <select 
                  name="id_anggota" required
                  value={formData.id_anggota} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="">-- Pilih Nama Anggota --</option>
                  {listAnggota.map((ang) => (
                    <option key={ang.id} value={ang.id}>
                      {/* Perubahan ada di sini */}
                      {ang.nama_anggota} ({ang.nim})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Buku</label>
                <select 
                  name="id_buku" required
                  value={formData.id_buku} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="">-- Pilih Judul Buku --</option>
                  {listBuku.map((buk) => (
                    <option key={buk.id} value={buk.id}>
                      {buk.judul_buku} (Stok: {buk.stok})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pinjam</label>
                  <input 
                    type="date" name="tanggal_pinjam" required
                    value={formData.tanggal_pinjam} onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tenggat Waktu</label>
                  <input 
                    type="date" name="tanggal_kembali" required
                    value={formData.tanggal_kembali} onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Peminjaman;
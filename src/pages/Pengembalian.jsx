import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { FiSearch } from 'react-icons/fi';

const Pengembalian = () => {
  const [pengembalian, setPengembalian] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPengembalian();
  }, []);

  const fetchPengembalian = async () => {
    try {
      setLoading(true);
      
      const { data: dataPengembalian, error: errPengembalian } = await supabase
        .from('pengembalian')
        .select('*')
        .order('id', { ascending: true });

      if (errPengembalian) throw errPengembalian;

      const { data: dataPeminjaman } = await supabase
        .from('peminjaman')
        .select(`
          id,
          buku ( judul_buku ),
          anggota ( nama, nim )
        `);

      const peminjamanMap = {};
      if (dataPeminjaman) {
        dataPeminjaman.forEach(p => {
          peminjamanMap[p.id] = p;
        });
      }

      const combinedData = (dataPengembalian || []).map(item => ({
        ...item,
        peminjaman: peminjamanMap[item.id_peminjaman] || null
      }));

      setPengembalian(combinedData);
    } catch (error) {
      console.error("Error mengambil data pengembalian:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredPengembalian = pengembalian.filter((item) => {
    const search = searchTerm.toLowerCase();
    const idKembali = String(item.id || '').toLowerCase();
    const idPeminjaman = String(item.id_peminjaman || '').toLowerCase();
    const namaAnggota = (item.peminjaman?.anggota?.nama || '').toLowerCase();
    const judulBuku = (item.peminjaman?.buku?.judul_buku || '').toLowerCase();
    return idKembali.includes(search) || idPeminjaman.includes(search) || namaAnggota.includes(search) || judulBuku.includes(search);
  });

  return (
    <div className="animate-fade-in space-y-6 relative">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">Riwayat Pengembalian</h1>
        <p className="text-gray-500 text-sm mt-1">Pantau status buku yang telah dikembalikan, keterlambatan, dan denda.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-full max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari ID, Nama Peminjam, atau Judul Buku..." 
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
                <th className="p-4 font-semibold">Tgl Dikembalikan</th>
                <th className="p-4 font-semibold text-center">Status Selesai</th>
                <th className="p-4 font-semibold text-center">Denda</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">Memuat data riwayat...</td>
                </tr>
              ) : filteredPengembalian.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">Belum ada riwayat pengembalian.</td>
                </tr>
              ) : (
                filteredPengembalian.map((item, index) => {
                  const keterlambatan = item.keterlambatan || 0;
                  const isTerlambat = keterlambatan > 0;

                  return (
                    <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-center text-gray-500 font-semibold">#{item.id}</td>
                      <td className="p-4 font-medium text-gray-900">
                        {item.peminjaman?.anggota?.nama || `Peminjaman ID: #${item.id_peminjaman}`}
                      </td>
                      <td className="p-4 text-gray-800">
                        {item.peminjaman?.buku?.judul_buku || '-'}
                      </td>
                      <td className="p-4 text-gray-600">{item.tanggal_dikembalikan || '-'}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          isTerlambat ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {isTerlambat ? `Selesai (Terlambat ${keterlambatan} Hari)` : 'Selesai (Tepat Waktu)'}
                        </span>
                      </td>
                      <td className="p-4 text-center font-medium text-gray-800">
                        {item.denda > 0 ? `Rp ${item.denda.toLocaleString()}` : 'Rp 0'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Pengembalian;
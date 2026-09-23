import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { FiBook, FiUsers, FiBookOpen, FiAlertCircle } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBuku: 0,
    totalAnggota: 0,
    bukuDipinjam: 0,
    terlambat: 0
  });

  // 1. Data grafik sekarang menggunakan State, bukan data mati (dummy)
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchChartData(); // Tarik data grafik saat halaman dimuat

    // 2. Realtime Listener: Mendengarkan perubahan tabel secara instan
    const booksChannel = supabase.channel('custom-buku-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'buku' }, () => fetchStats())
      .subscribe();

    const anggotaChannel = supabase.channel('custom-anggota-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'anggota' }, () => fetchStats())
      .subscribe();

    const peminjamanChannel = supabase.channel('custom-peminjaman-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'peminjaman' }, () => {
        fetchStats();
        fetchChartData(); // Update grafik jika ada transaksi baru
      })
      .subscribe();

    const pengembalianChannel = supabase.channel('custom-pengembalian-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pengembalian' }, () => {
        fetchStats();
        fetchChartData(); // Update grafik jika ada buku dikembalikan
      })
      .subscribe();

    return () => {
      supabase.removeChannel(booksChannel);
      supabase.removeChannel(anggotaChannel);
      supabase.removeChannel(peminjamanChannel);
      supabase.removeChannel(pengembalianChannel);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const { count: countBuku } = await supabase.from('buku').select('*', { count: 'exact', head: true });
      const { count: countAnggota } = await supabase.from('anggota').select('*', { count: 'exact', head: true });
      
      const { count: countPeminjaman } = await supabase
        .from('peminjaman')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'Selesai');
      
      const { count: countTerlambat } = await supabase
        .from('peminjaman')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Terlambat');
      
      setStats({
        totalBuku: countBuku || 0,
        totalAnggota: countAnggota || 0,
        bukuDipinjam: countPeminjaman || 0,
        terlambat: countTerlambat || 0
      });
    } catch (error) {
      console.error("Gagal mengambil data statistik:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Fungsi Logika untuk Menghitung Grafik Bulanan Asli
  const fetchChartData = async () => {
    try {
      // Tarik semua tanggal peminjaman dan pengembalian
      const { data: dataPinjam } = await supabase.from('peminjaman').select('tanggal_pinjam');
      const { data: dataKembali } = await supabase.from('pengembalian').select('tanggal_dikembalikan');

      // Siapkan kerangka 12 bulan (Januari - Desember)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
      let groupedData = months.map(m => ({ name: m, peminjaman: 0, pengembalian: 0 }));

      // Kelompokkan data peminjaman berdasarkan bulan
      if (dataPinjam) {
        dataPinjam.forEach(item => {
          if (item.tanggal_pinjam) {
            const monthIndex = new Date(item.tanggal_pinjam).getMonth(); // Dapatkan indeks bulan (0-11)
            groupedData[monthIndex].peminjaman += 1;
          }
        });
      }

      // Kelompokkan data pengembalian berdasarkan bulan
      if (dataKembali) {
        dataKembali.forEach(item => {
          if (item.tanggal_dikembalikan) {
            const monthIndex = new Date(item.tanggal_dikembalikan).getMonth();
            groupedData[monthIndex].pengembalian += 1;
          }
        });
      }

      // Simpan hasil hitungan ke state grafik
      setChartData(groupedData);
    } catch (error) {
      console.error("Gagal mengambil data grafik:", error.message);
    }
  };

  const statCards = [
    { title: 'Total Buku', value: stats.totalBuku, icon: <FiBook />, bgColor: 'bg-blue-500' },
    { title: 'Total Anggota', value: stats.totalAnggota, icon: <FiUsers />, bgColor: 'bg-emerald-500' },
    { title: 'Buku Dipinjam', value: stats.bukuDipinjam, icon: <FiBookOpen />, bgColor: 'bg-yellow-400' },
    { title: 'Terlambat', value: stats.terlambat, icon: <FiAlertCircle />, bgColor: 'bg-rose-500' },
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-full text-gray-500">Memuat data dari Supabase...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Overview Perpustakaan</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className={`${card.bgColor} rounded-xl p-6 text-white shadow-lg flex items-center justify-between hover:scale-105 transition-transform duration-200 cursor-pointer`}>
            <div className="bg-white/20 p-4 rounded-lg">
              <div className="text-3xl">{card.icon}</div>
            </div>
            <div className="text-right">
              <p className="text-white/90 font-medium text-sm">{card.title}</p>
              <h3 className="text-4xl font-bold mt-1">{card.value.toLocaleString()}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
        <h2 className="text-lg font-bold text-gray-800 mb-6">Statistik Peminjaman (Tahun Ini)</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 14 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 14 }} allowDecimals={false} />
              <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="peminjaman" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Buku Keluar (Pinjam)" barSize={30} />
              <Bar dataKey="pengembalian" fill="#10b981" radius={[4, 4, 0, 0]} name="Buku Masuk (Kembali)" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
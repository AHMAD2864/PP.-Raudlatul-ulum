import React, { useState, useEffect } from 'react';
import { Search, Plus, Loader2 } from 'lucide-react';
import { supabase } from './lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

interface Record {
  id: string;
  title: string;
  description: string;
  category: string;
  created_at: string;
}

function App() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ''
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async (search = '') => {
    try {
      setLoading(true);
      let query = supabase
        .from('records')
        .select('*')
        .order('created_at', { ascending: false });

      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      toast.error('Gagal mengambil data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchRecords(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('records')
        .insert([{ ...formData, user_id: (await supabase.auth.getUser()).data.user?.id }]);

      if (error) throw error;

      toast.success('Data berhasil ditambahkan');
      setFormData({ title: '', description: '', category: '' });
      setShowForm(false);
      fetchRecords();
    } catch (error) {
      toast.error('Gagal menambahkan data');
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Database Pencarian</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Tambah Data
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari data..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Add Record Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Tambah Data Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Judul</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Kategori</label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Simpan
              </button>
            </form>
          </div>
        )}

        {/* Records Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="animate-spin" size={24} />
            </div>
          ) : records.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{record.title}</td>
                    <td className="px-6 py-4">{record.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{record.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(record.created_at).toLocaleDateString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center p-8 text-gray-500">
              Tidak ada data ditemukan
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
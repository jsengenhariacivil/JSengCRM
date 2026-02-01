
import React, { useState } from 'react';
import { Plus, Filter, Download, ArrowUpCircle, ArrowDownCircle, X, Save, Pencil } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Status, FinancialRecord } from '../types';

const Finance: React.FC = () => {
  const { financials, addFinancialRecord, updateFinancialRecord } = useData();
  const [filterType, setFilterType] = useState<'All' | 'Receita' | 'Despesa'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New transaction state
  const [newTransaction, setNewTransaction] = useState<Partial<FinancialRecord>>({
    type: 'Receita',
    description: '',
    amount: 0,
    category: '',
    date: new Date().toISOString().split('T')[0],
    status: Status.PENDING
  });

  const filteredData = financials.filter(item =>
    filterType === 'All' ? true : item.type === filterType
  );

  const handleExport = () => {
    const headers = ['ID', 'Tipo', 'Descrição', 'Categoria', 'Data', 'Valor', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => [
        row.id,
        row.type,
        `"${row.description}"`,
        row.category,
        new Date(row.date).toLocaleDateString(),
        row.amount,
        row.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'financeiro.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEdit = (item: FinancialRecord) => {
    setEditingId(item.id);
    setNewTransaction({
      type: item.type,
      description: item.description,
      amount: item.amount,
      category: item.category,
      date: item.date.split('T')[0],
      status: item.status,
      projectId: item.projectId
    });
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    if (filterType === 'All') return;

    setEditingId(null);
    const defaultType = filterType === 'Despesa' ? 'Despesa' : 'Receita';

    setNewTransaction({
      type: defaultType,
      description: '',
      amount: 0,
      category: '',
      date: new Date().toISOString().split('T')[0],
      status: Status.PENDING
    });
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransaction.description || !newTransaction.amount) return;

    if (editingId) {
      await updateFinancialRecord({
        id: editingId,
        type: newTransaction.type as 'Receita' | 'Despesa',
        description: newTransaction.description || '',
        amount: Number(newTransaction.amount),
        date: newTransaction.date || new Date().toISOString(),
        category: newTransaction.category || 'Geral',
        status: newTransaction.status as Status,
        projectId: newTransaction.projectId
      });
    } else {
      const transaction: FinancialRecord = {
        id: (Date.now()).toString(),
        type: newTransaction.type as 'Receita' | 'Despesa',
        description: newTransaction.description || '',
        amount: Number(newTransaction.amount),
        date: newTransaction.date || new Date().toISOString(),
        category: newTransaction.category || 'Geral',
        status: newTransaction.status as Status,
        projectId: newTransaction.projectId
      };
      await addFinancialRecord(transaction);
    }

    setIsModalOpen(false);
    setEditingId(null);
    setNewTransaction({
      type: 'Receita',
      description: '',
      amount: 0,
      category: '',
      date: new Date().toISOString().split('T')[0],
      status: Status.PENDING
    });
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#181418]">Financeiro</h1>
          <p className="text-slate-500">Gestão de contas a pagar e receber</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700"
          >
            <Download size={18} />
            <span>Exportar</span>
          </button>
          <button
            onClick={handleOpenNew}
            disabled={filterType === 'All'}
            title={filterType === 'All' ? "Selecione a aba Receitas ou Despesas para adicionar" : "Nova Transação"}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold shadow-sm transition-colors ${filterType === 'All'
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-[#c79229] text-[#181418] hover:bg-[#a67922]'
              }`}
          >
            <Plus size={18} />
            <span>Nova Transação</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-200 p-1 rounded-lg w-fit">
        {['All', 'Receita', 'Despesa'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filterType === type
                ? 'bg-white text-[#c79229] shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            {type === 'All' ? 'Todas' : type === 'Receita' ? 'Receitas' : 'Despesas'}
          </button>
        ))}
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4 w-10">Tipo</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length > 0 ? filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    {item.type === 'Receita' ? (
                      <ArrowUpCircle className="text-green-500" size={20} />
                    ) : (
                      <ArrowDownCircle className="text-red-500" size={20} />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-[#181418]">{item.description}</div>
                    {item.projectId && <div className="text-xs text-slate-400">Ref: Obra #{item.projectId}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 rounded text-slate-600 text-xs">{item.category}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                  <td className={`px-6 py-4 text-right font-bold ${item.type === 'Receita' ? 'text-green-600' : 'text-[#181418]'}`}>
                    R$ {item.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold
                      ${item.status === Status.PAID ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                    `}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-400">
                    <button
                      onClick={() => handleEdit(item)}
                      className="hover:text-[#c79229] flex items-center justify-end gap-1 w-full font-medium"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New/Edit Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-[#181418]">
                {editingId ? 'Editar Transação' : 'Nova Transação'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                <div className="flex space-x-4">
                  <label className={`flex items-center space-x-2 cursor-pointer ${filterType === 'Despesa' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <input
                      type="radio"
                      name="type"
                      checked={newTransaction.type === 'Receita'}
                      onChange={() => setNewTransaction({ ...newTransaction, type: 'Receita' })}
                      disabled={filterType === 'Despesa'}
                      className="text-[#c79229] focus:ring-[#c79229]"
                    />
                    <span className="text-slate-700">Receita</span>
                  </label>
                  <label className={`flex items-center space-x-2 cursor-pointer ${filterType === 'Receita' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <input
                      type="radio"
                      name="type"
                      checked={newTransaction.type === 'Despesa'}
                      onChange={() => setNewTransaction({ ...newTransaction, type: 'Despesa' })}
                      disabled={filterType === 'Receita'}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span className="text-slate-700">Despesa</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                  placeholder="Ex: Pagamento Fornecedor X"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: parseFloat(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                  <select
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                  >
                    <option value="">Selecione...</option>
                    <option value="Projeto">Projeto</option>
                    <option value="Obra">Obra</option>
                    <option value="Materiais">Materiais</option>
                    <option value="Administrativo">Administrativo</option>
                    <option value="Taxas">Taxas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={newTransaction.status}
                    onChange={(e) => setNewTransaction({ ...newTransaction, status: e.target.value as Status })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                  >
                    <option value={Status.PENDING}>{Status.PENDING}</option>
                    <option value={Status.PAID}>{Status.PAID}</option>
                    <option value={Status.LATE}>{Status.LATE}</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#c79229] text-[#181418] hover:bg-[#a67922] rounded-lg font-bold shadow-sm flex items-center gap-2"
                >
                  <Save size={18} />
                  <span>{editingId ? 'Salvar Alterações' : 'Salvar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;

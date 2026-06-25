
import React, { useState } from 'react';
import { Plus, Filter, Download, ArrowUpCircle, ArrowDownCircle, X, Save, Pencil, Trash2, Calendar } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Status, FinancialRecord } from '../types';

const Finance: React.FC = () => {
  const { financials, addFinancialRecord, updateFinancialRecord, deleteFinancialRecord } = useData();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [filterType, setFilterType] = useState<'All' | 'Receita' | 'Despesa'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentEntity, setCurrentEntity] = useState<'PJ' | 'Pessoal'>('PJ');
  const [paymentForm, setPaymentForm] = useState<'unique' | 'installment' | 'recurring'>('unique');
  const [installmentCount, setInstallmentCount] = useState(1);
  const [installmentEntryValue, setInstallmentEntryValue] = useState(0);
  const [recurrenceCount, setRecurrenceCount] = useState(12);
  const [isFixed, setIsFixed] = useState(false);

  // New transaction state
  const [newTransaction, setNewTransaction] = useState<Partial<FinancialRecord>>({
    type: 'Receita',
    description: '',
    amount: 0,
    category: '',
    date: new Date().toISOString().split('T')[0],
    status: Status.PENDING,
    financial_entity: 'PJ'
  });

  const filteredData = financials.filter(item => {
    const matchesType = filterType === 'All' ? true : item.type === filterType;
    const matchesMonth = item.date.startsWith(selectedMonth);
    const matchesEntity = item.financial_entity === currentEntity || (!item.financial_entity && currentEntity === 'PJ');
    return matchesType && matchesMonth && matchesEntity;
  });

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
      projectId: item.projectId,
      financial_entity: item.financial_entity || 'PJ'
    });
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditingId(null);
    const defaultType = filterType === 'Despesa' ? 'Despesa' : 'Receita';

    setNewTransaction({
      type: defaultType,
      description: '',
      amount: 0,
      category: '',
      date: new Date().toISOString().split('T')[0],
      status: Status.PENDING,
      financial_entity: currentEntity
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
        isRecurring: newTransaction.isRecurring,
        financial_entity: newTransaction.financial_entity as any || 'PJ'
      });
    } else {
      const baseRecord: Partial<FinancialRecord> = {
        type: newTransaction.type as 'Receita' | 'Despesa',
        description: newTransaction.description || '',
        amount: Number(newTransaction.amount),
        date: newTransaction.date || new Date().toISOString(),
        category: newTransaction.category || 'Geral',
        status: newTransaction.status as Status,
        projectId: newTransaction.projectId,
        financial_entity: newTransaction.financial_entity as any || 'PJ'
      };

      const generateMirroredRecords = (sourceRecords: FinancialRecord | FinancialRecord[]) => {
        const cat = (baseRecord.category || '').toLowerCase();
        const isProLabore = baseRecord.type === 'Despesa' && 
                            baseRecord.financial_entity === 'PJ' && 
                            (cat.includes('pró-labore') || cat.includes('pro-labore') || cat.includes('prolabore') || cat.includes('retirada'));
        
        if (!isProLabore) return null;
        
        const generateMirror = (r: any): any => ({
          ...r,
          id: undefined, // Let Supabase generate ID
          type: 'Receita',
          financial_entity: 'Pessoal',
          description: `${r.description} (Automático)`,
          projectId: undefined
        });
        
        if (Array.isArray(sourceRecords)) {
          return sourceRecords.map(generateMirror);
        }
        return generateMirror(sourceRecords);
      };

      if (paymentForm === 'unique') {
        const transaction: any = {
          ...baseRecord
        };
        await addFinancialRecord(transaction);
        const mirror = generateMirroredRecords(transaction);
        if (mirror) await addFinancialRecord(mirror);
      } else if (paymentForm === 'installment') {
        const records: any[] = [];
        const parentId = crypto.randomUUID();
        const count = installmentCount;
        const entryValue = installmentEntryValue;
        const remainingAmount = Number(newTransaction.amount) - entryValue;
        const installmentValue = remainingAmount / count;
        const startDate = new Date(newTransaction.date || new Date().toISOString());
        const totalWithEntry = entryValue > 0 ? count + 1 : count;

        const getStatusForDate = (dateStr: string) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const recordDate = new Date(dateStr);
          if (recordDate > today && newTransaction.status === Status.LATE) {
            return Status.PENDING;
          }
          return newTransaction.status as Status;
        };

        if (entryValue > 0) {
          const entryDate = newTransaction.date || new Date().toISOString();
          records.push({
            ...baseRecord,
            description: `[1/${totalWithEntry}] ${baseRecord.description} (Entrada)`,
            amount: entryValue,
            date: entryDate,
            status: getStatusForDate(entryDate),
            parentRecordId: parentId,
            installmentNumber: 1,
            totalInstallments: totalWithEntry
          });
        }

        for (let i = 1; i <= count; i++) {
          const date = new Date(startDate);
          date.setMonth(startDate.getMonth() + (entryValue > 0 ? i : i - 1));
          const dateStr = date.toISOString().split('T')[0];
          const currentNum = entryValue > 0 ? i + 1 : i;

          records.push({
            ...baseRecord,
            description: `[${currentNum}/${totalWithEntry}] ${baseRecord.description}`,
            amount: installmentValue,
            date: dateStr,
            status: getStatusForDate(dateStr),
            parentRecordId: parentId,
            installmentNumber: currentNum,
            totalInstallments: totalWithEntry
          });
        }
        await addFinancialRecord(records);
        const mirror = generateMirroredRecords(records);
        if (mirror) await addFinancialRecord(mirror);
      } else if (paymentForm === 'recurring') {
        const records: any[] = [];
        const parentId = crypto.randomUUID();
        const count = isFixed ? 24 : recurrenceCount;
        const startDate = new Date(newTransaction.date || new Date().toISOString());

        const getStatusForDate = (dateStr: string) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const recordDate = new Date(dateStr);
          if (recordDate > today && newTransaction.status === Status.LATE) {
            return Status.PENDING;
          }
          return newTransaction.status as Status;
        };

        for (let i = 0; i < count; i++) {
          const date = new Date(startDate);
          date.setMonth(startDate.getMonth() + i);
          const dateStr = date.toISOString().split('T')[0];
          records.push({
            ...baseRecord,
            date: dateStr,
            status: getStatusForDate(dateStr),
            parentRecordId: parentId,
            isRecurring: true
          });
        }
        await addFinancialRecord(records);
        const mirror = generateMirroredRecords(records);
        if (mirror) await addFinancialRecord(mirror);
      }
    }

    setIsModalOpen(false);
    setEditingId(null);
    setPaymentForm('unique');
    setInstallmentCount(1);
    setInstallmentEntryValue(0);
    setRecurrenceCount(12);
    setIsFixed(false);
    setNewTransaction({
      type: 'Receita',
      description: '',
      amount: 0,
      category: '',
      date: new Date().toISOString().split('T')[0],
      status: Status.PENDING
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este registro?")) {
      await deleteFinancialRecord(id);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#181418]">Financeiro</h1>
          <p className="text-slate-500">Gestão de lançamentos mensais</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Mês Selector */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-300 shadow-sm focus-within:ring-2 focus-within:ring-[#c79229]/20 transition-all">
            <Calendar size={18} className="text-[#c79229]" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="outline-none text-sm font-bold text-slate-700 bg-transparent cursor-pointer"
            />
          </div>

          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 h-[42px]"
          >
            <Download size={18} />
            <span>Exportar</span>
          </button>
          <button
            onClick={handleOpenNew}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg font-bold shadow-sm transition-colors bg-[#c79229] text-[#181418] hover:bg-[#a67922] h-[42px]"
          >
            <Plus size={18} />
            <span>Nova Transação</span>
          </button>
        </div>
      </div>

      {/* Entidade Selector (Tabs Superiores) */}
      <div className="flex p-1 bg-slate-100/80 rounded-xl w-full sm:w-fit border border-slate-200">
        <button
          onClick={() => setCurrentEntity('PJ')}
          className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${currentEntity === 'PJ'
            ? 'bg-[#181418] text-[#c79229] shadow-md'
            : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Configurações da Empresa (PJ)
        </button>
        <button
          onClick={() => setCurrentEntity('Pessoal')}
          className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${currentEntity === 'Pessoal'
            ? 'bg-[#181418] text-[#c79229] shadow-md'
            : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Minhas Finanças (Pessoal)
        </button>
      </div>

      {/* Tabs e Resumo Rápido */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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

        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase font-bold">
              Receitas {currentEntity === 'PJ' ? 'PJ' : 'Pessoais'}
            </p>
            <p className="text-sm font-bold text-green-600">
              R$ {filteredData.filter(i => i.type === 'Receita').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
            </p>
          </div>
          <div className="text-right border-l pl-4 border-slate-300">
            <p className="text-[10px] text-slate-500 uppercase font-bold">
              Despesas {currentEntity === 'PJ' ? 'PJ' : 'Pessoais'}
            </p>
            <p className="text-sm font-bold text-red-600">
              R$ {filteredData.filter(i => i.type === 'Despesa').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
            </p>
          </div>
        </div>
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
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleEdit(item)}
                        className="hover:text-[#c79229] transition-colors"
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="hover:text-red-500 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Destino do Lançamento</label>
                  <div className="flex space-x-4 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={newTransaction.financial_entity === 'PJ'}
                        onChange={() => setNewTransaction({ ...newTransaction, financial_entity: 'PJ' })}
                        className="text-[#c79229] focus:ring-[#c79229]"
                      />
                      <span className="text-sm text-slate-700 font-medium">Empresa (PJ)</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={newTransaction.financial_entity === 'Pessoal'}
                        onChange={() => setNewTransaction({ ...newTransaction, financial_entity: 'Pessoal' })}
                        className="text-[#c79229] focus:ring-[#c79229]"
                      />
                      <span className="text-sm text-slate-700 font-medium">Pessoal</span>
                    </label>
                  </div>
                </div>

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

                {!editingId && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Forma de Lançamento</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentForm('unique')}
                        className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${paymentForm === 'unique' ? 'bg-[#c79229] border-[#c79229] text-[#181418]' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        Único
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentForm('installment')}
                        className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${paymentForm === 'installment' ? 'bg-[#c79229] border-[#c79229] text-[#181418]' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        Parcelado
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentForm('recurring')}
                        className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${paymentForm === 'recurring' ? 'bg-[#c79229] border-[#c79229] text-[#181418]' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        Recorrente
                      </button>
                    </div>
                  </div>
                )}
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {paymentForm === 'unique' ? 'Valor (R$)' : 'Valor Total (R$)'}
                  </label>
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data Inicial</label>
                  <input
                    type="date"
                    required
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                  />
                </div>
              </div>

              {paymentForm === 'installment' && !editingId && (
                <div className="p-4 bg-slate-50 rounded-lg space-y-3 border border-slate-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Entrada (R$)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={installmentEntryValue}
                        onChange={(e) => setInstallmentEntryValue(parseFloat(e.target.value) || 0)}
                        className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Parcelas (Vezes)</label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={installmentCount}
                        onChange={(e) => setInstallmentCount(parseInt(e.target.value) || 1)}
                        className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                      />
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 italic">
                    {installmentEntryValue > 0 ? (
                      <span>Resumo: Entrada de R$ {installmentEntryValue.toLocaleString()} + {installmentCount}x de R$ {((Number(newTransaction.amount) - installmentEntryValue) / installmentCount).toLocaleString()}</span>
                    ) : (
                      <span>Resumo: {installmentCount}x de R$ {(Number(newTransaction.amount) / installmentCount).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              )}

              {paymentForm === 'recurring' && !editingId && (
                <div className="p-4 bg-slate-50 rounded-lg space-y-3 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFixed}
                        onChange={(e) => setIsFixed(e.target.checked)}
                        className="rounded text-[#c79229] focus:ring-[#c79229]"
                      />
                      <span className="text-sm font-medium text-slate-700">Lançamento Fixo (Mensal)</span>
                    </label>
                  </div>
                  {!isFixed && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Repetir por (Meses)</label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={recurrenceCount}
                        onChange={(e) => setRecurrenceCount(parseInt(e.target.value) || 1)}
                        className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
                      />
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400">
                    O sistema gerará {isFixed ? 'registros para os próximos 24 meses' : `os próximos ${recurrenceCount} registros`}.
                  </p>
                </div>
              )}

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
                    <option value="Pró-labore">Pró-labore</option>
                    <option value="Retirada">Retirada</option>
                    <option value="Pessoal">Pessoal (Geral)</option>
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

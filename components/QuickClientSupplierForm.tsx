import React, { useState } from 'react';
import { UserPlus, Building, Search, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Client, Supplier } from '../types';

interface QuickClientSupplierFormProps {
    type: 'client' | 'supplier';
    onSuccess: (id: string) => void;
    onCancel: () => void;
}

export default function QuickClientSupplierForm({ type, onSuccess, onCancel }: QuickClientSupplierFormProps) {
    const { addClient, addSupplier } = useData(); 
    const [formData, setFormData] = useState({ name: '', type: 'Pessoa Jurídica', document: '' });
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!formData.name) return;
        setIsSaving(true);
        try {
            if (type === 'client') {
                const newClient = {
                    ...formData,
                    id: crypto.randomUUID(),
                    email: '',
                    phone: '',
                    address: '',
                    status: 'Ativo',
                    createdAt: new Date().toISOString()
                };
                await addClient(newClient as Client);
                onSuccess(newClient.id);
            } else {
                const newSupplier = {
                    ...formData,
                    id: crypto.randomUUID(),
                    email: '',
                    phone: '',
                    address: '',
                    status: 'Ativo',
                    createdAt: new Date().toISOString()
                };
                if (addSupplier) {
                    await addSupplier(newSupplier as Supplier);
                }
                onSuccess(newSupplier.id);
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao salvar.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-2 mb-4">
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <UserPlus size={16} className="text-[#c79229]" />
                    {type === 'client' ? 'Cadastro Rápido de Cliente' : 'Cadastro Rápido de Fornecedor'}
                </h4>
                <button type="button" onClick={onCancel} className="p-1 hover:bg-slate-200 rounded text-slate-500">
                    <X size={16} />
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nome / Razão Social</label>
                    <input 
                        type="text" 
                        required 
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#c79229] outline-none" 
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tipo</label>
                    <select 
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value, document: '' })}
                        className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#c79229] outline-none"
                    >
                        <option value="Pessoa Jurídica">Pessoa Jurídica (CNPJ)</option>
                        <option value="Pessoa Física">Pessoa Física (CPF)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Documento</label>
                    <input 
                        type="text" 
                        value={formData.document}
                        onChange={e => setFormData({ ...formData, document: e.target.value })}
                        placeholder={formData.type === 'Pessoa Jurídica' ? '00.000.000/0000-00' : '000.000.000-00'}
                        className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#c79229] outline-none" 
                    />
                </div>
            </div>
            <div className="mt-3 flex justify-end">
                <button 
                    type="button" 
                    onClick={handleSave} 
                    disabled={isSaving || !formData.name}
                    className="px-4 py-2 bg-[#181418] text-white text-sm font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50"
                >
                    {isSaving ? 'Salvando...' : 'Salvar e Selecionar'}
                </button>
            </div>
        </div>
    );
}

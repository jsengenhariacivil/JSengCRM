import React, { useState } from 'react';
import { Settings, Shield, Users, Key, Database, Bell, Lock, Mail, Edit3, Trash2, Plus, X, Save, CheckCircle, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Administration: React.FC = () => {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'security' | 'database'>('users');

    // Mock users for UI
    const [users] = useState([
        { id: '1', name: 'Administrador Master', email: 'admin@jseng.com', role: 'Proprietário', status: 'Ativo' },
        { id: '2', name: 'Eng. Ricardo Silva', email: 'ricardo@jseng.com', role: 'Engenheiro Pleno', status: 'Ativo' },
        { id: '3', name: 'Ana Oliveira', email: 'ana@jseng.com', role: 'Financeiro', status: 'Ativo' },
        { id: '4', name: 'Carlos Bento', email: 'carlos@jseng.com', role: 'Estoquista', status: 'Pausado' },
    ]);

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                        <Settings className="text-[#c79229]" />
                        Administração do Sistema
                    </h1>
                    <p className="text-slate-500 text-sm">Controle de acesso, permissões e configurações globais</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Nav */}
                <div className="w-full lg:w-64 space-y-1">
                    {[
                        { id: 'users', label: 'Usuários', icon: Users },
                        { id: 'roles', label: 'Cargos e Permissões', icon: Shield },
                        { id: 'security', label: 'Segurança e Logs', icon: Lock },
                        { id: 'database', label: 'Banco de Dados', icon: Database },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === item.id ? 'bg-[#c79229] text-[#181418] shadow-lg shadow-[#c79229]/20' : 'text-slate-500 hover:bg-slate-100'}`}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 space-y-6">
                    {activeTab === 'users' && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Users size={20} className="text-[#c79229]" />
                                    Gerenciamento de Usuários
                                </h3>
                                <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all font-bold text-xs uppercase">
                                    <Plus size={16} />
                                    <span>Convidar Membro</span>
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4">Nome completo</th>
                                            <th className="px-6 py-4">Cargo / Nível</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm">
                                        {users.map((u) => (
                                            <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-[#c79229]/10 text-[#c79229] flex items-center justify-center font-black text-xs">
                                                            {u.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-700">{u.name}</p>
                                                            <p className="text-xs text-slate-400">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-slate-100 rounded-md text-[10px] font-black text-slate-600 uppercase border border-slate-200">{u.role}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${u.status === 'Ativo' ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
                                                        <span className="font-bold text-slate-600">{u.status}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg"><Edit3 size={16} /></button>
                                                        <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'roles' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Shield size={20} className="text-[#c79229]" />
                                    Controle de Permissões
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { title: 'Visualizar Obras', desc: 'Permite ver detalhes de todos os projetos', active: true },
                                        { title: 'Editar Financeiro', desc: 'Acesso total a lançamentos e caixa', active: false },
                                        { title: 'Gerar Relatórios', desc: 'Permite exportar dados sensíveis', active: true },
                                        { title: 'Administrar Pessoas', desc: 'Controle total sobre o RH e usuários', active: false },
                                    ].map((p, i) => (
                                        <div key={i} className="p-4 border border-slate-100 rounded-xl flex items-center justify-between hover:border-[#c79229]/20 transition-all cursor-pointer">
                                            <div>
                                                <p className="font-bold text-slate-700 text-sm">{p.title}</p>
                                                <p className="text-[10px] text-slate-400">{p.desc}</p>
                                            </div>
                                            <div className={`w-10 h-5 rounded-full relative transition-colors ${p.active ? 'bg-[#c79229]' : 'bg-slate-200'}`}>
                                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${p.active ? 'right-1' : 'left-1'}`}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl shadow-xl space-y-4 font-mono text-xs overflow-hidden h-80 animate-in fade-in slide-in-from-right-4 duration-300 relative border-4 border-slate-800">
                            <div className="absolute top-0 left-0 right-0 h-8 bg-slate-800 flex items-center px-4 justify-between border-b border-white/5">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SYSTEM_LOG_ACCESS_V2.0</span>
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                                </div>
                            </div>
                            <div className="pt-8 space-y-1">
                                <p className="text-green-500">[AUTH] User ricardo@jseng.com logged in successfully (IP: 191.13.4.122)</p>
                                <p className="text-blue-400">[DATA] Table 'contracts' updated by Admin (Record ID: 5221)</p>
                                <p className="text-slate-500">[INFO] Daily backup completed (S3: Region us-east-1)</p>
                                <p className="text-yellow-500">[WARN] High memory usage detected on Edge Functions (72%)</p>
                                <p className="text-red-500">[FAIL] Failed login attempt from 45.18.22.9 (Malicious pattern detected)</p>
                                <p className="text-slate-500">[INFO] Database schema migration v4.2 applied successfully</p>
                                <p className="text-green-500">[AUTH] Session token refreshed for UID: 182-XCA</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Administration;

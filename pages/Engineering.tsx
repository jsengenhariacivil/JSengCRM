import React, { useState } from 'react';
import { Plus, Search, FileCode, Calendar, User, Building, Trash2, Download, FileText, X, Save, ExternalLink, HardDrive, UploadCloud } from 'lucide-react';
import { useData } from '../context/DataContext';
import { EngineeringDocument } from '../types';

const Engineering: React.FC = () => {
    const { engineeringDocuments, addEngineeringDocument, deleteEngineeringDocument, projects, uploadFile } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState<Partial<EngineeringDocument>>({
        projectId: '',
        title: '',
        category: 'Outros',
        documentType: 'Link',
        fileUrl: '',
        version: '1.0',
        uploadedBy: ''
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const filteredDocs = engineeringDocuments.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        try {
            let finalUrl = formData.fileUrl || '';

            if (formData.documentType !== 'Link' && selectedFile) {
                const fileName = `${Date.now()}_${selectedFile.name}`;
                const path = formData.projectId
                    ? `projects/${formData.projectId}/${fileName}`
                    : `general/${fileName}`;

                finalUrl = await uploadFile('documents', path, selectedFile);
            }

            await addEngineeringDocument({
                ...formData,
                fileUrl: finalUrl,
            } as EngineeringDocument);

            setIsModalOpen(false);
            setFormData({
                projectId: '',
                title: '',
                category: 'Outros',
                documentType: 'Link',
                fileUrl: '',
                version: '1.0',
                uploadedBy: ''
            });
            setSelectedFile(null);
        } catch (error: any) {
            console.error("Erro ao salvar documento:", error);
            const errorMessage = error.message || (typeof error === 'string' ? error : "Erro desconhecido");
            alert(`Erro ao salvar documento: ${errorMessage}. Verifique se você executou o arquivo storage_setup.sql no console do Supabase.`);
        } finally {
            setIsUploading(false);
        }
    };

    const getCategoryColor = (cat: string) => {
        switch (cat) {
            case 'Projeto Estrutural': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Projeto Elétrico': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
            case 'Projeto Hidráulico': return 'bg-cyan-50 text-cyan-600 border-cyan-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <FileCode className="text-[#c79229]" />
                        Documentos e Engenharia
                    </h1>
                    <p className="text-slate-500 text-sm">Controle de revisões e pastas técnicas</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#c79229] text-[#181418] font-bold rounded-lg hover:bg-[#a67922] shadow-sm transition-all"
                >
                    <UploadCloud size={18} />
                    <span>Upload de Arquivo</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><HardDrive size={24} /></div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">Total de Arquivos</p>
                        <p className="text-xl font-black text-slate-800">{engineeringDocuments.length}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Pesquisar em documentos técnico..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#c79229] outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {/* Agrupamento por Obra */}
                    {projects.map(project => {
                        const projectDocs = filteredDocs.filter(d => d.projectId === project.id);
                        if (projectDocs.length === 0) return null;

                        return (
                            <div key={project.id} className="border-b border-slate-100 last:border-0">
                                <div className="bg-slate-100/30 px-6 py-3 flex items-center justify-between">
                                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                        <Building size={16} className="text-[#c79229]" />
                                        {project.title}
                                    </h3>
                                    <span className="bg-white px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-400 border border-slate-200">
                                        {projectDocs.length} documento(s)
                                    </span>
                                </div>
                                <table className="w-full text-left">
                                    <tbody className="divide-y divide-slate-100 text-sm">
                                        {projectDocs.map((doc) => (
                                            <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-slate-100 text-slate-400 rounded group-hover:bg-[#c79229]/10 group-hover:text-[#c79229] transition-colors">
                                                            {doc.documentType === 'Link' ? <ExternalLink size={20} /> : <FileText size={20} />}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-700">{doc.title}</p>
                                                            <p className="text-[10px] text-slate-400 font-mono truncate max-w-[250px]">{doc.fileUrl}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold border uppercase ${getCategoryColor(doc.category)}`}>
                                                        {doc.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-bold text-[9px] uppercase`}>
                                                        {doc.documentType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-mono font-bold text-slate-500 underline decoration-[#c79229]/30">v{doc.version}</td>
                                                <td className="px-6 py-4 text-slate-400">{new Date(doc.createdAt).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-[#c79229] hover:bg-[#c79229]/10 rounded-lg">
                                                            {doc.documentType === 'Link' ? <ExternalLink size={16} /> : <Download size={16} />}
                                                        </a>
                                                        <button onClick={() => deleteEngineeringDocument(doc.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })}

                    {/* Documentos Gerais (Sem Obra) */}
                    {filteredDocs.filter(d => !d.projectId).length > 0 && (
                        <div className="border-b border-slate-100 last:border-0">
                            <div className="bg-slate-100/30 px-6 py-3">
                                <h3 className="font-bold text-slate-700 flex items-center gap-2 underline decoration-[#c79229]/30 underline-offset-4">
                                    Documentos Gerais / Escritório
                                </h3>
                            </div>
                            <table className="w-full text-left">
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {filteredDocs.filter(d => !d.projectId).map((doc) => (
                                        <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-100 text-slate-400 rounded group-hover:bg-[#c79229]/10 group-hover:text-[#c79229] transition-colors">
                                                        {doc.documentType === 'Link' ? <ExternalLink size={20} /> : <FileText size={20} />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-700">{doc.title}</p>
                                                        <p className="text-[10px] text-slate-400 font-mono truncate max-w-[250px]">{doc.fileUrl}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold border uppercase ${getCategoryColor(doc.category)}`}>
                                                    {doc.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-bold text-[9px] uppercase`}>
                                                    {doc.documentType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono font-bold text-slate-500 underline decoration-[#c79229]/30">v{doc.version}</td>
                                            <td className="px-6 py-4 text-slate-400">{new Date(doc.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-[#c79229] hover:bg-[#c79229]/10 rounded-lg">
                                                        {doc.documentType === 'Link' ? <ExternalLink size={16} /> : <Download size={16} />}
                                                    </a>
                                                    <button onClick={() => deleteEngineeringDocument(doc.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {filteredDocs.length === 0 && (
                        <div className="px-6 py-12 text-center text-slate-400 italic bg-slate-50/20">
                            Nenhum documento técnico cadastrado.
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Upload */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-xl font-black text-slate-800">Upload de Documento</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Título do Documento</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#c79229] outline-none"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Ex: Prancha 01 - Locação"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Categoria</label>
                                    <select
                                        required
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#c79229] outline-none"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                                    >
                                        <option value="Planta">📐 Planta</option>
                                        <option value="Memorial">📝 Memorial</option>
                                        <option value="Especificação">📋 Especificação</option>
                                        <option value="Outros">⚙️ Outros</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Versão</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#c79229] outline-none font-mono"
                                        value={formData.version}
                                        onChange={e => setFormData({ ...formData, version: e.target.value })}
                                        placeholder="v1.0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Obra</label>
                                <select
                                    className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#c79229] outline-none"
                                    value={formData.projectId}
                                    onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                                >
                                    <option value="">Documento Geral</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tipo de Documento</label>
                                    <select
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#c79229] outline-none"
                                        value={formData.documentType}
                                        onChange={e => setFormData({ ...formData, documentType: e.target.value as any, fileUrl: '' })}
                                    >
                                        <option value="Link">🔗 Link Externo</option>
                                        <option value="PDF">📕 Arquivo PDF</option>
                                        <option value="Excel">📊 Planilha Excel</option>
                                    </select>
                                </div>
                                <div className="flex flex-col justify-end">
                                    {formData.documentType === 'Link' ? (
                                        <>
                                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Link (URL)</label>
                                            <input
                                                type="url"
                                                required
                                                className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#c79229] outline-none font-mono text-blue-600"
                                                value={formData.fileUrl}
                                                onChange={e => setFormData({ ...formData, fileUrl: e.target.value })}
                                                placeholder="https://exemplo.com/doc.pdf"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Arquivo ({formData.documentType})</label>
                                            <input
                                                type="file"
                                                required
                                                accept={formData.documentType === 'PDF' ? '.pdf' : '.xls,.xlsx,.csv'}
                                                onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                                                className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#c79229]/10 file:text-[#c79229] hover:file:bg-[#c79229]/20"
                                            />
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end gap-3 border-t border-slate-100 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-2.5 bg-[#c79229] text-[#181418] rounded-xl font-black shadow-lg shadow-[#c79229]/40 hover:bg-[#a67922] transition-all transform active:scale-95 flex items-center gap-2"
                                >
                                    <Save size={18} />
                                    Finalizar Upload
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Engineering;

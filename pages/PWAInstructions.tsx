
import React from 'react';
import {
    Smartphone,
    Share,
    PlusSquare,
    MoreVertical,
    Download,
    CheckCircle2,
    Apple,
    Chrome
} from 'lucide-react';

const PWAInstructions: React.FC = () => {
    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#c79229]/10 text-[#c79229] mb-4">
                    <Smartphone size={32} />
                </div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Instalar no Celular</h1>
                <p className="text-slate-500 text-lg">Acesse o JSengCRM como um aplicativo nativo no seu smartphone.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* iOS Instructions */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                        <Apple size={20} className="text-slate-700" />
                        <h2 className="font-bold text-slate-800">iPhone (iOS / Safari)</h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 flex-shrink-0">1</div>
                            <p className="text-slate-600">Abra o site no navegador <strong className="text-slate-800">Safari</strong>.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 flex-shrink-0">2</div>
                            <div className="text-slate-600">
                                Toque no ícone de <strong className="text-slate-800 flex items-center gap-1 inline-flex">Compartilhar <Share size={16} /></strong> na barra inferior.
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 flex-shrink-0">3</div>
                            <div className="text-slate-600">
                                Role para baixo e selecione <strong className="text-slate-800 flex items-center gap-1 inline-flex">Adicionar à Tela de Início <PlusSquare size={16} /></strong>.
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 flex-shrink-0">4</div>
                            <p className="text-slate-600">Confirme tocando em <strong className="text-slate-800">Adicionar</strong> no canto superior direito.</p>
                        </div>
                    </div>
                </div>

                {/* Android Instructions */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                        <Chrome size={20} className="text-slate-700" />
                        <h2 className="font-bold text-slate-800">Android (Chrome)</h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 flex-shrink-0">1</div>
                            <p className="text-slate-600">Abra o site no navegador <strong className="text-slate-800">Google Chrome</strong>.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 flex-shrink-0">2</div>
                            <div className="text-slate-600">
                                Toque nos <strong className="text-slate-800 flex items-center gap-1 inline-flex">três pontos <MoreVertical size={16} /></strong> no canto superior direito.
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 flex-shrink-0">3</div>
                            <div className="text-slate-600">
                                Selecione <strong className="text-slate-800 flex items-center gap-1 inline-flex">Instalar Aplicativo <Download size={16} /></strong>.
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 flex-shrink-0">4</div>
                            <p className="text-slate-600">Confirme tocando em <strong className="text-slate-800">Instalar</strong> no aviso que aparecerá.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 bg-[#c79229]/5 border border-[#c79229]/20 rounded-2xl p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-[#c79229]/30">
                        <CheckCircle2 size={40} className="text-[#c79229]" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Vantagens do Aplicativo</h3>
                        <ul className="text-slate-600 space-y-2 inline-block text-left">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-green-500" />
                                Acesso rápido pela tela inicial
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-green-500" />
                                Navegação em tela cheia (sem barras do navegador)
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-green-500" />
                                Melhor performance e estabilidade
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-green-500" />
                                Funcionamento offline parcial
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PWAInstructions;

import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UnderConstruction: React.FC<{ title: string }> = ({ title }) => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-20 h-20 bg-amber-100 text-[#c79229] rounded-full flex items-center justify-center mb-6 animate-pulse">
                <Construction size={40} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">{title}</h1>
            <p className="text-slate-500 max-w-md mb-8">
                Este módulo está em fase de desenvolvimento e estará disponível em breve com recursos completos para sua gestão.
            </p>
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#c79229] text-[#181418] font-bold rounded-lg hover:bg-[#b08124] transition-colors"
            >
                <ArrowLeft size={18} />
                Voltar
            </button>
        </div>
    );
};

export default UnderConstruction;

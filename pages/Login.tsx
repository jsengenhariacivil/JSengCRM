
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData, ROLE_DEFINITIONS } from '../context/DataContext';
import { Lock, Mail, ArrowRight, AlertCircle, User, CheckCircle } from 'lucide-react';
import { UserData } from '../types';
import { supabase } from '../supabaseClient';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { users, addUser, companyName, companyLogo } = useData();

    // Toggle State
    const [isRegistering, setIsRegistering] = useState(false);

    // Login State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Register State
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirmPassword, setRegConfirmPassword] = useState('');

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error || 'Erro ao fazer login');
        }

        setIsLoading(false);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validações Básicas
        if (!regName || !regEmail || !regPassword || !regConfirmPassword) {
            setError('Preencha todos os campos.');
            return;
        }

        if (regPassword !== regConfirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        if (regPassword.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres.');
            return;
        }

        setIsLoading(true);

        try {
            // Criar usuário no Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: regEmail,
                password: regPassword,
            });

            if (authError) {
                setError(authError.message);
                setIsLoading(false);
                return;
            }

            if (authData.user) {
                // Criar registro na tabela users
                const { error: dbError } = await supabase
                    .from('users')
                    .insert([{
                        id: authData.user.id,
                        email: regEmail,
                        name: regName,
                        role: 'Visitante',
                        view_financial: false,
                        edit_financial: false,
                        view_projects: false,
                        edit_projects: false,
                        manage_settings: false,
                    }]);

                if (dbError) {
                    setError('Erro ao criar usuário no banco de dados: ' + dbError.message);
                    setIsLoading(false);
                    return;
                }

                // Auto-login após cadastro
                const loginResult = await login(regEmail, regPassword);

                if (loginResult.success) {
                    navigate('/');
                } else {
                    setError('Conta criada! Faça login para continuar.');
                    setIsRegistering(false);
                }
            }

            setIsLoading(false);
        } catch (error: any) {
            setError(error.message || 'Erro ao criar conta');
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setIsRegistering(!isRegistering);
        setError('');
        setEmail('');
        setPassword('');
        setRegName('');
        setRegEmail('');
        setRegPassword('');
        setRegConfirmPassword('');
    };

    return (
        <div className="min-h-screen bg-[#181418] flex items-center justify-center p-4">
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] animate-in fade-in duration-500">

                {/* Lado Esquerdo - Visual */}
                <div className="w-full md:w-1/2 bg-[#181418] relative flex flex-col items-center justify-center p-12 text-center border-r border-[#c79229]/20 transition-all duration-500">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#c79229 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                    <div className="relative z-10">
                        {companyLogo ? (
                            <img src={companyLogo} alt="Logo" className="max-h-32 object-contain mb-8 mx-auto animate-in zoom-in duration-700" />
                        ) : (
                            <div className="mb-8">
                                <h1 className="text-4xl font-bold text-white tracking-tight">{companyName}</h1>
                                <p className="text-[#c79229] uppercase tracking-[0.3em] text-sm mt-2">Construção & Reforma</p>
                            </div>
                        )}

                        <h2 className="text-2xl font-bold text-white mb-4">
                            {isRegistering ? 'Junte-se à Equipe' : 'Gestão Integrada'}
                        </h2>
                        <p className="text-slate-400 max-w-xs mx-auto leading-relaxed">
                            {isRegistering
                                ? 'Crie sua conta. Seu acesso será limitado até aprovação do administrador.'
                                : 'Acesse o sistema para gerenciar obras, finanças e propostas.'
                            }
                        </p>
                    </div>

                    <div className="absolute bottom-8 text-slate-600 text-xs">
                        &copy; {new Date().getFullYear()} EngPro CRM. Todos os direitos reservados.
                    </div>
                </div>

                {/* Lado Direito - Formulário */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white relative">
                    <div className="max-w-xs w-full mx-auto">
                        <h2 className="text-3xl font-bold text-[#181418] mb-2">
                            {isRegistering ? 'Criar Conta' : 'Bem-vindo'}
                        </h2>
                        <p className="text-slate-500 mb-8">
                            {isRegistering ? 'Preencha seus dados.' : 'Digite suas credenciais.'}
                        </p>

                        {isRegistering ? (
                            // --- REGISTER FORM ---
                            <form onSubmit={handleRegister} className="space-y-4 animate-in slide-in-from-right duration-300">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1 ml-1">Nome Completo</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="text-slate-400 group-focus-within:text-[#c79229] transition-colors" size={20} />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={regName}
                                            onChange={(e) => setRegName(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-[#c79229] focus:ring-2 focus:ring-[#c79229]/20 outline-none transition-all bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400"
                                            placeholder="Seu nome"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1 ml-1">Email</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="text-slate-400 group-focus-within:text-[#c79229] transition-colors" size={20} />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={regEmail}
                                            onChange={(e) => setRegEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-[#c79229] focus:ring-2 focus:ring-[#c79229]/20 outline-none transition-all bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400"
                                            placeholder="seu@email.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1 ml-1">Senha</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="text-slate-400 group-focus-within:text-[#c79229] transition-colors" size={20} />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={regPassword}
                                            onChange={(e) => setRegPassword(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-[#c79229] focus:ring-2 focus:ring-[#c79229]/20 outline-none transition-all bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400"
                                            placeholder="Criar senha"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1 ml-1">Confirmar Senha</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <CheckCircle className="text-slate-400 group-focus-within:text-[#c79229] transition-colors" size={20} />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={regConfirmPassword}
                                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-[#c79229] focus:ring-2 focus:ring-[#c79229]/20 outline-none transition-all bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400"
                                            placeholder="Repetir senha"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-lg animate-in slide-in-from-top-2">
                                        <AlertCircle size={16} />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full bg-[#c79229] hover:bg-[#a67922] text-[#181418] font-bold py-3.5 rounded-lg shadow-lg shadow-orange-500/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                                >
                                    {isLoading ? (
                                        <span>Criando conta...</span>
                                    ) : (
                                        <>
                                            <span>Cadastrar</span>
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            // --- LOGIN FORM ---
                            <form onSubmit={handleLogin} className="space-y-5 animate-in slide-in-from-left duration-300">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Email Profissional</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="text-slate-400 group-focus-within:text-[#c79229] transition-colors" size={20} />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-[#c79229] focus:ring-2 focus:ring-[#c79229]/20 outline-none transition-all bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400"
                                            placeholder="exemplo@jseng.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Senha</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="text-slate-400 group-focus-within:text-[#c79229] transition-colors" size={20} />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-[#c79229] focus:ring-2 focus:ring-[#c79229]/20 outline-none transition-all bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-lg animate-in slide-in-from-top-2">
                                        <AlertCircle size={16} />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full bg-[#c79229] hover:bg-[#a67922] text-[#181418] font-bold py-3.5 rounded-lg shadow-lg shadow-orange-500/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                                >
                                    {isLoading ? (
                                        <span>Aguarde...</span>
                                    ) : (
                                        <>
                                            <span>Acessar Sistema</span>
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                            <p className="text-sm text-slate-500">
                                {isRegistering ? 'Já tem uma conta?' : 'Não tem uma conta?'}
                                <button
                                    onClick={toggleMode}
                                    className="ml-2 font-bold text-[#c79229] hover:text-[#a67922] transition-colors focus:outline-none"
                                >
                                    {isRegistering ? 'Entrar' : 'Cadastre-se'}
                                </button>
                            </p>
                            {!isRegistering && (
                                <p className="text-xs text-slate-400 mt-4">
                                    (Demo: admin@jseng.com / admin)
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

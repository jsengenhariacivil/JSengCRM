import React from 'react';
import { X, Printer } from 'lucide-react';
import { TeamMember, PaymentRecord } from '../types';

interface PayslipModalProps {
  employee: TeamMember;
  payment: PaymentRecord;
  onClose: () => void;
}

export default function PayslipModal({ employee, payment, onClose }: PayslipModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const fmtDate = (d: string) => {
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  };

  const fmtCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Convert month name
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const paymentDate = new Date(payment.date + 'T12:00:00');
  const competence = `${monthNames[paymentDate.getMonth()]} de ${paymentDate.getFullYear()}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:bg-white print:p-0">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl print:shadow-none print:w-full print:max-w-none print:h-screen print:rounded-none">
        
        {/* Toolbar (Hidden on print) */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50 print:hidden">
          <h2 className="text-lg font-bold text-gray-800">Recibo de Pagamento</h2>
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 text-sm hover:bg-blue-700 transition-colors"
            >
              <Printer size={16} /> Imprimir
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-8 print:p-8 bg-white text-black" id="printable-receipt">
          
          <div className="border-2 border-black p-6 rounded-lg space-y-6 relative">
            <div className="text-center border-b border-black pb-4">
              <h1 className="text-2xl font-bold uppercase tracking-wider">Recibo de Pagamento</h1>
              <p className="text-sm font-medium mt-1">Ref: {payment.reference} - Competência: {competence}</p>
            </div>

            <div className="flex justify-between items-start">
              <div className="space-y-1 text-sm">
                <p><strong>Empregador:</strong> JS ENGENHARIA CIVIL E REFORMAS</p>
                <p><strong>CNPJ:</strong> 00.000.000/0001-00</p>
                <p><strong>Endereço:</strong> Rua Principal, Centro - SP</p>
              </div>
              <div className="text-right border border-black p-3 bg-gray-50">
                <p className="text-xs font-bold uppercase mb-1">Valor do Recibo</p>
                <p className="text-2xl font-bold">{fmtCurrency(payment.value)}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 border border-gray-300 text-sm leading-relaxed text-justify">
              <p>
                Eu, <strong>{employee.name}</strong>, inscrito(a) no CPF sob o nº <strong>{employee.document_cpf || 'Não informado'}</strong>,
                {employee.document_rg ? ` e RG nº ${employee.document_rg},` : ''} 
                declaro ter recebido da empresa <strong>JS ENGENHARIA CIVIL E REFORMAS</strong> a importância líquida e certa de 
                <strong> {fmtCurrency(payment.value)}</strong>, efetuada no dia <strong>{fmtDate(payment.date)}</strong>, 
                referente à remuneração (salário, benefícios e demais verbas acordadas) pelos serviços prestados na função de <strong>{employee.role}</strong>.
              </p>
              <br/>
              <p>
                Por ser a expressão da verdade e para que produza seus efeitos legais, firmo o presente recibo, dando plena, geral e irrevogável quitação dos valores aqui discriminados.
              </p>
            </div>

            <div className="pt-16 pb-4">
              <div className="w-2/3 mx-auto border-t border-black text-center pt-2">
                <p className="font-bold text-sm uppercase">{employee.name}</p>
                <p className="text-xs text-gray-600">CPF: {employee.document_cpf || '___________'}</p>
              </div>
            </div>
            
            <div className="text-xs text-center text-gray-500 pt-8">
              Documento gerado eletronicamente em {fmtDate(new Date().toISOString().split('T')[0])} via JSengCRM
            </div>
            
          </div>
          
        </div>
      </div>
    </div>
  );
}

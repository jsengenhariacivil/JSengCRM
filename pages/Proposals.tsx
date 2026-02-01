
import React, { useState, useEffect, useRef } from 'react';
import { FileText, Plus, CheckCircle, Trash2, Printer, X, Download, ArrowLeft, Package, Upload, FileSpreadsheet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Status, Proposal } from '../types';
import * as XLSX from 'xlsx';

interface ProposalsProps {
  viewMode?: 'list' | 'create';
  filterStatus?: Status;
}

// Componente de Pré-visualização de Impressão (Estilo Documento A4)
const PrintPreviewModal = ({ proposal, onClose, clients }: { proposal: Proposal, onClose: () => void, clients: any[] }) => {
  const { companyName, companyLogo, companyAddress, companyEmail } = useData();
  const [isGenerating, setIsGenerating] = useState(false);
  const client = clients.find(c => c.name === proposal.clientName) || {
    name: proposal.clientName,
    document: 'Não informado',
    address: 'Não informado',
    email: 'email@exemplo.com'
  };

  const handleDownloadPDF = () => {
    setIsGenerating(true);
    const element = document.getElementById('printable-content');

    if (!element) {
      setIsGenerating(false);
      return;
    }

    const opt = {
      margin: 0,
      filename: `Proposta_${proposal.id}_${client.name.split(' ')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // @ts-ignore
    if (window.html2pdf) {
      // @ts-ignore
      window.html2pdf().set(opt).from(element).save().then(() => {
        setIsGenerating(false);
      }).catch((err: any) => {
        console.error("Erro ao gerar PDF:", err);
        alert("Houve um erro ao gerar o PDF. Tente novamente.");
        setIsGenerating(false);
      });
    } else {
      alert("Biblioteca de PDF não carregada. Usando impressão padrão do navegador.");
      window.print();
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex flex-col">
      {/* CSS para garantir aparência correta A4 na tela e no PDF */}
      <style>{`
        .a4-page {
           width: 210mm;
           min-height: 297mm;
           background: white;
           margin: 0 auto;
           box-shadow: 0 0 20px rgba(0,0,0,0.5);
        }
        @media print {
           .a4-page {
             box-shadow: none;
             width: 100%;
             height: auto;
             margin: 0;
           }
           /* Força a impressão das cores de fundo */
           * {
             -webkit-print-color-adjust: exact !important;
             print-color-adjust: exact !important;
           }
           /* Esconde botões na impressão nativa se necessário */
           .no-print-native {
             display: none !important;
           }
        }
      `}</style>

      {/* Header Fixo com Ações */}
      <div className="flex-none p-4 flex justify-between items-center text-white bg-slate-900/50 w-full z-10 border-b border-white/10 no-print-native">
        <h3 className="font-bold text-lg drop-shadow-md hidden md:block">Pré-visualização da Proposta</h3>
        <h3 className="font-bold text-lg drop-shadow-md md:hidden">Proposta #{proposal.id}</h3>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className={`bg-[#c79229] hover:bg-[#a67922] text-[#181418] font-bold px-3 py-2 md:px-4 md:py-2 rounded-lg flex items-center gap-2 shadow-lg transition-colors cursor-pointer border border-[#c79229] text-sm md:text-base ${isGenerating ? 'opacity-70 cursor-wait' : ''}`}
          >
            {isGenerating ? (
              <>Processando...</>
            ) : (
              <><Download size={18} /> <span className="hidden md:inline">Salvar PDF</span></>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="bg-[#181418] hover:bg-black text-white px-3 py-2 md:px-4 md:py-2 rounded-lg flex items-center gap-2 shadow-lg transition-colors cursor-pointer border border-slate-700 text-sm md:text-base"
          >
            <X size={18} /> <span className="hidden md:inline">Fechar</span>
          </button>
        </div>
      </div>

      {/* Área de Conteúdo com Scroll */}
      <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center items-start">
        <div className="a4-page relative flex flex-col shrink-0 origin-top" id="printable-content">

          {/* Header estilizado com fundo escuro para realçar logo transparente */}
          <div className="bg-[#181418] px-8 md:px-12 py-10 relative print:px-12">
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#c79229]"></div>

            <div className="flex justify-between items-center flex-col md:flex-row gap-6 md:gap-0">
              <div className="flex items-center gap-4">
                {/* Dynamic Logo or Text */}
                {companyLogo ? (
                  <img src={companyLogo} alt={companyName} className="max-h-24 max-w-[200px] md:max-w-[250px] object-contain" />
                ) : (
                  <div>
                    <h1 className="text-3xl font-extrabold text-white leading-none tracking-tight">{companyName}</h1>
                    <p className="text-sm font-bold text-[#c79229] uppercase tracking-widest mt-1">Construção & Reforma</p>
                  </div>
                )}
              </div>
              <div className="text-center md:text-right w-full md:w-auto">
                <h2 className="font-bold text-white text-xl">Proposta Comercial</h2>
                <p className="text-[#c79229] font-mono font-bold">#{proposal.id.padStart(6, '0')}</p>
                <div className="mt-2 text-sm text-slate-300">
                  <p className="max-w-[250px] truncate mx-auto md:mx-0">{companyAddress}</p>
                  <p>{companyEmail}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12 pt-8 flex-1 flex flex-col">
            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12 bg-slate-50 p-6 rounded-lg border-l-4 border-[#c79229]">
              <div>
                <h3 className="text-xs font-bold text-[#c79229] uppercase tracking-wider mb-2">Cliente</h3>
                <p className="font-bold text-[#181418] text-lg">{client.name}</p>
                <p className="text-slate-600">{client.document}</p>
                <p className="text-slate-600">{client.address}</p>
                <p className="text-slate-600">{client.email}</p>
              </div>
              <div className="text-left md:text-right">
                <h3 className="text-xs font-bold text-[#c79229] uppercase tracking-wider mb-2">Detalhes da Proposta</h3>
                <div className="flex justify-start md:justify-end gap-4 mb-1">
                  <span className="text-slate-600">Data de Emissão:</span>
                  <span className="font-medium text-[#181418]">{new Date(proposal.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-start md:justify-end gap-4 mb-1">
                  <span className="text-slate-600">Validade:</span>
                  <span className="font-medium text-[#181418]">15 dias</span>
                </div>
                <div className="flex justify-start md:justify-end gap-4">
                  <span className="text-slate-600">Status:</span>
                  <span className={`font-bold ${proposal.status === Status.APPROVED ? 'text-green-600' : 'text-[#181418]'}`}>
                    {proposal.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-[#181418] text-white">
                    <th className="py-3 px-4 text-sm font-bold uppercase rounded-tl-lg">Item / Serviço</th>
                    <th className="py-3 px-2 text-sm font-bold text-center uppercase w-24">Qtd.</th>
                    <th className="py-3 px-2 text-sm font-bold text-right uppercase w-32">Unitário</th>
                    <th className="py-3 px-4 text-sm font-bold text-right uppercase w-32 rounded-tr-lg">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {proposal.items && proposal.items.length > 0 ? (
                    proposal.items.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-100 even:bg-slate-50">
                        <td className="py-4 px-4 text-slate-800">
                          <p className="font-bold">{item.name}</p>
                        </td>
                        <td className="py-4 px-2 text-center text-slate-600">{item.quantity}</td>
                        <td className="py-4 px-2 text-right text-slate-600">R$ {item.unitPrice.toLocaleString()}</td>
                        <td className="py-4 px-4 text-right font-medium text-[#181418]">R$ {(item.quantity * item.unitPrice).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-b border-slate-100">
                      <td className="py-4 px-4 text-slate-800">
                        <p className="font-bold">Serviços de Engenharia (Pacote Geral)</p>
                      </td>
                      <td className="py-4 px-2 text-center text-slate-600">1</td>
                      <td className="py-4 px-2 text-right text-slate-600">R$ {proposal.total.toLocaleString()}</td>
                      <td className="py-4 px-4 text-right font-medium text-[#181418]">R$ {proposal.total.toLocaleString()}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-20">
              <div className="w-full md:w-64 bg-[#181418] p-6 rounded-lg text-white">
                <div className="flex justify-between mb-2 text-[#c79229]/80">
                  <span>Subtotal</span>
                  <span>R$ {proposal.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-4 text-[#c79229]/80">
                  <span>Impostos (0%)</span>
                  <span>R$ 0,00</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-[#c79229] text-xl font-bold text-[#c79229]">
                  <span>Total Geral</span>
                  <span>R$ {proposal.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Footer / Signatures */}
            <div className="mt-auto grid grid-cols-2 gap-12 pt-12">
              <div className="text-center">
                <div className="border-t border-slate-400 w-3/4 mx-auto mb-2"></div>
                <p className="font-bold text-[#181418]">{companyName}</p>
                <p className="text-xs text-slate-500">Prestador</p>
              </div>
              <div className="text-center">
                <div className="border-t border-slate-400 w-3/4 mx-auto mb-2"></div>
                <p className="font-bold text-[#181418]">{client.name}</p>
                <p className="text-xs text-slate-500">Cliente</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component for Creating a Proposal
const CreateProposal = ({ onCancel, onSave }: { onCancel: () => void, onSave: (proposal: Proposal) => void }) => {
  const { clients, services } = useData(); // Use Global Data
  const [selectedClient, setSelectedClient] = useState('');
  const [validityDate, setValidityDate] = useState(new Date().toISOString().split('T')[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state for items
  const [items, setItems] = useState<{
    tempId: number;
    serviceId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    unit: string;
  }[]>([]);

  const handleAddItem = () => {
    // Add a blank line or default to first service
    setItems(prev => [...prev, {
      tempId: Date.now(),
      serviceId: '',
      name: '',
      quantity: 1,
      unitPrice: 0,
      unit: 'un'
    }]);
  };

  const handleServiceChange = (index: number, serviceId: string) => {
    const service = services.find(s => s.id === serviceId);

    setItems(prev => prev.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          serviceId: serviceId,
          name: service ? service.name : '', // Se não selecionou nada, limpa o nome
          unitPrice: service ? service.basePrice : 0,
          unit: service ? service.unit : 'un'
        };
      }
      return item;
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setItems(prev => prev.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  };

  // --- EXCEL IMPORT LOGIC ---

  const handleDownloadTemplate = () => {
    const wsData = [
      ['Serviço', 'Descrição', 'Quantidade', 'Unidade', 'Valor Unitário'],
      ['Instalação Elétrica', 'Fiação completa do quarto', 10, 'pt', 150.00],
      ['Pintura', 'Paredes internas (Látex)', 50, 'm²', 35.50]
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Modelo Proposta");
    XLSX.writeFile(wb, "modelo_importacao_proposta.xlsx");
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      if (data && data.length > 0) {
        const newItems = data.map((row: any) => {
          // Tenta mapear nomes de colunas comuns
          const serviceName = row['Serviço'] || row['Servico'] || row['Service'] || '';
          const desc = row['Descrição'] || row['Descricao'] || row['descricao'] || row['Nome'] || '';

          // Combina Serviço e Descrição se ambos existirem, ou usa um deles para o campo Nome
          let finalName = '';
          if (serviceName && desc) {
            finalName = `${serviceName} - ${desc}`;
          } else {
            finalName = serviceName || desc || 'Item importado';
          }

          const qty = Number(row['Quantidade'] || row['Qtd'] || row['qtd'] || row['quantidade'] || 1);
          const unit = row['Unidade'] || row['unidade'] || row['Unit'] || 'un';
          const price = Number(row['Valor Unitário'] || row['Valor Unitario'] || row['Preco'] || row['Valor'] || 0);

          return {
            tempId: Date.now() + Math.random(),
            serviceId: '', // Importado vem como Custom
            name: String(finalName),
            quantity: isNaN(qty) ? 1 : qty,
            unitPrice: isNaN(price) ? 0 : price,
            unit: String(unit)
          };
        });

        // Adiciona os novos itens aos existentes
        setItems(prev => [...prev, ...newItems]);
        alert(`${newItems.length} itens importados com sucesso!`);
      } else {
        alert('Não foi possível ler dados da planilha. Verifique o modelo.');
      }

      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  // --- SAVE LOGIC ---

  const handleSaveClick = (isPrint: boolean) => {
    // 1. Validação do Cliente
    if (!selectedClient) {
      alert('Por favor, selecione um cliente.');
      return;
    }

    // 2. Validação se existem itens
    if (items.length === 0) {
      alert('Adicione pelo menos um serviço à proposta.');
      return;
    }

    // 3. Validação dos dados dos itens (Nome e Quantidade)
    const validItems = items.filter(i => i.name.trim() !== '' && i.quantity > 0);

    if (validItems.length === 0) {
      alert('Preencha os dados dos serviços (Nome e Quantidade).');
      return;
    }

    if (validItems.length !== items.length) {
      if (!window.confirm('Existem itens incompletos (sem nome ou quantidade zerada) que serão ignorados. Deseja continuar?')) {
        return;
      }
    }

    const client = clients.find(c => c.id === selectedClient);
    const total = calculateTotal();

    const newProposal: Proposal = {
      id: Math.floor(Math.random() * 10000).toString(),
      clientId: selectedClient,
      clientName: client ? client.name : 'Cliente',
      date: new Date().toISOString(),
      status: Status.PENDING,
      total: total,
      items: validItems.map(item => ({
        serviceId: item.serviceId || 'custom',
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }))
    };

    if (isPrint) {
      alert('Proposta salva! Você poderá imprimir a visualização na próxima tela.');
    }

    onSave(newProposal);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-xl font-bold text-[#181418]">Nova Proposta Comercial</h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-red-500">
          <X size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
          <select
            className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-[#c79229] outline-none"
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
          >
            <option value="">Selecione um cliente...</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name} - {client.document}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Data de Validade</label>
          <input
            type="date"
            value={validityDate}
            onChange={(e) => setValidityDate(e.target.value)}
            className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-[#c79229] outline-none"
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center mb-2 gap-2">
          <label className="block text-sm font-medium text-slate-700">Serviços e Materiais</label>

          <div className="flex gap-2">
            <input
              type="file"
              accept=".xlsx, .xls"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="text-xs flex items-center gap-1 text-slate-500 hover:text-[#c79229] border border-slate-200 px-2 py-1 rounded hover:bg-slate-50 transition-colors"
              title="Baixar modelo de planilha para preenchimento"
            >
              <FileSpreadsheet size={14} /> Baixar Modelo
            </button>
            <button
              type="button"
              onClick={handleImportClick}
              className="text-xs flex items-center gap-1 bg-[#181418] text-[#c79229] px-3 py-1 rounded hover:bg-black transition-colors font-bold"
            >
              <Upload size={14} /> Importar Excel
            </button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden bg-slate-50 overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[800px]">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 w-12"></th>
                <th className="px-4 py-3 min-w-[200px]">Modelo de Serviço</th>
                <th className="px-4 py-3 min-w-[250px]">Descrição (Editável)</th>
                <th className="px-4 py-3 w-32 text-center">Qtd.</th>
                {/* Mantendo o ajuste visual solicitado anteriormente */}
                <th className="px-4 py-3 min-w-[150px] text-right">Valor Unit.</th>
                <th className="px-4 py-3 min-w-[150px] text-right">Total</th>
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {items.map((item, idx) => {
                const lineTotal = item.quantity * item.unitPrice;

                return (
                  <tr key={item.tempId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-center text-slate-400 align-middle">
                      <Package size={18} />
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <select
                        className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 focus:bg-white focus:border-[#c79229] focus:ring-1 focus:ring-[#c79229] outline-none text-sm cursor-pointer shadow-sm transition-all"
                        value={item.serviceId}
                        onChange={(e) => handleServiceChange(idx, e.target.value)}
                      >
                        <option value="">Selecione...</option>
                        {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <input
                        type="text"
                        className="w-full p-2.5 border border-slate-300 rounded-lg focus:border-[#c79229] focus:ring-1 focus:ring-[#c79229] bg-white outline-none font-medium text-slate-900 placeholder-slate-400 shadow-sm transition-all"
                        placeholder="Nome do serviço..."
                        value={item.name}
                        onChange={(e) => updateItem(idx, 'name', e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          className="w-20 p-2.5 border border-slate-300 rounded-lg text-center bg-white text-slate-900 focus:border-[#c79229] focus:ring-1 focus:ring-[#c79229] outline-none shadow-sm transition-all"
                          value={item.quantity}
                          onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                        />
                        <span className="text-xs text-slate-500 font-medium w-6">{item.unit}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">R$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full pl-9 p-2.5 border border-slate-300 rounded-lg text-right bg-white text-slate-900 focus:border-[#c79229] focus:ring-1 focus:ring-[#c79229] outline-none shadow-sm transition-all"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right font-bold text-slate-900 bg-slate-50/50 border-l border-slate-100 align-middle">
                      R$ {lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    <td className="px-4 py-3 text-center align-middle">
                      <button onClick={() => removeItem(idx)} className="text-slate-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50" title="Remover item"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400 italic bg-white flex flex-col items-center justify-center">
                    <Package size={48} className="opacity-20 mb-2" />
                    Adicione serviços para compor a proposta ou importe do Excel.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-slate-50 font-bold text-slate-800 border-t border-slate-200">
              <tr>
                <td colSpan={7} className="px-0 py-0">
                  <button
                    onClick={handleAddItem}
                    type="button"
                    className="w-full py-4 flex items-center justify-center gap-2 text-[#c79229] hover:bg-[#c79229]/10 transition-colors font-medium border-b border-slate-200"
                  >
                    <Plus size={18} /> Adicionar Item Manualmente
                  </button>
                </td>
              </tr>
              <tr>
                <td colSpan={5} className="px-4 py-4 text-right text-lg">Total Geral:</td>
                <td className="px-4 py-4 text-right text-xl text-[#181418]">R$ {calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => handleSaveClick(false)}
          className="px-6 py-2 bg-[#c79229] text-[#181418] rounded-lg hover:bg-[#a67922] shadow-md flex items-center gap-2 font-bold transition-colors"
        >
          <CheckCircle size={18} />
          <span>Salvar Proposta</span>
        </button>
      </div>
    </div>
  );
};

const Proposals: React.FC<ProposalsProps> = ({ viewMode = 'list', filterStatus }) => {
  const navigate = useNavigate();
  const { proposals, addProposal, updateProposalStatus, clients } = useData();
  const [isCreating, setIsCreating] = useState(viewMode === 'create');
  const [previewProposal, setPreviewProposal] = useState<Proposal | null>(null);

  useEffect(() => {
    setIsCreating(viewMode === 'create');
  }, [viewMode]);

  const handleSaveProposal = async (newProposal: Proposal) => {
    await addProposal(newProposal);
    setIsCreating(false);
    navigate('/propostas');
  };

  const handlePreview = (proposal: Proposal) => {
    setPreviewProposal(proposal);
  };

  const handleApprove = async (id: string) => {
    await updateProposalStatus(id, Status.APPROVED);
    alert(`Proposta #${id} aprovada com sucesso!`);
  };

  const filteredProposals = filterStatus
    ? proposals.filter(p => p.status === filterStatus)
    : proposals;

  const pageTitle = filterStatus === Status.APPROVED
    ? "Propostas Aprovadas"
    : "Propostas Enviadas";

  return (
    <div className="space-y-6">
      {!isCreating ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#181418]">{pageTitle}</h1>
              <p className="text-slate-500">
                {filterStatus === Status.APPROVED
                  ? 'Orçamentos fechados e prontos para execução'
                  : 'Gerador e histórico de orçamentos'}
              </p>
            </div>
            <button
              onClick={() => navigate('/propostas/nova')}
              className="flex items-center space-x-2 px-4 py-2 bg-[#c79229] text-[#181418] font-bold rounded-lg hover:bg-[#a67922] shadow-sm transition-colors"
            >
              <Plus size={18} />
              <span>Nova Proposta</span>
            </button>
          </div>

          <div className="grid gap-4">
            {filteredProposals.length > 0 ? filteredProposals.map(proposal => (
              <div key={proposal.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition-shadow hover:border-[#c79229]/30">
                <div className="flex items-center gap-4">
                  <div className="bg-[#c79229]/10 p-3 rounded-lg text-[#c79229]">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#181418]">Proposta #{proposal.id.padStart(4, '0')}</h3>
                    <p className="text-sm text-slate-500">Cliente: {proposal.clientName}</p>
                    <p className="text-xs text-slate-400">Criada em: {new Date(proposal.date).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Valor Total</p>
                    <p className="text-xl font-bold text-[#181418]">R$ {proposal.total.toLocaleString()}</p>
                  </div>

                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${proposal.status === Status.APPROVED ? 'bg-green-100 text-green-700' :
                    proposal.status === Status.REJECTED ? 'bg-red-100 text-red-700' :
                      'bg-[#c79229]/20 text-[#c79229]'
                    }`}>
                    {proposal.status}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePreview(proposal)}
                      title="Visualizar e Imprimir"
                      className="p-2 text-slate-500 hover:text-[#c79229] border border-slate-200 rounded-lg hover:bg-[#c79229]/10 transition-colors bg-white shadow-sm"
                    >
                      <Printer size={18} />
                    </button>

                    {proposal.status === Status.PENDING ? (
                      <button
                        onClick={() => handleApprove(proposal.id)}
                        title="Aprovar Proposta"
                        className="p-2 text-green-600 hover:text-green-700 border border-green-200 bg-green-50 rounded-lg hover:bg-green-100 transition-colors shadow-sm"
                      >
                        <CheckCircle size={18} />
                      </button>
                    ) : (
                      <div className="w-[36px]"></div>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-500">
                Nenhuma proposta encontrada {filterStatus === Status.APPROVED ? 'nesta categoria' : ''}.
              </div>
            )}
          </div>
        </>
      ) : (
        <CreateProposal
          onCancel={() => navigate('/propostas')}
          onSave={handleSaveProposal}
        />
      )}

      {/* Print Preview Modal Overlay */}
      {previewProposal && (
        <PrintPreviewModal
          proposal={previewProposal}
          onClose={() => setPreviewProposal(null)}
          clients={clients}
        />
      )}
    </div>
  );
};

export default Proposals;

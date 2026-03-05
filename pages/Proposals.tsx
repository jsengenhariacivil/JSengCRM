import React, { useState, useEffect, useRef } from 'react';
import { FileText, Plus, CheckCircle, Trash2, Printer, X, Download, ArrowLeft, Package, Upload, FileSpreadsheet, ChevronDown, ChevronRight, Edit2, LayoutList, Columns } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Status, Proposal, ProposalEtapa, ProposalItem } from '../types';
import * as XLSX from 'xlsx';
import { supabase } from '../supabaseClient';

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

  const proposalBdi = proposal.bdi || 0;
  const calculateSubtotalDisplay = () => {
    if (proposal.etapas && proposal.etapas.length > 0) {
      return proposal.etapas.reduce((sum, etapa) =>
        sum + etapa.items.reduce((etapaSum, item) => etapaSum + (item.quantity * item.unitPrice), 0), 0);
    }
    if (!proposal.items || proposal.items.length === 0) return proposal.total;
    return proposal.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  };
  const calculateTotalDisplay = () => {
    if ((!proposal.items || proposal.items.length === 0) && (!proposal.etapas || proposal.etapas.length === 0)) return proposal.total;
    const subtotal = calculateSubtotalDisplay();
    return subtotal * (1 + (proposalBdi / 100));
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
                <p className="text-[#c79229] font-mono font-bold">#{proposal.id.substring(0, 8).toUpperCase()}</p>
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

            {/* Items / Etapas Table */}
            <div className="mb-8 overflow-x-auto">
              {proposal.etapas && proposal.etapas.length > 0 ? (
                <div className="space-y-6">
                  {proposal.etapas.map((etapa, eIdx) => (
                    <div key={eIdx} className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-[#181418] text-[#c79229] p-3 font-bold uppercase text-sm tracking-wider">
                        {etapa.name}
                      </div>
                      <table className="w-full text-left border-collapse min-w-[500px]">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700">
                            <th className="py-2 px-4 text-xs font-bold uppercase">Item / Serviço</th>
                            <th className="py-2 px-2 text-xs font-bold text-center uppercase w-16">Und.</th>
                            <th className="py-2 px-2 text-xs font-bold text-center uppercase w-20">Qtd.</th>
                            <th className="py-2 px-2 text-xs font-bold text-right uppercase w-28">Unitário</th>
                            <th className="py-2 px-4 text-xs font-bold text-right uppercase w-32">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {etapa.items.map((item, iIdx) => (
                            <tr key={iIdx} className="border-b border-slate-100 even:bg-slate-50 text-sm">
                              <td className="py-3 px-4 text-slate-800">
                                <p className="font-semibold">{item.name}</p>
                                {item.code && <p className="text-[10px] text-slate-500 font-mono mt-0.5">{item.banco} | {item.code}</p>}
                              </td>
                              <td className="py-3 px-2 text-center text-slate-600 font-mono text-xs">{item.unit || 'un'}</td>
                              <td className="py-3 px-2 text-center text-slate-600">{item.quantity}</td>
                              <td className="py-3 px-2 text-right text-slate-600">R$ {item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="py-3 px-4 text-right font-bold text-[#181418]">R$ {(item.quantity * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                          <tr>
                            <td colSpan={4} className="py-3 px-4 text-right text-xs font-bold text-slate-500 uppercase">Subtotal da Etapa:</td>
                            <td className="py-3 px-4 text-right font-black text-[#c79229]">
                              R$ {etapa.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ))}
                </div>
              ) : (
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
                          <td className="py-4 px-2 text-right text-slate-600">R$ {item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="py-4 px-4 text-right font-medium text-[#181418]">R$ {(item.quantity * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                      ))
                    ) : (
                      <tr className="border-b border-slate-100">
                        <td className="py-4 px-4 text-slate-800">
                          <p className="font-bold">Serviços de Engenharia (Pacote Geral)</p>
                        </td>
                        <td className="py-4 px-2 text-center text-slate-600">1</td>
                        <td className="py-4 px-2 text-right text-slate-600">R$ {proposal.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="py-4 px-4 text-right font-medium text-[#181418]">R$ {proposal.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Resumo Financeiro */}
            <div className="flex justify-end mb-20">
              <div className="bg-slate-50 p-6 border-l border-slate-200 w-full lg:w-80 shrink-0">
                <h3 className="font-bold text-slate-800 mb-6 text-lg border-b pb-2">Resumo</h3>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Subtotal (Custo):</span>
                    <span className="font-medium">R$ {calculateSubtotalDisplay().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <div className="flex items-center gap-1">
                      <span>BDI e Encargos:</span>
                      <span className="text-xs bg-[#c79229]/20 text-[#a67922] px-2 py-0.5 rounded-full font-bold">{proposalBdi}%</span>
                    </div>
                    <span className="font-medium">R$ {(calculateTotalDisplay() - calculateSubtotalDisplay()).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between items-center text-[#181418] pt-4 border-t border-slate-200">
                    <span className="font-bold">Total Geral:</span>
                    <span className="font-black text-xl text-[#c79229]">
                      R$ {calculateTotalDisplay().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
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
const CreateProposal = ({ onCancel, onSave, initialData }: { onCancel: () => void, onSave: (proposal: Proposal) => void, initialData?: Proposal }) => {
  const { clients, services, sinapiDatabase } = useData();
  const [selectedClient, setSelectedClient] = useState(initialData?.clientId || '');
  const [validityDate, setValidityDate] = useState(initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [bdi, setBdi] = useState<number>(initialData?.bdi !== undefined ? initialData.bdi : 20);
  const [proposalSinapiState, setProposalSinapiState] = useState('SP');
  const [proposalSinapiDeson, setProposalSinapiDeson] = useState(false);
  const [proposalSinapiType, setProposalSinapiType] = useState('AMBOS');
  const [sinapiResults, setSinapiResults] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [etapas, setEtapas] = useState<any[]>(initialData?.etapas || [
    { id: `etapa_${Date.now()}`, name: "1. SERVIÇOS PRELIMINARES", order: 1, items: [] }
  ]);

  const addEtapa = () => {
    setEtapas(prev => [...prev, {
      id: `etapa_${Date.now()}`,
      name: `${prev.length + 1}. NOVA ETAPA`,
      order: prev.length + 1,
      items: []
    }]);
  };

  const removeEtapa = (etapaId: string) => {
    setEtapas(prev => prev.filter(e => e.id !== etapaId));
  };

  const updateEtapaName = (etapaId: string, newName: string) => {
    setEtapas(prev => prev.map(e => e.id === etapaId ? { ...e, name: newName } : e));
  };

  const addItemToEtapa = (etapaId: string, type: 'COMPOSICAO' | 'INSUMO') => {
    setEtapas(prev => prev.map(e => {
      if (e.id === etapaId) {
        return {
          ...e,
          items: [...e.items, {
            id: `item_${Date.now()}_${Math.random()}`,
            serviceId: '',
            name: '',
            quantity: 1,
            unitPrice: 0,
            unit: 'un',
            type: type,
            banco: 'PROPRIO',
            code: '',
            origin: 'BASE',
            version: 1,
            children: []
          }]
        };
      }
      return e;
    }));
  };

  const removeItemFromEtapa = (etapaId: string, itemId: string) => {
    setEtapas(prev => prev.map(e => {
      if (e.id === etapaId) {
        return { ...e, items: e.items.filter((i: any) => i.id !== itemId) };
      }
      return e;
    }));
  };

  const updateItemInEtapa = (etapaId: string, itemId: string, field: string, value: any) => {
    setEtapas(prev => prev.map(e => {
      if (e.id === etapaId) {
        return {
          ...e,
          items: e.items.map((i: any) => i.id === itemId ? { ...i, [field]: value } : i)
        };
      }
      return e;
    }));
  };

  const handleServiceChange = async (etapaId: string, itemId: string, serviceIdOrName: string) => {
    // 1. Atualizar texto
    updateItemInEtapa(etapaId, itemId, 'name', serviceIdOrName);

    // 2. Procurar em memoria
    const sinapiSrv = sinapiResults.find(s =>
      s.code === serviceIdOrName ||
      s.description === serviceIdOrName ||
      `${s.code} - ${s.description}` === serviceIdOrName
    );

    if (sinapiSrv) {
      setEtapas(prev => prev.map(e => e.id === etapaId ? {
        ...e,
        items: e.items.map((i: any) => i.id === itemId ? {
          ...i,
          serviceId: sinapiSrv.code,
          code: sinapiSrv.code,
          banco: 'SINAPI',
          name: sinapiSrv.description,
          unitPrice: sinapiSrv.price,
          unit: sinapiSrv.unit,
          type: sinapiSrv.type || i.type
        } : i)
      } : e));
      return;
    }

    const service = services.find(s => s.id === serviceIdOrName || s.name === serviceIdOrName);
    if (service) {
      setEtapas(prev => prev.map(e => e.id === etapaId ? {
        ...e,
        items: e.items.map((i: any) => i.id === itemId ? {
          ...i,
          serviceId: service.id,
          code: service.id,
          banco: 'PROPRIO',
          name: service.name,
          unitPrice: service.basePrice,
          unit: service.unit
        } : i)
      } : e));
      return;
    }

    // 3. Busca no supabase
    if (serviceIdOrName.length >= 3) {
      if (proposalSinapiType === 'AMBOS') {
        const [resInsumos, resComp] = await Promise.all([
          supabase.from('sinapi_items')
            .select('*')
            .eq('state', proposalSinapiState)
            .eq('is_desonerated', proposalSinapiDeson)
            .eq('type', 'INSUMO')
            .or(`description.ilike.%${serviceIdOrName}%,code.ilike.%${serviceIdOrName}%`)
            .limit(15),
          supabase.from('sinapi_items')
            .select('*')
            .eq('state', proposalSinapiState)
            .eq('is_desonerated', proposalSinapiDeson)
            .eq('type', 'COMPOSICAO')
            .or(`description.ilike.%${serviceIdOrName}%,code.ilike.%${serviceIdOrName}%`)
            .limit(15)
        ]);

        const combined = [...(resComp.data || []), ...(resInsumos.data || [])];
        setSinapiResults(combined);
      } else {
        const { data } = await supabase.from('sinapi_items')
          .select('*')
          .eq('state', proposalSinapiState)
          .eq('is_desonerated', proposalSinapiDeson)
          .eq('type', proposalSinapiType)
          .or(`description.ilike.%${serviceIdOrName}%,code.ilike.%${serviceIdOrName}%`)
          .limit(25);

        if (data) {
          setSinapiResults(data);
        }
      }
    } else {
      setSinapiResults([]);
    }
  };

  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]);
  };

  const addSubItemToItem = (etapaId: string, itemId: string, type: 'INSUMO' | 'SUBCOMPOSICAO') => {
    setEtapas(prev => prev.map(e => {
      if (e.id === etapaId) {
        return {
          ...e,
          items: e.items.map((i: any) => {
            if (i.id === itemId) {
              return {
                ...i,
                origin: 'PERSONALIZADO',
                children: [...(i.children || []), {
                  id: `subitem_${Date.now()}_${Math.random()}`,
                  serviceId: '',
                  name: '',
                  quantity: 1,
                  unitPrice: 0,
                  unit: 'un',
                  type: type,
                  banco: 'PROPRIO',
                  code: '',
                  origin: 'BASE',
                  version: 1
                }]
              };
            }
            return i;
          })
        };
      }
      return e;
    }));
    if (!expandedItems.includes(itemId)) setExpandedItems(prev => [...prev, itemId]);
  };

  const updateSubItem = (etapaId: string, itemId: string, subItemId: string, field: string, value: any) => {
    setEtapas(prev => prev.map(e => {
      if (e.id === etapaId) {
        return {
          ...e,
          items: e.items.map((i: any) => {
            if (i.id === itemId) {
              return {
                ...i,
                origin: 'PERSONALIZADO',
                children: i.children.map((sub: any) => sub.id === subItemId ? { ...sub, [field]: value } : sub)
              };
            }
            return i;
          })
        };
      }
      return e;
    }));
  };

  const removeSubItem = (etapaId: string, itemId: string, subItemId: string) => {
    setEtapas(prev => prev.map(e => {
      if (e.id === etapaId) {
        return {
          ...e,
          items: e.items.map((i: any) => {
            if (i.id === itemId) {
              return {
                ...i,
                origin: 'PERSONALIZADO',
                children: i.children.filter((sub: any) => sub.id !== subItemId)
              };
            }
            return i;
          })
        };
      }
      return e;
    }));
  };

  const calculateEtapaTotal = (etapa: any) => {
    return etapa.items.reduce((acc: number, item: any) => {
      const childrenTotal = item.children && item.origin === 'PERSONALIZADO' ? item.children.reduce((cAcc: number, c: any) => cAcc + (c.quantity * c.unitPrice), 0) : 0;
      const unitPriceToUse = childrenTotal > 0 ? childrenTotal : item.unitPrice;
      return acc + (item.quantity * unitPriceToUse);
    }, 0);
  };

  const calculateSubtotal = () => {
    return etapas.reduce((acc, etapa) => acc + calculateEtapaTotal(etapa), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal * (1 + (bdi / 100)); // Applying BDI globally
  };

  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteData, setPasteData] = useState('');

  const processExtractedRows = (
    rows: any[][], itemIdx: number, descIdx: number, codeIdx: number,
    bancoIdx: number, unitIdx: number, quantIdx: number, unitPriceIdx: number
  ) => {
    const novasEtapas: ProposalEtapa[] = [];
    let currentEtapa: ProposalEtapa | null = null;
    let itemOrderCounter = 1;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const itemStr = String(row[itemIdx] || '').trim();
      if (!itemStr) continue;

      const description = String(row[descIdx] || '').trim();
      const code = codeIdx !== -1 ? String(row[codeIdx] || '').trim() : '';
      const banco = bancoIdx !== -1 ? String(row[bancoIdx] || '').trim() : 'PROPRIO';
      const unit = unitIdx !== -1 ? String(row[unitIdx] || '').trim() : 'un';

      // Remove points from thousands and change comma to dot before parseFloat
      const parseValue = (val: any) => {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        return parseFloat(String(val).replace(/\./g, '').replace(',', '.'));
      };
      const quant = quantIdx !== -1 ? parseValue(row[quantIdx] || '0') : 0;
      const unitPrice = unitPriceIdx !== -1 ? parseValue(row[unitPriceIdx] || '0') : 0;

      const isEtapa = !itemStr.includes('.');

      if (isEtapa) {
        if (currentEtapa) novasEtapas.push(currentEtapa);
        currentEtapa = {
          id: `etapa_${Date.now()}_${Math.random()}`,
          name: `${itemStr} - ${description}`,
          order: parseInt(itemStr) || novasEtapas.length + 1,
          items: []
        };
        itemOrderCounter = 1;
      } else {
        if (!currentEtapa) {
          currentEtapa = {
            id: `etapa_${Date.now()}_${Math.random()}`,
            name: `Serviços Iniciais`,
            order: novasEtapas.length + 1,
            items: []
          };
        }

        const newItem: ProposalItem = {
          id: `item_${Date.now()}_${Math.random()}`,
          serviceId: '',
          name: description,
          quantity: isNaN(quant) ? 0 : quant,
          unitPrice: isNaN(unitPrice) ? 0 : unitPrice,
          unit: unit,
          type: code ? 'COMPOSICAO' : 'INSUMO', // Default to INSUMO for direct import rows
          banco: banco.toUpperCase() || 'PROPRIO',
          code: code,
          origin: 'BASE',
          version: 1,
          order: itemOrderCounter++
        };

        currentEtapa.items.push(newItem);
      }
    }

    if (currentEtapa) novasEtapas.push(currentEtapa);

    if (novasEtapas.length > 0) {
      setEtapas(prev => [...prev, ...novasEtapas]);
      alert(`Dados importados com sucesso! ${novasEtapas.length} etapa(s) adicionada(s).`);
    } else {
      alert("Nenhum dado válido encontrado para importação.");
    }
  };

  const handlePasteProcess = () => {
    if (!pasteData.trim()) return;

    const lines = pasteData.split('\n');
    const rows = lines.map(line => line.split('\t').map(cell => cell.trim()));

    let headerRowIndex = -1;
    let headers: string[] = [];

    for (let i = 0; i < Math.min(rows.length, 100); i++) {
      const rowStr = rows[i].map(c => c.toLowerCase());

      let matchCount = 0;
      if (rowStr.some(c => c.includes('item') || c === 'it')) matchCount++;
      if (rowStr.some(c => c.includes('cód') || c.includes('cod'))) matchCount++;
      if (rowStr.some(c => c.includes('descri') || c.includes('servi') || c.includes('espec'))) matchCount++;
      if (rowStr.some(c => c.includes('und') || c.includes('unid'))) matchCount++;
      if (rowStr.some(c => c.includes('quant') || c.includes('qtd'))) matchCount++;
      if (rowStr.some(c => c.includes('valor') || c.includes('preço') || c.includes('preco') || c.includes('custo') || c.includes('total'))) matchCount++;

      if (matchCount >= 2) {
        headerRowIndex = i;
        headers = rowStr;
        break;
      }
    }

    if (headerRowIndex === -1) {
      alert("Não foi possível identificar o cabeçalho no texto colado. Copie todas as colunas incluindo 'Item' e 'Descrição'.");
      return;
    }

    const dataRows = rows.slice(headerRowIndex + 1);

    const getColIndex = (names: string[]) => headers.findIndex(h => names.some(n => h.includes(n.toLowerCase())));

    const itemIdx = getColIndex(['item']);
    const codeIdx = getColIndex(['código', 'codigo']);
    const bancoIdx = getColIndex(['banco']);
    const descIdx = getColIndex(['descrição', 'descricao', 'serviço']);
    const unitIdx = getColIndex(['und', 'unidade']);
    const quantIdx = getColIndex(['quant', 'qtd']);
    const unitPriceIdx = getColIndex(['valor unit', 'preço unit', 'valor', 'total']); // fallback to total if unit is absent but unlikely

    if (itemIdx === -1 || descIdx === -1) {
      alert("Faltam colunas obrigatórias ('Item' ou 'Descrição') no que foi colado.");
      return;
    }

    processExtractedRows(dataRows, itemIdx, descIdx, codeIdx, bancoIdx, unitIdx, quantIdx, unitPriceIdx);
    setShowPasteModal(false);
    setPasteData('');
  };

  const handleSaveClick = (isPrint: boolean) => {
    if (!selectedClient) {
      alert('Por favor, selecione um cliente.');
      return;
    }

    if (etapas.length === 0 || etapas.every(e => e.items.length === 0)) {
      alert('Adicione pelo menos um serviço à proposta.');
      return;
    }

    const total = calculateTotal();

    const newProposal: Proposal = {
      id: initialData?.id || Date.now().toString(),
      clientId: selectedClient,
      clientName: clients.find(c => c.id === selectedClient)?.name || '',
      date: new Date().toISOString(),
      status: initialData?.status || Status.PENDING,
      total: total,
      bdi: bdi,
      etapas: etapas.map((e, idx) => ({
        name: e.name,
        order: idx + 1,
        items: e.items.filter((i: any) => i.name.trim() !== '' && i.quantity > 0)
      }))
    };

    onSave(newProposal);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-xl font-bold text-[#181418]">Nova Proposta Comercial (Estrutura Completa)</h2>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">BDI Global (%)</label>
          <input
            type="number"
            value={bdi}
            onChange={(e) => setBdi(parseFloat(e.target.value) || 0)}
            className="w-full font-bold text-[#c79229] border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#c79229] outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Fonte SINAPI (Estado)</label>
          <select
            className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#c79229] outline-none"
            value={proposalSinapiState}
            onChange={(e) => setProposalSinapiState(e.target.value)}
          >
            <option value="BA">Bahia</option>
            <option value="SP">São Paulo</option>
            <option value="SE">Sergipe</option>
            {/* ... simplified for focus */}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Regime SINAPI</label>
          <select
            className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#c79229] outline-none"
            value={proposalSinapiDeson ? 'true' : 'false'}
            onChange={(e) => setProposalSinapiDeson(e.target.value === 'true')}
          >
            <option value="false">Não Desonerado</option>
            <option value="true">Desonerado</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Filtro Visual</label>
          <select
            className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#c79229] outline-none"
            value={proposalSinapiType}
            onChange={(e) => setProposalSinapiType(e.target.value)}
          >
            <option value="AMBOS">Todos (Insumos e Composições)</option>
            <option value="COMPOSICAO">Apenas Composições</option>
            <option value="INSUMO">Apenas Insumos</option>
          </select>
        </div>
      </div>

      {/* ÁREA DE ETAPAS E ITENS */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row bg-[#181418] rounded-t-lg p-4 justify-between items-start sm:items-center gap-4 shadow-lg">
          <button onClick={addEtapa} type="button" className="bg-[#c79229] text-[#181418] font-black px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#a67922] transition-colors uppercase tracking-wider text-sm shadow-md">
            <Plus size={20} /> Adicionar Etapa
          </button>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowPasteModal(true)}
              type="button"
              className="bg-transparent border border-[#c79229] text-[#c79229] font-medium px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#c79229]/10 transition-colors text-sm flex-1 sm:flex-none"
            >
              <FileSpreadsheet size={18} />
              Importar do Excel (Ctrl+C V)
            </button>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-b-lg border border-slate-200 border-t-0 space-y-6">
          {etapas.map((etapa, eIdx) => (
            <div key={etapa.id} className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-sm ring-1 ring-black/5">
              <div className="bg-slate-200/80 p-3 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-300">
                <input
                  value={etapa.name}
                  onChange={e => updateEtapaName(etapa.id, e.target.value)}
                  className="bg-transparent border-b-2 border-transparent focus:border-[#c79229] font-black text-slate-800 text-lg md:w-1/2 outline-none uppercase pb-1"
                  placeholder="NOME DA ETAPA"
                />

                <div className="flex gap-2 shrink-0">
                  <button onClick={() => addItemToEtapa(etapa.id, 'COMPOSICAO')} type="button" className="bg-white border border-slate-300 text-slate-700 px-3 py-1.5 text-sm rounded hover:bg-slate-50 flex items-center gap-1 font-bold shadow-sm">
                    <Plus size={16} className="text-blue-500" /> Composição
                  </button>
                  <button onClick={() => addItemToEtapa(etapa.id, 'INSUMO')} type="button" className="bg-white border border-slate-300 text-slate-700 px-3 py-1.5 text-sm rounded hover:bg-slate-50 flex items-center gap-1 font-bold shadow-sm">
                    <Plus size={16} className="text-orange-500" /> Insumo
                  </button>
                  <button onClick={() => removeEtapa(etapa.id)} type="button" className="text-red-500 hover:text-red-700 ml-4 p-1.5 hover:bg-red-50 rounded">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 border-b text-slate-500 text-xs uppercase tracking-wider font-bold">
                    <tr>
                      <th className="p-3 w-16 text-center">Tipo</th>
                      <th className="p-3 w-32 text-center">Código / Base</th>
                      <th className="p-3 min-w-[300px]">Descrição do Item (Busca SINAPI)</th>
                      <th className="p-3 w-16 text-center">Und.</th>
                      <th className="p-3 w-28 text-center">Qtd.</th>
                      <th className="p-3 w-32 text-right">Valor Unit.</th>
                      <th className="p-3 w-32 text-right">Total (Sem BDI)</th>
                      <th className="p-3 w-12 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {etapa.items.map((item: any, iIdx: number) => {
                      const isExpanded = expandedItems.includes(item.id);
                      const hasChildren = item.children && item.children.length > 0;
                      const isComposicao = item.type === 'COMPOSICAO' || (item.type && item.type.toString().toUpperCase().includes('COMP'));
                      const childrenTotal = hasChildren && item.origin === 'PERSONALIZADO' ? item.children.reduce((sum: number, c: any) => sum + (c.quantity * c.unitPrice), 0) : 0;
                      const displayUnitPrice = childrenTotal > 0 ? childrenTotal : item.unitPrice;
                      const lineTotal = item.quantity * displayUnitPrice;

                      return (
                        <React.Fragment key={item.id}>
                          <tr className="hover:bg-slate-50/80 transition-colors group">
                            <td className="p-3 text-center flex justify-center items-center gap-1">
                              {isComposicao && (
                                <button onClick={() => toggleExpand(item.id)} className="text-slate-400 hover:text-[#c79229]">
                                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </button>
                              )}
                              <span className={`text-[10px] font-black px-2 py-1 rounded-full ${isComposicao ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                {isComposicao ? 'COMP' : 'INS'}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex flex-col items-center">
                                <span className="font-mono font-bold text-slate-700 flex items-center gap-1">
                                  {item.code || '-'}
                                  {item.origin === 'PERSONALIZADO' && <span className="w-2 h-2 rounded-full bg-yellow-400" title="Personalizado"></span>}
                                </span>
                                <span className="text-[10px] uppercase text-slate-400 font-bold">{item.banco} {item.version > 1 ? ` v${item.version}` : ''}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <input
                                  list={`service-options-${etapa.id}-${item.id}`}
                                  placeholder="Buscar no Banco ou digitar novo..."
                                  className="flex-1 p-2.5 border border-slate-200 bg-white hover:border-slate-300 rounded-md focus:border-[#c79229] focus:ring-1 focus:ring-[#c79229] outline-none text-slate-800 transition-all font-medium"
                                  value={item.name}
                                  onChange={(e) => handleServiceChange(etapa.id, item.id, e.target.value)}
                                />
                                {isComposicao && (
                                  <button onClick={() => { toggleExpand(item.id); if (!isExpanded) addSubItemToItem(etapa.id, item.id, 'INSUMO'); }} className="text-slate-400 hover:text-[#c79229] p-2 bg-white border border-slate-200 rounded" title="Editar Composição / Adicionar Insumo">
                                    <Edit2 size={16} />
                                  </button>
                                )}
                              </div>
                              <datalist id={`service-options-${etapa.id}-${item.id}`}>
                                {sinapiResults.map((res: any, idx2: number) => (
                                  <option key={`res-${idx2}`} value={`${res.code} - ${res.description}`} />
                                ))}
                                {services.map(srv => (
                                  <option key={`srv-${srv.id}`} value={srv.name} />
                                ))}
                              </datalist>
                            </td>
                            <td className="p-3 text-center">
                              <input value={item.unit} onChange={e => updateItemInEtapa(etapa.id, item.id, 'unit', e.target.value)} className="w-12 text-center bg-transparent border-b border-dashed border-slate-300 outline-none uppercase text-xs font-bold text-slate-600" />
                            </td>
                            <td className="p-3 text-center">
                              <input type="number" step="0.01" value={item.quantity} onChange={e => updateItemInEtapa(etapa.id, item.id, 'quantity', parseFloat(e.target.value) || 0)} className="w-20 p-2 border border-slate-200 rounded-md text-center bg-white font-medium focus:border-[#c79229] outline-none" />
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <span className="text-xs text-slate-400">R$</span>
                                <input type="number" step="0.01" value={displayUnitPrice} onChange={e => updateItemInEtapa(etapa.id, item.id, 'unitPrice', parseFloat(e.target.value) || 0)} disabled={hasChildren && item.origin === 'PERSONALIZADO'} className={`w-24 p-2 border border-slate-200 rounded-md text-right font-medium outline-none ${hasChildren && item.origin === 'PERSONALIZADO' ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white focus:border-[#c79229]'}`} />
                              </div>
                            </td>
                            <td className="p-3 text-right font-bold text-[#181418]">
                              R$ {lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="p-3 text-center">
                              <button onClick={() => removeItemFromEtapa(etapa.id, item.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1.5 rounded hover:bg-red-50 opacity-0 group-hover:opacity-100">
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                          {isExpanded && item.children && item.children.map((sub: any) => (
                            <tr key={sub.id} className="bg-slate-100/50 border-t border-dashed border-slate-200">
                              <td className="p-2 text-right pr-4"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-4">└ Insumo</span></td>
                              <td className="p-2 text-center"><span className="font-mono text-xs text-slate-500">{sub.code || '-'}</span></td>
                              <td className="p-2 pl-4">
                                <input value={sub.name} onChange={e => updateSubItem(etapa.id, item.id, sub.id, 'name', e.target.value)} className="w-full bg-white border border-slate-200 p-1.5 rounded text-sm outline-none focus:border-[#c79229]" placeholder="Descrição do insumo interno..." />
                              </td>
                              <td className="p-2 text-center"><input value={sub.unit} onChange={e => updateSubItem(etapa.id, item.id, sub.id, 'unit', e.target.value)} className="w-10 text-center bg-transparent border-b border-dashed border-slate-300 text-xs outline-none" /></td>
                              <td className="p-2 text-center"><input type="number" step="0.0000001" value={sub.quantity} onChange={e => updateSubItem(etapa.id, item.id, sub.id, 'quantity', parseFloat(e.target.value) || 0)} className="w-20 text-center bg-white border border-slate-200 p-1 rounded outline-none" /></td>
                              <td className="p-2 text-right"><input type="number" step="0.01" value={sub.unitPrice} onChange={e => updateSubItem(etapa.id, item.id, sub.id, 'unitPrice', parseFloat(e.target.value) || 0)} className="w-20 text-right bg-white border border-slate-200 p-1 rounded outline-none" /></td>
                              <td className="p-2 text-right text-slate-500 text-sm font-medium">R$ {(sub.quantity * sub.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              <td className="p-2 text-center"><button onClick={() => removeSubItem(etapa.id, item.id, sub.id)} className="text-red-300 hover:text-red-500"><X size={14} /></button></td>
                            </tr>
                          ))}
                          {isExpanded && (
                            <tr className="bg-slate-100/50 border-b border-slate-200">
                              <td colSpan={2}></td>
                              <td colSpan={6} className="p-2 pb-4">
                                <button onClick={() => addSubItemToItem(etapa.id, item.id, 'INSUMO')} className="text-xs bg-white border border-slate-300 text-slate-600 px-3 py-1 rounded shadow-sm hover:bg-slate-50 font-bold flex items-center gap-1">+ ADICIONAR INSUMO</button>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                    {etapa.items.length === 0 && (
                      <tr><td colSpan={8} className="p-8 text-center text-slate-400 italic bg-white flex-col flex items-center gap-2"><Package size={32} className="opacity-20" /> Adicione composições ou insumos nesta etapa.</td></tr>
                    )}
                  </tbody>
                  {etapa.items.length > 0 && (
                    <tfoot className="bg-slate-50/50">
                      <tr>
                        <td colSpan={6} className="text-right p-3 text-sm font-bold text-slate-500 uppercase">Subtotal da Etapa</td>
                        <td className="p-3 text-right font-black text-[#c79229] whitespace-nowrap">R$ {calculateEtapaTotal(etapa).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          ))}

          {etapas.length > 0 && (
            <div className="bg-[#181418] rounded-lg p-6 flex flex-col md:flex-row justify-between items-center text-white mt-8 shadow-xl">
              <div className="mb-4 md:mb-0 text-center md:text-left">
                <h3 className="text-slate-400 uppercase text-xs font-bold tracking-widest mb-1">Custo Total Direto (Sem BDI)</h3>
                <div className="text-xl">R$ {calculateSubtotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div className="text-center md:text-right">
                <h3 className="text-[#c79229] uppercase text-xs font-bold tracking-widest mb-1">Total Geral com BDI ({bdi}%)</h3>
                <div className="text-3xl font-black text-white drop-shadow-md">R$ {calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            </div>
          )}
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
          className="px-8 py-3 bg-[#c79229] text-[#181418] rounded-lg hover:bg-[#a67922] shadow-md flex items-center gap-2 font-black transition-colors"
        >
          <CheckCircle size={20} />
          <span>Salvar Orçamento Profissional</span>
        </button>
      </div>

      {showPasteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b bg-slate-50">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                <FileText className="text-[#c79229]" />
                Colar Tabela do Orçamento
              </h2>
              <button onClick={() => setShowPasteModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-slate-600 mb-4">
                Abra sua planilha no Excel, selecione as células do orçamento inteiro (incluindo o cabeçalho 'Item', 'Descrição', etc), copie (<strong>Ctrl+C</strong>) e cole na área abaixo (<strong>Ctrl+V</strong>).
              </p>
              <textarea
                value={pasteData}
                onChange={(e) => setPasteData(e.target.value)}
                placeholder="Cole as células do Excel aqui..."
                className="w-full h-64 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#c79229] focus:outline-none resize-none font-mono text-sm whitespace-pre"
              />
            </div>

            <div className="p-6 bg-slate-50 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowPasteModal(false)}
                className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handlePasteProcess}
                className="px-6 py-2.5 rounded-lg bg-[#181418] text-white hover:bg-black transition-colors font-medium flex items-center gap-2"
              >
                <CheckCircle size={18} />
                Processar e Importar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const Proposals: React.FC<ProposalsProps> = ({ viewMode = 'list', filterStatus }) => {
  const navigate = useNavigate();
  const { proposals, addProposal, updateProposal, deleteProposal, updateProposalStatus, clients } = useData();
  const [isCreating, setIsCreating] = useState(viewMode === 'create');
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [previewProposal, setPreviewProposal] = useState<Proposal | null>(null);
  const [displayMode, setDisplayMode] = useState<'list' | 'kanban'>('kanban');

  useEffect(() => {
    setIsCreating(viewMode === 'create');
    if (viewMode !== 'create') setEditingProposal(null);
  }, [viewMode]);

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, proposalId: string) => {
    e.dataTransfer.setData('proposalId', proposalId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: Status) => {
    e.preventDefault();
    const proposalId = e.dataTransfer.getData('proposalId');
    if (proposalId) {
      const proposal = proposals.find(p => p.id === proposalId);
      if (proposal && proposal.status !== newStatus) {
        await updateProposalStatus(proposalId, newStatus);
      }
    }
  };

  const handleCreateNew = () => {
    setEditingProposal(null);
    setIsCreating(true);
    navigate('/propostas/nova');
  };

  const handleEdit = (proposal: Proposal) => {
    setEditingProposal(proposal);
    setIsCreating(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Atenção! Tem certeza de que deseja EXCLUIR esta proposta? Esta ação não pode ser desfeita.")) {
      await deleteProposal(id);
    }
  };

  const handleSaveProposal = async (savedProposal: Proposal) => {
    if (editingProposal) {
      await updateProposal(savedProposal);
    } else {
      await addProposal(savedProposal);
    }
    setIsCreating(false);
    setEditingProposal(null);
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
            <div className="flex items-center gap-3">
              {!filterStatus && (
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button onClick={() => setDisplayMode('list')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${displayMode === 'list' ? 'bg-white shadow-sm text-[#c79229]' : 'text-slate-500 hover:text-slate-700'}`}>
                    <LayoutList size={16} /> <span className="hidden sm:inline">Lista</span>
                  </button>
                  <button onClick={() => setDisplayMode('kanban')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${displayMode === 'kanban' ? 'bg-white shadow-sm text-[#c79229]' : 'text-slate-500 hover:text-slate-700'}`}>
                    <Columns size={16} /> <span className="hidden sm:inline">Kanban</span>
                  </button>
                </div>
              )}
              <button
                onClick={handleCreateNew}
                className="flex items-center space-x-2 px-4 py-2 bg-[#c79229] text-[#181418] font-bold rounded-lg hover:bg-[#a67922] shadow-sm transition-colors"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Nova Proposta</span>
                <span className="sm:hidden">Novo</span>
              </button>
            </div>
          </div>

          {!filterStatus && displayMode === 'kanban' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start h-[calc(100vh-250px)] min-h-[500px]">
              {/* Em Negociação (Pendente) */}
              <div
                className="bg-slate-50 rounded-xl border border-slate-200 flex flex-col h-full overflow-hidden shadow-sm"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, Status.PENDING)}
              >
                <div className="p-4 border-b border-slate-200 bg-white shadow-sm z-10 sticky top-0 flex items-center justify-between">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#c79229]"></span> Em Negociação
                  </h3>
                  <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded-full">{proposals.filter(p => p.status === Status.PENDING).length}</span>
                </div>
                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                  {proposals.filter(p => p.status === Status.PENDING).map(proposal => (
                    <div
                      key={proposal.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, proposal.id)}
                      className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-[#c79229] transition-colors relative group"
                    >
                      <h4 className="font-bold text-[#181418] text-sm mb-1">#{proposal.id.padStart(4, '0')} - {proposal.clientName}</h4>
                      <p className="text-xs text-slate-500 mb-3">{new Date(proposal.date).toLocaleDateString()}</p>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                        <span className="font-bold text-[#c79229]">R$ {proposal.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                          <button onClick={(e) => { e.stopPropagation(); handlePreview(proposal); }} className="p-1.5 text-slate-400 hover:text-[#c79229] hover:bg-[#c79229]/10 rounded"><Printer size={14} /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleEdit(proposal); }} className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {proposals.filter(p => p.status === Status.PENDING).length === 0 && (
                    <div className="text-center p-4 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm">Arraste propostas para cá</div>
                  )}
                </div>
              </div>

              {/* Aprovadas */}
              <div
                className="bg-green-50/50 rounded-xl border border-green-100 flex flex-col h-full overflow-hidden shadow-sm"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, Status.APPROVED)}
              >
                <div className="p-4 border-b border-green-100 bg-white/80 backdrop-blur-sm shadow-sm z-10 sticky top-0 flex items-center justify-between">
                  <h3 className="font-bold text-green-700 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Aprovadas / Ganhas
                  </h3>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">{proposals.filter(p => p.status === Status.APPROVED).length}</span>
                </div>
                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                  {proposals.filter(p => p.status === Status.APPROVED).map(proposal => (
                    <div
                      key={proposal.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, proposal.id)}
                      className="bg-white p-4 rounded-lg border border-green-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-green-400 transition-colors relative group"
                    >
                      <h4 className="font-bold text-[#181418] text-sm mb-1">#{proposal.id.padStart(4, '0')} - {proposal.clientName}</h4>
                      <p className="text-xs text-slate-500 mb-3">{new Date(proposal.date).toLocaleDateString()}</p>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                        <span className="font-bold text-green-600">R$ {proposal.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                          <button onClick={(e) => { e.stopPropagation(); handlePreview(proposal); }} className="p-1.5 text-slate-400 hover:text-[#c79229] hover:bg-[#c79229]/10 rounded"><Printer size={14} /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleEdit(proposal); }} className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {proposals.filter(p => p.status === Status.APPROVED).length === 0 && (
                    <div className="text-center p-4 border-2 border-dashed border-green-200 rounded-lg text-green-400/70 text-sm">Nenhuma proposta aprovada</div>
                  )}
                </div>
              </div>

              {/* Reprovadas */}
              <div
                className="bg-red-50/50 rounded-xl border border-red-100 flex flex-col h-full overflow-hidden shadow-sm"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, Status.REJECTED)}
              >
                <div className="p-4 border-b border-red-100 bg-white/80 backdrop-blur-sm shadow-sm z-10 sticky top-0 flex items-center justify-between">
                  <h3 className="font-bold text-red-700 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Perdidas / Canceladas
                  </h3>
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">{proposals.filter(p => p.status === Status.REJECTED).length}</span>
                </div>
                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                  {proposals.filter(p => p.status === Status.REJECTED).map(proposal => (
                    <div
                      key={proposal.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, proposal.id)}
                      className="bg-white p-4 rounded-lg border border-red-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-red-400 transition-colors relative group opacity-75 hover:opacity-100"
                    >
                      <h4 className="font-bold text-[#181418] text-sm line-through decoration-red-300 mb-1">#{proposal.id.padStart(4, '0')} - {proposal.clientName}</h4>
                      <p className="text-xs text-slate-500 mb-3">{new Date(proposal.date).toLocaleDateString()}</p>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                        <span className="font-bold text-slate-400">R$ {proposal.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(proposal.id, e); }} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {proposals.filter(p => p.status === Status.REJECTED).length === 0 && (
                    <div className="text-center p-4 border-2 border-dashed border-red-200 rounded-lg text-red-300 text-sm">Arraste propostas perdidas para cá</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
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

                      <button
                        onClick={() => handleEdit(proposal)}
                        title="Editar Proposta"
                        className="p-2 text-blue-500 hover:text-blue-700 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
                      >
                        <Edit2 size={18} />
                      </button>

                      <button
                        onClick={(e) => handleDelete(proposal.id, e)}
                        title="Excluir Proposta"
                        className="p-2 text-red-500 hover:text-red-700 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors shadow-sm"
                      >
                        <Trash2 size={18} />
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
          )}
        </>
      ) : (
        <CreateProposal
          initialData={editingProposal || undefined}
          onCancel={() => { setIsCreating(false); setEditingProposal(null); navigate('/propostas'); }}
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

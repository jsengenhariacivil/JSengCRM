import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import { supabase } from '../supabaseClient';

export interface SinapiProcessStatus {
    status: 'idle' | 'extracting' | 'parsing' | 'uploading' | 'done' | 'error';
    progress: number; // 0 a 100
    message: string;
}

export const processSinapiZip = async (
    file: File,
    state: string,
    isDesonerated: boolean,
    onProgress: (status: SinapiProcessStatus) => void
) => {
    try {
        onProgress({ status: 'extracting', progress: 5, message: 'Extraindo ZIP...' });

        const zip = await JSZip.loadAsync(file);
        const files = Object.values(zip.files);

        // Procura os arquivos de insumos e composições (Apenas Sintético)
        const insumosFile = files.find(f => f.name.toLowerCase().includes('insumos') && (f.name.endsWith('.xls') || f.name.endsWith('.xlsx')));
        const composicoesFile = files.find(f =>
            (f.name.toLowerCase().includes('composicoes') || f.name.toLowerCase().includes('composições')) &&
            f.name.toLowerCase().includes('sintetico') &&
            (f.name.endsWith('.xls') || f.name.endsWith('.xlsx'))
        );

        if (!insumosFile || !composicoesFile) {
            throw new Error("Não foi possível encontrar as planilhas de Insumos e Composições dentro do ZIP.");
        }

        onProgress({ status: 'parsing', progress: 20, message: 'Lendo Insumos...' });
        const insumosBuffer = await insumosFile.async('arraybuffer');
        const insumosWb = XLSX.read(insumosBuffer, { type: 'array' });
        const insumosSheetName = insumosWb.SheetNames[0];
        const insumosData = XLSX.utils.sheet_to_json(insumosWb.Sheets[insumosSheetName], { header: 1 });

        onProgress({ status: 'parsing', progress: 40, message: 'Lendo Composições...' });
        const composicoesBuffer = await composicoesFile.async('arraybuffer');
        const composicoesWb = XLSX.read(composicoesBuffer, { type: 'array' });
        const composicoesSheetName = composicoesWb.SheetNames[0];
        const composicoesData = XLSX.utils.sheet_to_json(composicoesWb.Sheets[composicoesSheetName], { header: 1 });

        const itemsToInsert: any[] = [];

        // A Caixa adora adicionar colunas em branco no começo ou mesclar células
        // Vamos varrer a linha inteira para achar o que parece um código e o que parece um preço
        const parseSinapiData = (data: any[], type: 'INSUMO' | 'COMPOSICAO') => {
            let readingData = false;

            for (let i = 0; i < data.length; i++) {
                const row = data[i] as any[];
                if (!row || row.length < 3) continue;

                // Converte a linha inteira para strings trimadas, removendo nulos e undefined
                const cleanRow = row.map(v => v !== null && v !== undefined ? String(v).trim() : '');

                // Pula linhas inteiramente vazias
                if (cleanRow.every(v => v === '')) continue;

                // Tenta detectar se o cabeçalho acabou e os dados começaram 
                // Códigos SINAPI variam: Insumos (apenas números), Composições (podem ter números e letras, ex: "87310 CH" ou "87310")
                const isDataRow = cleanRow.some(cell => /^[0-9]{5,7}(\s+[A-Za-z]+)?$/.test(cell) || /^(?:\d+\.)+\d+/.test(cell));
                if (!readingData && isDataRow) readingData = true;

                if (!readingData) continue;

                // 1. Extrair Código: O primeiro elemento que pareça com 5 a 7 números exatos, podendo ter Sufixo de Composição
                const codeIndex = cleanRow.findIndex(cell => /^[0-9]{5,7}(\s+[A-Za-z]+)?$/.test(cell));
                if (codeIndex === -1) continue;
                const code = cleanRow[codeIndex];

                // 2. Extrair Descrição: Geralmente é o próximo campo de texto longo após o código
                let desc = '';
                let descIndex = -1;
                for (let j = codeIndex + 1; j < cleanRow.length; j++) {
                    if (cleanRow[j].length > 5) {
                        desc = cleanRow[j];
                        descIndex = j;
                        break;
                    }
                }

                // 3. Extrair Unidade: Geralmente após a descrição possui 1 a 4 letras (UN, M2, KG, L, MES, H, H)
                let unit = 'UN';
                for (let j = descIndex + 1; j < cleanRow.length; j++) {
                    if (/^[a-zA-Z²³\/]{1,6}$/.test(cleanRow[j])) {
                        unit = cleanRow[j].toUpperCase();
                        break;
                    }
                }

                // 4. Extrair Preço: O último número (ou penúltimo em origens atípicas) da direita pra esquerda que seja parseável
                let price = 0;
                for (let j = cleanRow.length - 1; j > descIndex; j--) {
                    // Valor brasileiro vem com vírgula ou já convertido pra float pelo sheet_to_json
                    const possibleVal = cleanRow[j].replace(/\./g, '').replace(',', '.');
                    const parsed = parseFloat(possibleVal);
                    if (!isNaN(parsed) && parsed > 0) {
                        price = parsed;
                        break;
                    }
                }

                if (!code || !desc || price === 0) continue;

                itemsToInsert.push({
                    state: state,
                    type: type,
                    code: code,
                    description: desc,
                    unit: unit,
                    price: price,
                    is_desonerated: isDesonerated,
                });
            }
        };

        onProgress({ status: 'parsing', progress: 50, message: 'Processando Insumos...' });
        parseSinapiData(insumosData, 'INSUMO');

        onProgress({ status: 'parsing', progress: 60, message: 'Processando Composições...' });
        parseSinapiData(composicoesData, 'COMPOSICAO');

        if (itemsToInsert.length === 0) {
            throw new Error("Nenhum dado válido encontrado nas planilhas.");
        }

        onProgress({ status: 'uploading', progress: 70, message: `Preparando envio de ${itemsToInsert.length} itens...` });

        // 1. Delete old data for this state and desoneration to prevent duplicates
        await supabase.from('sinapi_items')
            .delete()
            .eq('state', state)
            .eq('is_desonerated', isDesonerated);

        // 2. Insert in chunks of 500
        const chunkSize = 500;
        for (let i = 0; i < itemsToInsert.length; i += chunkSize) {
            const chunk = itemsToInsert.slice(i, i + chunkSize);
            const { error } = await supabase.from('sinapi_items').insert(chunk);
            if (error) {
                throw new Error(`Erro ao salvar no banco (lote ${i}): ${error.message}`);
            }

            const pct = 70 + Math.round(((i + chunkSize) / itemsToInsert.length) * 30);
            onProgress({ status: 'uploading', progress: Math.min(pct, 99), message: `Enviando ${i + chunk.length} de ${itemsToInsert.length}...` });
        }

        onProgress({ status: 'done', progress: 100, message: 'Base SINAPI atualizada com sucesso!' });

    } catch (error: any) {
        console.error("SINAPI parser error: ", error);
        onProgress({ status: 'error', progress: 0, message: error.message || 'Erro desconhecido ao processar' });
    }
};

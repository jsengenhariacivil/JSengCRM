export type CsvRow = {
  Etapa: string;
  Subetapa: string;
  Peso: number;
  DataInicio: string;
  DataFim: string;
};

export function downloadCsvTemplate() {
  const headers = ['Etapa', 'Subetapa', 'Peso %', 'Data InÃ­cio (YYYY-MM-DD)', 'Data Fim (YYYY-MM-DD)'];
  const rows = [
    ['ServiÃ§os Preliminares', '', '5', '2026-06-20', '2026-06-25'],
    ['ServiÃ§os Preliminares', 'Limpeza', '40', '', ''],
    ['ServiÃ§os Preliminares', 'InstalaÃ§Ãµes ProvisÃ³rias', '60', '', ''],
    ['FundaÃ§Ã£o', '', '10', '2026-06-26', '2026-07-10'],
    ['FundaÃ§Ã£o', 'EscavaÃ§Ã£o', '50', '', ''],
    ['FundaÃ§Ã£o', 'Concretagem', '50', '', ''],
  ];

  const csvContent = [
    headers.join(';'),
    ...rows.map(r => r.join(';'))
  ].join('\n');

  // Adicionando BOM (\uFEFF) para garantir que o Excel reconheÃ§a acentos (UTF-8)
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'modelo_cronograma.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseCsvContent(csvText: string): CsvRow[] {
  const lines = csvText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length <= 1) return [];

  // Pula o cabeÃ§alho
  const dataLines = lines.slice(1);
  const parsed: CsvRow[] = [];

  for (const line of dataLines) {
    // Para ser flexÃ­vel, verificamos se tem ponto e vÃ­rgula, se nÃ£o tiver, assumimos vÃ­rgula
    const separator = line.includes(';') ? ';' : ',';
    const cols = line.split(separator).map(c => c.trim());
    if (cols.length >= 3) {
      parsed.push({
        Etapa: cols[0] || '',
        Subetapa: cols[1] || '',
        Peso: parseFloat(cols[2].replace(',', '.')) || 0, // Aceita vÃ­rgula no peso decimal
        DataInicio: cols[3] || '',
        DataFim: cols[4] || ''
      });
    }
  }

  return parsed;
}


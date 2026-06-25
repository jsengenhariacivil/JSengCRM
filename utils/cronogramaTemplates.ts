export type TemplateStage = {
  name: string;
  weight: number; // Porcentagem do peso total da obra
  subStages: {
    name: string;
    weight: number; // Porcentagem de peso dentro da Etapa
  }[];
};

export const cronogramaTemplates: Record<string, TemplateStage[]> = {
  'Alvenaria': [
    {
      name: 'ServiÃ§os Preliminares',
      weight: 5,
      subStages: [
        { name: 'Limpeza do terreno', weight: 30 },
        { name: 'LocaÃ§Ã£o da obra', weight: 40 },
        { name: 'InstalaÃ§Ãµes provisÃ³rias', weight: 30 }
      ]
    },
    {
      name: 'Infraestrutura (FundaÃ§Ã£o)',
      weight: 10,
      subStages: [
        { name: 'EscavaÃ§Ã£o', weight: 20 },
        { name: 'Baldrame e Blocos', weight: 60 },
        { name: 'ImpermeabilizaÃ§Ã£o', weight: 20 }
      ]
    },
    {
      name: 'Superestrutura',
      weight: 20,
      subStages: [
        { name: 'Pilares', weight: 40 },
        { name: 'Vigas', weight: 30 },
        { name: 'Laje', weight: 30 }
      ]
    },
    {
      name: 'Alvenaria e VedaÃ§Ã£o',
      weight: 15,
      subStages: [
        { name: 'ElevaÃ§Ã£o de Paredes', weight: 80 },
        { name: 'Chapisco', weight: 20 }
      ]
    },
    {
      name: 'Cobertura',
      weight: 10,
      subStages: [
        { name: 'Estrutura do Telhado', weight: 50 },
        { name: 'Telhamento', weight: 40 },
        { name: 'Calhas e Rufos', weight: 10 }
      ]
    },
    {
      name: 'InstalaÃ§Ãµes',
      weight: 15,
      subStages: [
        { name: 'ElÃ©trica', weight: 40 },
        { name: 'HidrÃ¡ulica', weight: 40 },
        { name: 'Esgoto e GÃ¡s', weight: 20 }
      ]
    },
    {
      name: 'Acabamentos',
      weight: 20,
      subStages: [
        { name: 'Reboco / Gesso', weight: 30 },
        { name: 'Pisos e Revestimentos', weight: 40 },
        { name: 'Esquadrias e Vidros', weight: 15 },
        { name: 'Pintura', weight: 15 }
      ]
    },
    {
      name: 'ServiÃ§os Finais',
      weight: 5,
      subStages: [
        { name: 'LouÃ§as e Metais', weight: 50 },
        { name: 'Limpeza Fina', weight: 30 },
        { name: 'Entrega', weight: 20 }
      ]
    }
  ],

  'Light Steel Frame': [
    {
      name: 'ServiÃ§os Preliminares',
      weight: 5,
      subStages: [
        { name: 'Limpeza e LocaÃ§Ã£o', weight: 50 },
        { name: 'InstalaÃ§Ãµes ProvisÃ³rias', weight: 50 }
      ]
    },
    {
      name: 'FundaÃ§Ã£o (Radier)',
      weight: 10,
      subStages: [
        { name: 'Preparo da Base', weight: 30 },
        { name: 'ArmaÃ§Ã£o e TubulaÃ§Ãµes', weight: 40 },
        { name: 'Concretagem', weight: 30 }
      ]
    },
    {
      name: 'Montagem da Estrutura',
      weight: 25,
      subStages: [
        { name: 'Paredes (PainÃ©is)', weight: 50 },
        { name: 'Entrepiso / Laje', weight: 25 },
        { name: 'Estrutura de Cobertura', weight: 25 }
      ]
    },
    {
      name: 'Fechamento Externo',
      weight: 15,
      subStages: [
        { name: 'Placas OSB', weight: 40 },
        { name: 'Membrana HidrÃ³fuga', weight: 20 },
        { name: 'Revestimento Siding / Placa CimentÃ­cia', weight: 40 }
      ]
    },
    {
      name: 'Cobertura',
      weight: 5,
      subStages: [
        { name: 'Telhas', weight: 70 },
        { name: 'Calhas e Rufos', weight: 30 }
      ]
    },
    {
      name: 'InstalaÃ§Ãµes e Isolamento',
      weight: 15,
      subStages: [
        { name: 'ElÃ©trica e HidrÃ¡ulica (Passagem)', weight: 60 },
        { name: 'Isolamento TermoacÃºstico', weight: 40 }
      ]
    },
    {
      name: 'Fechamento Interno e Acabamento',
      weight: 20,
      subStages: [
        { name: 'Placas de Drywall', weight: 40 },
        { name: 'Tratamento de Juntas', weight: 20 },
        { name: 'Pintura', weight: 20 },
        { name: 'Pisos e Esquadrias', weight: 20 }
      ]
    },
    {
      name: 'ServiÃ§os Finais',
      weight: 5,
      subStages: [
        { name: 'LouÃ§as e Metais', weight: 50 },
        { name: 'Limpeza', weight: 50 }
      ]
    }
  ],

  'Madeira': [
    {
      name: 'ServiÃ§os Preliminares',
      weight: 5,
      subStages: [
        { name: 'Limpeza e LocaÃ§Ã£o', weight: 100 }
      ]
    },
    {
      name: 'FundaÃ§Ã£o',
      weight: 10,
      subStages: [
        { name: 'Sapatas / Estacas', weight: 100 }
      ]
    },
    {
      name: 'Estrutura de Madeira',
      weight: 40,
      subStages: [
        { name: 'Pilares e Vigas', weight: 50 },
        { name: 'Paredes', weight: 30 },
        { name: 'Estrutura do Telhado', weight: 20 }
      ]
    },
    {
      name: 'InstalaÃ§Ãµes',
      weight: 15,
      subStages: [
        { name: 'ElÃ©trica e HidrÃ¡ulica', weight: 100 }
      ]
    },
    {
      name: 'Cobertura',
      weight: 10,
      subStages: [
        { name: 'Telhamento', weight: 100 }
      ]
    },
    {
      name: 'Acabamentos e ProteÃ§Ã£o',
      weight: 15,
      subStages: [
        { name: 'Tratamento da Madeira (Verniz/Stain)', weight: 40 },
        { name: 'Pisos', weight: 30 },
        { name: 'Esquadrias', weight: 30 }
      ]
    },
    {
      name: 'ServiÃ§os Finais',
      weight: 5,
      subStages: [
        { name: 'Limpeza e Entrega', weight: 100 }
      ]
    }
  ],

  'PrÃ©-moldado': [
    {
      name: 'ServiÃ§os Preliminares',
      weight: 5,
      subStages: [{ name: 'Limpeza e LocaÃ§Ã£o', weight: 100 }]
    },
    {
      name: 'FundaÃ§Ã£o (CÃ¡lices)',
      weight: 15,
      subStages: [{ name: 'EscavaÃ§Ã£o e Concretagem', weight: 100 }]
    },
    {
      name: 'Montagem de Estrutura PrÃ©-Moldada',
      weight: 40,
      subStages: [
        { name: 'Pilares', weight: 30 },
        { name: 'Vigas', weight: 30 },
        { name: 'Lajes Alveolares', weight: 40 }
      ]
    },
    {
      name: 'Fechamento e Cobertura',
      weight: 15,
      subStages: [
        { name: 'PainÃ©is de Fechamento', weight: 50 },
        { name: 'Cobertura MetÃ¡lica/Telhas', weight: 50 }
      ]
    },
    {
      name: 'InstalaÃ§Ãµes e Acabamentos',
      weight: 20,
      subStages: [
        { name: 'InstalaÃ§Ãµes Gerais', weight: 50 },
        { name: 'Piso Industrial / Acabamentos', weight: 50 }
      ]
    },
    {
      name: 'ServiÃ§os Finais',
      weight: 5,
      subStages: [{ name: 'Limpeza e Entrega', weight: 100 }]
    }
  ]
};


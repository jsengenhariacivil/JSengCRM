# Guia de Deploy na Vercel - JSengCRM

Este guia explica como fazer o deploy do JSengCRM na plataforma Vercel.

## Pré-requisitos

- Conta na [Vercel](https://vercel.com)
- Repositório Git (GitHub, GitLab ou Bitbucket)
- Projeto Supabase configurado

## Passo a Passo

### 1. Preparar o Repositório

Certifique-se de que todas as alterações estão commitadas:

```bash
git add .
git commit -m "Preparar para deploy na Vercel"
git push origin main
```

### 2. Importar Projeto na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **"Add New Project"**
3. Selecione seu repositório Git
4. Configure as seguintes opções:

   - **Framework Preset**: Vite
   - **Root Directory**: `JSengCRM` (importante!)
   - **Build Command**: `npm run build` (já configurado)
   - **Output Directory**: `dist` (já configurado)

### 3. Configurar Variáveis de Ambiente

Na seção **Environment Variables**, adicione:

| Nome | Valor | Onde Encontrar |
|------|-------|----------------|
| `VITE_SUPABASE_URL` | URL do seu projeto Supabase | [Supabase Dashboard](https://app.supabase.com) → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Chave anônima do Supabase | [Supabase Dashboard](https://app.supabase.com) → Project Settings → API |
| `GEMINI_API_KEY` | Sua chave da API Gemini (opcional) | [Google AI Studio](https://aistudio.google.com/app/apikey) |

> **Dica**: Você pode copiar os valores do arquivo `.env.local` local.

### 4. Deploy

1. Clique em **"Deploy"**
2. Aguarde o build completar (geralmente 1-2 minutos)
3. Acesse a URL fornecida pela Vercel

## Configurações Adicionais

### Domínio Personalizado

1. Vá em **Settings** → **Domains**
2. Adicione seu domínio personalizado
3. Configure os registros DNS conforme instruído

### Atualizações Automáticas

Cada push para a branch `main` irá automaticamente:
- Fazer build do projeto
- Executar deploy
- Atualizar a URL de produção

### Preview Deployments

Cada Pull Request criará automaticamente um deploy de preview com URL única para testes.

## Verificação Pós-Deploy

Após o deploy, verifique:

- [ ] Login funciona corretamente
- [ ] Conexão com Supabase está ativa
- [ ] Todas as páginas carregam sem erros
- [ ] Navegação entre rotas funciona
- [ ] Dados são salvos e carregados corretamente

## Troubleshooting

### Erro 404 ao navegar entre páginas

**Problema**: Rotas retornam 404 ao recarregar a página.

**Solução**: Verifique se o arquivo `vercel.json` está presente e configurado corretamente com os rewrites.

### Variáveis de ambiente não funcionam

**Problema**: `import.meta.env.VITE_*` retorna `undefined`.

**Solução**: 
1. Verifique se as variáveis começam com `VITE_`
2. Confirme que foram adicionadas no painel da Vercel
3. Faça um novo deploy após adicionar as variáveis

### Erro de build

**Problema**: Build falha com erros TypeScript.

**Solução**: Execute localmente antes de fazer push:
```bash
npm run type-check
npm run build
```

### Supabase não conecta

**Problema**: Erros de autenticação ou conexão com Supabase.

**Solução**:
1. Verifique se as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão corretas
2. Confirme que o projeto Supabase está ativo
3. Verifique as configurações de CORS no Supabase (adicione o domínio da Vercel)

## Comandos Úteis

### Build Local
```bash
npm run build
```

### Preview Local do Build
```bash
npm run preview
```

### Verificar Tipos TypeScript
```bash
npm run type-check
```

### Instalar Vercel CLI (opcional)
```bash
npm i -g vercel
vercel login
vercel --prod
```

## Recursos

- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Vite](https://vitejs.dev/guide/)
- [Documentação Supabase](https://supabase.com/docs)
- [Suporte Vercel](https://vercel.com/support)

## Notas Importantes

- O arquivo `.env.local` **não** é commitado (está no `.gitignore`)
- Todas as variáveis de ambiente devem ser configuradas no painel da Vercel
- O build de produção é otimizado automaticamente pelo Vite
- Assets são automaticamente cacheados com headers otimizados (configurado em `vercel.json`)

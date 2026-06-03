<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# FinOps Maturity Evaluator

**Avalie a maturidade de Governança de TI e FinOps da sua empresa com questionário estruturado e relatórios gerados por IA.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-2.5-4285F4?logo=google&logoColor=white)](https://ai.google.dev)

</div>

---

## 📋 Sobre o Projeto

O **FinOps Maturity Evaluator** é uma aplicação web que permite avaliar o nível de maturidade de uma empresa em práticas de **FinOps** (Financial Operations) e **Governança de TI**. A ferramenta guia o usuário por um fluxo em 3 etapas e, ao final, gera um relatório de diagnóstico completo utilizando a **API do Google Gemini**.

O relatório gerado é baseado em frameworks reconhecidos como **COBIT 2019**, **ITIL 4**, **ISO/IEC 27001** e **ISO 27005**, fornecendo análises profissionais sobre o ambiente de TI avaliado.

---

## ✨ Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| **Cadastro da Empresa** | Coleta informações básicas: nome, setor de atuação e porte da empresa |
| **Questionário de Maturidade** | 15 perguntas organizadas em 5 categorias, com escala de 1 a 5 |
| **Score de Maturidade** | Cálculo automático com classificação em 3 níveis (Iniciante, Intermediário, Avançado) |
| **Relatório por IA** | Diagnóstico completo gerado pelo Google Gemini com mapeamento COBIT, análise de riscos ISO 27005 e plano de ação |
| **Exportação em PDF** | Download do relatório em formato PDF |
| **Interface Responsiva** | Design moderno com animações e transições suaves |

---

## 🏗️ Categorias Avaliadas

O questionário cobre **5 dimensões** de maturidade:

1. **Cultura FinOps** — Existência de equipe dedicada, participação de stakeholders, consciência financeira
2. **Visibilidade & Dados** — Alocação de custos, visibilidade em tempo real, catalogação de ativos
3. **Otimização & Eficiência** — Revisão de recursos ociosos, instâncias reservadas, automação
4. **Governança & Compliance** — Processos de aprovação, controles de segurança, continuidade de negócios
5. **Planejamento & Estratégia** — Roadmap de modernização, integração de sistemas legados, economia unitária

---

## 🛠️ Tecnologias

- **Frontend:** React 19 + TypeScript
- **Build Tool:** Vite 6
- **Estilização:** Tailwind CSS 4 + shadcn/ui
- **Animações:** Motion (Framer Motion)
- **IA:** Google Gemini API (`gemini-2.5-flash`)
- **PDF:** jsPDF
- **Backend/DB:** Firebase (Firestore) — autenticação e persistência
- **Ícones:** Lucide React

---

## 🚀 Como Usar

### Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **Chave de API do Google Gemini** — obtenha em [Google AI Studio](https://aistudio.google.com/apikey)

### Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/FinOps.git
   cd FinOps
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure a chave da API Gemini:**

   Crie um arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:
   ```env
   VITE_GEMINI_API_KEY=sua_chave_aqui
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acesse no navegador:**
   ```
   http://localhost:3000
   ```

---

## 📖 Fluxo de Uso

```
┌─────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│  PASSO 1        │     │  PASSO 2            │     │  PASSO 3            │
│  Cadastro da    │────▶│  Questionário de    │────▶│  Resultado +        │
│  Empresa        │     │  Maturidade (15 Q)  │     │  Relatório IA       │
└─────────────────┘     └─────────────────────┘     └─────────────────────┘
  Nome, Setor,            Escala 1-5 por           Score, Nível COBIT,
  Porte                   categoria                 PDF exportável
```

1. **Passo 1 — Cadastro:** Informe o nome da empresa, setor de atuação e porte (Pequena, Média, Grande ou Corporativa).
2. **Passo 2 — Questionário:** Responda 15 perguntas sobre práticas de FinOps e Governança de TI, pontuando de 1 (Discordo) a 5 (Concordo).
3. **Passo 3 — Resultado:** Visualize o score de maturidade e gere o relatório detalhado com análises, riscos e recomendações. Exporte o resultado em PDF.

---

## 📁 Estrutura do Projeto

```
FinOps/
├── index.html                  # Ponto de entrada HTML
├── package.json                # Dependências e scripts
├── vite.config.ts              # Configuração do Vite
├── tsconfig.json               # Configuração TypeScript
├── vercel.json                 # Configuração de deploy (Vercel)
├── firestore.rules             # Regras de segurança do Firestore
├── components/                 # Componentes de UI (shadcn/ui)
│   └── ui/                     # Button, Card, Input, Select, etc.
├── lib/                        # Utilitários (cn, etc.)
└── src/
    ├── main.tsx                # Bootstrap da aplicação React
    ├── App.tsx                 # Componente principal (fluxo de 3 etapas)
    ├── index.css               # Estilos globais
    ├── firebase.ts             # Configuração do Firebase
    ├── constants/
    │   └── questions.ts        # Perguntas do questionário + campos de diagnóstico
    ├── contexts/
    │   └── AuthContext.tsx      # Contexto de autenticação
    └── services/
        └── geminiService.ts    # Integração com a API do Google Gemini
```

---

## 📜 Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento na porta 3000 |
| `npm run build` | Gera o build de produção na pasta `dist/` |
| `npm run preview` | Visualiza o build de produção localmente |
| `npm run lint` | Verifica erros de tipagem com TypeScript |
| `npm run clean` | Remove a pasta `dist/` |

---

## 📄 Licença

Este projeto é de uso acadêmico/interno.

---

<div align="center">

**Powered by Google Gemini** · Desenvolvido com ❤️

</div>

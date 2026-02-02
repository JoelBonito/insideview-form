# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Dev server on http://localhost:3000
npm run build    # Production build (vite build)
npm run preview  # Preview production build
```

There are no test or lint scripts configured.

## Architecture

SPA de gestão de visitas fotográficas imobiliárias. Frontend-only com Supabase como backend (BaaS).

**Stack:** React 19 + TypeScript + Vite 6 + Tailwind CSS v4 + Supabase

### Estrutura de navegação

`App.tsx` renderiza um layout com sidebar (desktop) / bottom nav (mobile) que alterna entre três tabs:

- **TabRegistration** — Formulário de nova visita
- **TabSummary** — Listagem com filtros, paginação, edição/exclusão
- **TabListings** — Relatórios com filtros e exportação Excel (xlsx)

### Camada de dados

- `lib/supabase.ts` — Inicialização do client Supabase (env vars `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- `services/sheetsService.ts` — Todas as operações CRUD. Usa schema `insideview` com tabelas `visitas` e `agencias`
- Os nomes das colunas no banco são em português (`codigo`, `agencia`, `servico`, `endereco`, `valor`, `data`, `status`, `observacoes`, `criado_em`, `atualizado_em`). O mapeamento para os tipos TypeScript (em inglês) acontece no `sheetsService`
- `types.ts` — Interfaces `Visit`, `RealEstateAgency` e enum `Tab`

### Componentes UI

`components/ui/LayoutComponents.tsx` contém os primitivos reutilizáveis: Card, Button, Input, Select, TextArea, Label, Modal. Todos os componentes de tab importam daqui.

### Sistema de temas

- Tema claro/escuro via classe CSS no `<html>` (`dark`/`light`)
- Variáveis CSS HSL definidas em `index.css` (`:root` para light, `.dark` para dark)
- Tailwind v4 mapeia essas variáveis em `@theme` (ex: `bg-background`, `text-foreground`, `bg-primary`)
- Cores semânticas de sidebar: `bg-sidebar`, `text-sidebar-fg`, `bg-sidebar-active`
- Cores de status: `success`, `warning`, `error`, `info`
- Fontes: Space Grotesk (display), Noto Sans (body) — usar `font-display` e `font-body`

### Responsividade

Layout mobile-first com breakpoints Tailwind: `sm:`, `md:`, `lg:`, `xl:`. Mobile usa bottom nav e cards; desktop usa sidebar e tabelas. Suporte a safe-area-inset para dispositivos com notch.

### Path alias

`@/*` mapeia para a raiz do projeto (configurado em `vite.config.ts` e `tsconfig.json`).

### Database

Schema Supabase `insideview` com migrações em `supabase/migrations/`. RLS habilitado com políticas públicas.

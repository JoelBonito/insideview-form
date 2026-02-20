# Plano de Implementacao: Health Check do Supabase

## 1. Overview

### O que
Implementar um sistema de deteccao e notificacao de indisponibilidade do Supabase na aplicacao Insideview 360. O sistema detecta quando o projeto Supabase esta pausado (free tier pausa apos 7 dias de inatividade), notifica o usuario de forma clara e impede que dados sejam perdidos silenciosamente.

### Por que
Atualmente, quando o Supabase pausa:
- **Leitura silenciosa falha:** `getVisits()` e `getAgencies()` retornam `[]` — o usuario ve listas vazias sem saber que ha erro.
- **Escrita falha com perda de dados:** O usuario preenche o formulario, clica salvar, o `console.error` e executado, mas nenhum feedback visual e dado. A visita e perdida.
- **Nao existe nenhum mecanismo** de health check, classificacao de erro, retry ou notificacao ao usuario.

---

## 2. Tipo de Projeto

**WEB** — Single Page Application (React 19 + Vite 6 + Tailwind CSS v4 + Supabase BaaS)

---

## 3. Criterios de Sucesso

| # | Criterio | Metrica |
|---|----------|---------|
| S1 | Deteccao de pausa | Status HTTP 540 do Supabase e corretamente identificado e classificado como "projeto pausado" |
| S2 | Notificacao visual | Banner amarelo (warning) aparece em ate 5 segundos apos falha de conexao confirmada |
| S3 | Protecao de dados | Botao de submit do formulario e desabilitado quando conexao esta indisponivel; dados do formulario permanecem intactos |
| S4 | Zero falha silenciosa | Nenhuma operacao de leitura retorna `[]` sem que o estado de erro seja propagado |
| S5 | Recuperacao automatica | Ao reconectar, banner verde aparece por 3s e dados sao recarregados automaticamente |
| S6 | Debounce de falhas | Necessarias 2 falhas consecutivas antes de declarar desconexao (evita flapping) |
| S7 | Acessibilidade | Banner com `role="status"`, `aria-live="assertive"`, botao desabilitado com `aria-describedby` |
| S8 | Build limpo | `npm run build` completa sem erros de TypeScript |

---

## 4. Stack Tecnica

| Tecnologia | Uso neste plano | Justificativa |
|------------|-----------------|---------------|
| React Context + Hook | Estado global de conexao (`SupabaseStatusProvider`) | Leve, nativo do React, sem dependencia extra |
| TypeScript | Tipos `ServiceResult<T>`, `ConnectionStatus` | Type-safety para classificacao de erros |
| Tailwind CSS v4 | Estilizacao do banner e estados | Ja em uso no projeto, cores semanticas disponiveis (`warning`, `success`, `error`) |
| Supabase JS Client | Health check via `select('id', { count: 'exact', head: true })` | Zero transferencia de dados, resposta minima |

---

## 5. Estrutura de Arquivos

### Arquivos Novos
```
types.ts                          (MODIFICAR - adicionar tipos)
lib/supabaseHealth.ts             (NOVO - health check + classificacao de erros)
lib/SupabaseStatusContext.tsx      (NOVO - React Context + Provider + Hook)
components/ui/ConnectionBanner.tsx (NOVO - banner de status de conexao)
```

### Arquivos Modificados
```
types.ts                          - Adicionar ConnectionStatus, ServiceResult<T>
services/sheetsService.ts         - Refatorar para retornar ServiceResult<T>
lib/supabase.ts                   - Sem alteracao (gateway mantido como esta)
index.tsx                         - Envolver <App /> com <SupabaseStatusProvider>
App.tsx                           - Inserir <ConnectionBanner /> no topo do <main>
components/TabRegistration.tsx    - Consumir useSupabaseStatus(), bloquear submit
components/TabSummary.tsx         - Consumir useSupabaseStatus(), diferenciar empty state
components/TabListings.tsx        - Consumir useSupabaseStatus(), diferenciar empty state
```

---

## 6. Detalhamento das Tarefas

### Fase 1: Fundacao (Backend)

---

#### T1 — Definir tipos de conexao e ServiceResult

- **Agente:** backend-specialist
- **Prioridade:** P0
- **Dependencias:** nenhuma
- **Tempo estimado:** 5 min

**INPUT:**
- Arquivo `types.ts` existente com `Visit`, `RealEstateAgency`, `Tab`

**OUTPUT:**
- Adicionar ao `types.ts`:
  ```typescript
  export type ConnectionStatus = 'connected' | 'disconnected' | 'checking';

  export type ServiceResult<T> =
    | { ok: true; data: T }
    | { ok: false; error: string; connectionStatus: ConnectionStatus };
  ```

**VERIFY:**
- `npm run build` compila sem erro
- Os tipos sao exportados e importaveis

---

#### T2 — Criar modulo de health check (`lib/supabaseHealth.ts`)

- **Agente:** backend-specialist
- **Prioridade:** P0
- **Dependencias:** T1
- **Tempo estimado:** 8 min

**INPUT:**
- `lib/supabase.ts` (client Supabase existente)
- Tipos `ConnectionStatus` de `types.ts`

**OUTPUT:**
- Novo arquivo `lib/supabaseHealth.ts` contendo:
  - `checkSupabaseHealth(): Promise<ConnectionStatus>` — executa `supabase.schema('insideview').from('agencias').select('id', { count: 'exact', head: true })`
  - `classifyError(status: number | null, message: string): ConnectionStatus` — retorna `'disconnected'` se `status === 540`, ou se erro de rede (fetch failed / timeout)
  - `isSupabasePaused(status: number | null): boolean` — helper que verifica `status === 540`
  - Constantes exportadas: `HEALTH_CHECK_INTERVAL_CONNECTED = 300_000` (5min), `HEALTH_CHECK_INTERVAL_DISCONNECTED_BASE = 30_000` (30s), `MAX_BACKOFF = 120_000` (2min), `FAILURE_THRESHOLD = 2`

**VERIFY:**
- Funcao `checkSupabaseHealth()` retorna `'connected'` quando Supabase responde com sucesso
- Funcao `classifyError(540, '')` retorna `'disconnected'`
- `npm run build` compila sem erro

---

#### T3 — Refatorar `sheetsService.ts` para retornar `ServiceResult<T>`

- **Agente:** backend-specialist
- **Prioridade:** P0
- **Dependencias:** T1, T2
- **Tempo estimado:** 10 min

**INPUT:**
- `services/sheetsService.ts` atual com 6 funcoes CRUD
- Tipo `ServiceResult<T>` de `types.ts`
- Funcao `classifyError()` de `lib/supabaseHealth.ts`

**OUTPUT:**
- Refatorar assinaturas:
  - `getAgencies(): Promise<ServiceResult<RealEstateAgency[]>>`
  - `getVisits(): Promise<ServiceResult<Visit[]>>`
  - `getVisitsForExport(...)`: Promise<ServiceResult<Visit[]>>`
  - `saveVisit(visit): Promise<ServiceResult<Visit>>`
  - `updateVisit(visit): Promise<ServiceResult<Visit>>`
  - `deleteVisit(id): Promise<ServiceResult<void>>`
- Em cada funcao:
  - No `catch`: usar `classifyError()` para inspecionar o erro/status
  - Retornar `{ ok: false, error: mensagem, connectionStatus }` ao inves de `return []` ou `throw`
  - Retornar `{ ok: true, data: resultado }` no caso de sucesso
- Corrigir `saveVisit()`: verificar erro da sub-operacao de criacao de agencia (linhas 63-79 atuais que ignoram erro)

**VERIFY:**
- Nenhuma funcao retorna `[]` diretamente em caso de erro
- Nenhuma funcao faz `throw` sem antes empacotar no `ServiceResult`
- `npm run build` compila sem erro (nota: tabs vao quebrar temporariamente ate T6-T8)

---

### Fase 2: Estado Global (Frontend)

---

#### T4 — Criar SupabaseStatusContext (`lib/SupabaseStatusContext.tsx`)

- **Agente:** frontend-specialist
- **Prioridade:** P0
- **Dependencias:** T2
- **Tempo estimado:** 10 min

**INPUT:**
- `lib/supabaseHealth.ts` (funcoes de health check e constantes)
- Tipo `ConnectionStatus` de `types.ts`

**OUTPUT:**
- Novo arquivo `lib/SupabaseStatusContext.tsx` contendo:
  - Interface do contexto:
    ```typescript
    interface SupabaseStatusContextValue {
      status: ConnectionStatus;
      lastChecked: Date | null;
      checkNow: () => Promise<void>;
      reportFailure: (httpStatus: number | null, message: string) => void;
      reportSuccess: () => void;
    }
    ```
  - `SupabaseStatusProvider` — componente provider que:
    - Mantem estado `status`, `consecutiveFailures`, `lastChecked`
    - Executa health check no mount
    - Configura polling com `setInterval`: 5min quando `connected`, backoff exponencial (30s -> 60s -> 120s) quando `disconnected`
    - `reportFailure()`: incrementa `consecutiveFailures`; so muda para `'disconnected'` apos >= `FAILURE_THRESHOLD` (2) falhas consecutivas
    - `reportSuccess()`: reseta `consecutiveFailures`, seta `status = 'connected'`
    - Cleanup no unmount (`clearInterval`)
  - `useSupabaseStatus()` — hook que consome o contexto

**VERIFY:**
- Provider exportado e pode ser instanciado sem erro
- Hook retorna os 5 campos da interface
- `npm run build` compila sem erro

---

#### T5 — Integrar Provider no ponto de entrada (`index.tsx`)

- **Agente:** frontend-specialist
- **Prioridade:** P0
- **Dependencias:** T4
- **Tempo estimado:** 3 min

**INPUT:**
- `index.tsx` atual que renderiza `<App />` dentro de `<React.StrictMode>`

**OUTPUT:**
- Envolver `<App />` com `<SupabaseStatusProvider>`:
  ```tsx
  <React.StrictMode>
    <SupabaseStatusProvider>
      <App />
    </SupabaseStatusProvider>
  </React.StrictMode>
  ```

**VERIFY:**
- App renderiza normalmente com o provider
- `npm run build` compila sem erro

---

### Fase 3: Componentes Visuais (Frontend)

---

#### T6 — Criar ConnectionBanner (`components/ui/ConnectionBanner.tsx`)

- **Agente:** frontend-specialist
- **Prioridade:** P0
- **Dependencias:** T4
- **Tempo estimado:** 8 min

**INPUT:**
- Hook `useSupabaseStatus()` de `lib/SupabaseStatusContext.tsx`
- Cores semanticas do tema: `warning` (amber), `success` (green), `error` (red)
- Componente `Button` de `components/ui/LayoutComponents.tsx`

**OUTPUT:**
- Novo arquivo `components/ui/ConnectionBanner.tsx` contendo `ConnectionBanner`:
  - **Quando `status === 'disconnected'`:** Banner sticky no topo, fundo amber/warning, nao-dismissivel, com:
    - Icone de alerta (WifiOff ou AlertTriangle do lucide-react)
    - Texto: "Conexao com o servidor indisponivel. Seus dados nao serao salvos. O projeto Supabase pode estar pausado."
    - Link: "Reativar no Supabase Dashboard" (abre em nova aba)
    - Botao: "Tentar novamente" que chama `checkNow()`
    - Atributos: `role="status"`, `aria-live="assertive"`
  - **Quando `status === 'connected'` e acabou de reconectar:** Banner verde por 3 segundos com "Conexao restabelecida" e depois desaparece (animacao fade-out)
  - **Quando `status === 'connected'` (normal):** Nao renderiza nada
  - **Quando `status === 'checking'`:** Nao renderiza nada (evitar flash)

**VERIFY:**
- Banner aparece quando status e `disconnected`
- Banner some quando status volta a `connected` (apos 3s com feedback verde)
- `role="status"` e `aria-live="assertive"` presentes no HTML
- `npm run build` compila sem erro

---

#### T7 — Inserir ConnectionBanner no App.tsx

- **Agente:** frontend-specialist
- **Prioridade:** P0
- **Dependencias:** T6
- **Tempo estimado:** 3 min

**INPUT:**
- `App.tsx` atual com layout sidebar + conteudo
- Componente `ConnectionBanner`

**OUTPUT:**
- Importar e renderizar `<ConnectionBanner />` no topo da area de conteudo principal (`<main>`), antes do `renderContent()`
- O banner deve ficar acima do conteudo das tabs, dentro do fluxo de scroll (sticky top)

**VERIFY:**
- Banner visivel no topo da area de conteudo
- Nao interfere com sidebar/bottom nav
- Layout responsivo preservado
- `npm run build` compila sem erro

---

### Fase 4: Integracao nas Tabs (Frontend)

---

#### T8 — Adaptar TabRegistration para ServiceResult + bloqueio de submit

- **Agente:** frontend-specialist
- **Prioridade:** P0
- **Dependencias:** T3, T4, T6
- **Tempo estimado:** 8 min

**INPUT:**
- `components/TabRegistration.tsx` atual
- Hook `useSupabaseStatus()`
- `sheetsService` refatorado com `ServiceResult<T>`

**OUTPUT:**
- Importar e usar `useSupabaseStatus()`
- Adaptar `useEffect` do `getAgencies()`:
  - Verificar `result.ok` antes de setar agencies
  - Se `!result.ok`, chamar `reportFailure()`
- Adaptar `handleSubmit`:
  - Se `!result.ok`, chamar `reportFailure()` e exibir mensagem de erro ao usuario (substituir `console.error` por feedback visual)
  - Se `result.ok`, chamar `reportSuccess()`
- Bloquear botao de submit:
  - `disabled={loading || status === 'disconnected'}`
  - Mensagem inline acima do botao quando desconectado: "Nao e possivel salvar enquanto a conexao estiver indisponivel."
  - `aria-describedby` no botao apontando para a mensagem
- **Manter dados do formulario intactos** — nunca limpar campos em caso de erro

**VERIFY:**
- Botao de submit desabilitado quando `status === 'disconnected'`
- Mensagem de aviso visivel acima do botao
- Dados do formulario preservados apos falha
- Funciona normalmente quando `status === 'connected'`
- `npm run build` compila sem erro

---

#### T9 — Adaptar TabSummary para ServiceResult + empty state diferenciado

- **Agente:** frontend-specialist
- **Prioridade:** P1
- **Dependencias:** T3, T4
- **Tempo estimado:** 6 min

**INPUT:**
- `components/TabSummary.tsx` atual
- Hook `useSupabaseStatus()`
- `sheetsService` refatorado com `ServiceResult<T>`

**OUTPUT:**
- Importar e usar `useSupabaseStatus()`
- Adaptar chamada a `getVisits()`:
  - Verificar `result.ok` antes de setar visitas
  - Se `!result.ok`, chamar `reportFailure()`
- Diferenciar estados vazios:
  - **Erro de conexao:** Mensagem "Nao foi possivel carregar as visitas. Verifique a conexao." com botao "Tentar novamente"
  - **Lista vazia real (ok mas sem dados):** Mensagem atual "Nenhuma visita encontrada"
- Adaptar operacoes de `updateVisit` e `deleteVisit`:
  - Verificar `result.ok`
  - Se `!result.ok`, chamar `reportFailure()` e exibir feedback de erro

**VERIFY:**
- Empty state de erro e diferente de empty state vazio
- Botao "Tentar novamente" funciona
- Edicao/exclusao tratam erros de conexao
- `npm run build` compila sem erro

---

#### T10 — Adaptar TabListings para ServiceResult + empty state diferenciado

- **Agente:** frontend-specialist
- **Prioridade:** P1
- **Dependencias:** T3, T4
- **Tempo estimado:** 5 min

**INPUT:**
- `components/TabListings.tsx` atual
- Hook `useSupabaseStatus()`
- `sheetsService` refatorado com `ServiceResult<T>`

**OUTPUT:**
- Importar e usar `useSupabaseStatus()`
- Adaptar chamada a `getVisitsForExport()` e `getAgencies()`:
  - Verificar `result.ok`
  - Se `!result.ok`, chamar `reportFailure()`
- Diferenciar empty state (mesma logica de T9):
  - Erro de conexao vs. sem dados para o filtro selecionado
- Desabilitar botao de exportacao Excel quando `status === 'disconnected'`

**VERIFY:**
- Empty state diferenciado
- Exportacao bloqueada quando desconectado
- `npm run build` compila sem erro

---

### Fase 5: Recuperacao e Polish (Frontend)

---

#### T11 — Implementar auto-refresh de dados na reconexao

- **Agente:** frontend-specialist
- **Prioridade:** P1
- **Dependencias:** T8, T9, T10
- **Tempo estimado:** 6 min

**INPUT:**
- `SupabaseStatusContext.tsx` com estado `status`
- Todas as 3 tabs adaptadas

**OUTPUT:**
- Em cada tab, adicionar `useEffect` que observa mudanca de `status`:
  - Quando `status` transiciona de `'disconnected'` para `'connected'`, recarregar dados automaticamente
  - Usar ref para armazenar status anterior e comparar com atual
- Alternativa: emitir callback `onReconnect` do context que as tabs podem assinar

**VERIFY:**
- Ao restaurar conexao, dados sao recarregados sem acao do usuario
- Nao dispara reload desnecessario quando status ja era `connected`
- `npm run build` compila sem erro

---

#### T12 — Implementar feedback visual de reconexao no banner

- **Agente:** frontend-specialist
- **Prioridade:** P2
- **Dependencias:** T6, T11
- **Tempo estimado:** 4 min

**INPUT:**
- `components/ui/ConnectionBanner.tsx`

**OUTPUT:**
- Adicionar estado interno `showReconnected` no banner
- Quando `status` transiciona de `disconnected` para `connected`:
  - Mostrar banner verde: "Conexao restabelecida" por 3 segundos
  - Fade-out com transicao CSS
  - Apos 3s, setar `showReconnected = false`
- Garantir que em mount normal (connected desde o inicio) nao mostra banner verde

**VERIFY:**
- Banner verde aparece apenas na transicao de desconectado -> conectado
- Desaparece apos 3 segundos
- Nao aparece no carregamento inicial
- `npm run build` compila sem erro

---

#### T13 — Tratar edge case de sub-operacao de agencia em `saveVisit`

- **Agente:** backend-specialist
- **Prioridade:** P1
- **Dependencias:** T3
- **Tempo estimado:** 5 min

**INPUT:**
- `services/sheetsService.ts` funcao `saveVisit()` (ja refatorada em T3)
- Linhas 63-79 originais: verificacao/criacao de agencia sem checagem de erro

**OUTPUT:**
- Garantir que a sub-operacao de verificar agencia (`select ... .single()`) e a sub-operacao de criar agencia (`insert`) tenham seus erros verificados
- Se a sub-operacao falhar com erro de conexao, retornar `ServiceResult` de falha imediatamente (nao tentar salvar a visita)
- Classificar o erro usando `classifyError()`

**VERIFY:**
- Se `select` da agencia falhar com 540, retorna `{ ok: false, connectionStatus: 'disconnected' }`
- Se `insert` da agencia falhar, retorna `{ ok: false }` com erro descritivo
- `npm run build` compila sem erro

---

### Fase 6: Verificacao Final

---

#### T14 — Teste end-to-end manual completo

- **Agente:** frontend-specialist
- **Prioridade:** P0
- **Dependencias:** T1-T13
- **Tempo estimado:** 10 min

**INPUT:**
- Aplicacao completa com todas as alteracoes

**OUTPUT:**
- Checklist de verificacao executada (ver secao 7)

**VERIFY:**
- Todos os itens da checklist passam
- `npm run build` compila sem erro
- App funciona normalmente quando Supabase esta ativo

---

## 7. Fase de Verificacao: Checklist Final

### Build e TypeScript
- [ ] `npm run build` completa sem erros
- [ ] Nenhum `any` desnecessario introduzido
- [ ] Todos os tipos novos (`ConnectionStatus`, `ServiceResult<T>`) estao sendo usados

### Cenario: Supabase Ativo (Operacao Normal)
- [ ] TabRegistration: formulario submete e salva normalmente
- [ ] TabSummary: lista carrega, edicao e exclusao funcionam
- [ ] TabListings: relatorios carregam, exportacao Excel funciona
- [ ] Nenhum banner de erro visivel
- [ ] Health check roda a cada 5 minutos em background (verificar no DevTools Network)

### Cenario: Supabase Pausado (Simulacao)
- [ ] Banner amarelo aparece no topo apos 2 falhas consecutivas
- [ ] Banner contem texto explicativo, link para Dashboard e botao "Tentar novamente"
- [ ] TabRegistration: botao de submit desabilitado com mensagem explicativa
- [ ] TabRegistration: dados do formulario permanecem intactos
- [ ] TabSummary: empty state mostra mensagem de erro de conexao (nao "nenhuma visita")
- [ ] TabListings: empty state mostra mensagem de erro de conexao
- [ ] TabListings: botao de exportacao desabilitado

### Cenario: Reconexao
- [ ] Banner verde "Conexao restabelecida" aparece por 3 segundos
- [ ] Dados sao recarregados automaticamente em todas as tabs
- [ ] Botao de submit e reabilitado
- [ ] Polling volta para intervalo de 5 minutos

### Acessibilidade
- [ ] Banner tem `role="status"` e `aria-live="assertive"`
- [ ] Botao desabilitado tem `aria-describedby` apontando para mensagem explicativa
- [ ] Contraste de cores adequado no banner (warning amber sobre fundo claro/escuro)
- [ ] Banner funciona nos temas claro e escuro

### Responsividade
- [ ] Banner visivel e legivel em mobile (< 640px)
- [ ] Banner visivel e legivel em tablet (640-1024px)
- [ ] Banner visivel e legivel em desktop (> 1024px)
- [ ] Banner nao obstrui bottom nav no mobile
- [ ] Banner nao obstrui sidebar no desktop

### Edge Cases
- [ ] Flapping: conexao instavel nao causa banner piscando (debounce de 2 falhas)
- [ ] Carregamento inicial: se Supabase ja esta pausado no primeiro load, banner aparece apos health check
- [ ] Multiplas tabs do navegador: cada uma tem seu proprio health check (independentes)
- [ ] Operacao de save durante reconexao: se falhar, dados do formulario preservados

---

## 8. Diagrama de Dependencias

```
T1 (tipos)
 |
 +---> T2 (health check module)
 |      |
 |      +---> T4 (context/provider)
 |      |      |
 |      |      +---> T5 (integrar provider)
 |      |      +---> T6 (connection banner)
 |      |      |      |
 |      |      |      +---> T7 (inserir banner no App)
 |      |      |      +---> T12 (feedback reconexao)
 |      |      |
 |      |      +---> T8 (TabRegistration)  ----+
 |      |      +---> T9 (TabSummary)       ----+--> T11 (auto-refresh)
 |      |      +---> T10 (TabListings)     ----+         |
 |      |                                                 v
 +---> T3 (refatorar sheetsService)                  T14 (verificacao)
        |
        +---> T8, T9, T10 (consumidores)
        +---> T13 (edge case agencia)
```

---

## 9. Resumo de Esforco

| Fase | Tarefas | Tempo Estimado | Agente Principal |
|------|---------|----------------|------------------|
| 1 - Fundacao | T1, T2, T3 | ~23 min | backend-specialist |
| 2 - Estado Global | T4, T5 | ~13 min | frontend-specialist |
| 3 - Componentes Visuais | T6, T7 | ~11 min | frontend-specialist |
| 4 - Integracao nas Tabs | T8, T9, T10 | ~19 min | frontend-specialist |
| 5 - Recuperacao e Polish | T11, T12, T13 | ~15 min | frontend-specialist + backend-specialist |
| 6 - Verificacao | T14 | ~10 min | frontend-specialist |
| **Total** | **14 tarefas** | **~91 min** | |

---

## 10. Notas Tecnicas Importantes

1. **HTTP 540 e o unico discriminador confiavel** para Supabase pausado. Outros erros de rede (timeout, DNS) devem ser tratados como `disconnected` generico.

2. **Recuperacao de projeto pausado e MANUAL** — so pode ser feita pelo painel do Supabase. O app nao pode reativar o projeto programaticamente. Por isso o banner inclui link para o Dashboard.

3. **O padrao ServiceResult<T> substitui completamente** o padrao atual de `return []` / `throw`. Nenhuma funcao do `sheetsService` deve mais retornar array vazio silenciosamente em caso de erro.

4. **Polling intervals:** Connected = 5min, Disconnected = 30s com backoff ate 2min. O backoff evita sobrecarga quando o projeto esta pausado.

5. **FAILURE_THRESHOLD = 2:** Exige 2 falhas consecutivas antes de mudar para `disconnected`. Isso evita que uma unica falha de rede transitoria dispare o banner.

6. **Health check usa query HEAD:** `select('id', { count: 'exact', head: true })` na tabela `agencias` — zero bytes de dados transferidos, apenas metadata.

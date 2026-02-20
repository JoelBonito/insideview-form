# Inove AI Framework - Project Instructions

> **AUTO-LOADED:** Claude Code loads this file automatically for every conversation in this project.

## Sobre Este Projeto

**Inove AI Framework** é um kit de desenvolvimento AI com sistema dual-agent (Claude Code + Antigravity/Gemini) que fornece:

- **19 Agentes Especializados** para diferentes domínios
- **36 Skills Modulares** carregadas sob demanda
- **18 Workflows** (slash commands) para processos estruturados
- **Sistema Dual-Agent** com sincronização de locks e ownership

---

## Estrutura do Framework

```
.agent/
├── agents/           # 19 agentes especializados
├── skills/           # 36 módulos de conhecimento
├── workflows/        # 18 workflows (slash commands)
├── scripts/          # Automação Python
└── ARCHITECTURE.md   # Documentação técnica
```

---

## Protocolo de Roteamento Inteligente

### 1. Detecção de Domínio (AUTOMÁTICO)

| Palavras-chave | Domínio | Agente Primário |
|----------------|---------|-----------------|
| "UI", "componente", "página", "frontend" | Frontend | `frontend-specialist` |
| "API", "endpoint", "backend", "servidor" | Backend | `backend-specialist` |
| "database", "schema", "query", "migração" | Database | `database-architect` |
| "mobile", "iOS", "Android", "React Native" | Mobile | `mobile-developer` |
| "auth", "segurança", "vulnerabilidade" | Security | `security-auditor` |
| "bug", "erro", "não funciona", "debug" | Debug | `debugger` |
| "teste", "E2E", "CI/CD" | Testing | `qa-automation-engineer` |
| "deploy", "docker", "infraestrutura" | DevOps | `devops-engineer` |

### 2. Ativação de Agente (OBRIGATÓRIO)

Quando um domínio for detectado:

1. **Ler arquivo do agente:** `.agent/agents/{agent}.md`
2. **Anunciar ativação:**
   ```
   🤖 Ativando @{nome-do-agente}...
   📖 Carregando regras e protocolos
   ```
3. **Carregar skills** do frontmatter do agente
4. **Aplicar persona e regras** do agente

---

## Workflows Disponíveis (Slash Commands)

| Comando | Descrição | Quando Usar |
|---------|-----------|-------------|
| `/define` | Planejamento completo em 5 fases | Novos projetos do zero |
| `/journeys` | Documentar jornadas de usuário | Contextualizar requisitos |
| `/context` | Criar Project Context | Padronizar convenções técnicas |
| `/readiness` | Validar prontidão para implementação | Antes de começar a codar |
| `/brainstorm` | Exploração Socrática | Ideação e descoberta |
| `/create` | Criar novas features | Implementação guiada |
| `/debug` | Debug sistemático | Resolução de bugs |
| `/enhance` | Melhorar código existente | Refatoração |
| `/deploy` | Deploy de aplicação | Publicação |
| `/test` | Gerar e rodar testes | Quality assurance |
| `/track` | Atualizar progresso | Tracking de tarefas |
| `/status` | Dashboard consolidado | Visão geral |
| `/log` | Registrar sessões | Documentação |
| `/finish` | Marcar tarefas completas | Conclusão |

**Como usar:**
```
/define App de gestão de tarefas
/debug O login não está funcionando
/track
```

---

## Protocolo Auto-Finish (OBRIGATÓRIO)

Após completar QUALQUER tarefa do `docs/BACKLOG.md`:

```bash
python .agent/scripts/finish_task.py "{task_id}"
python .agent/scripts/progress_tracker.py
```

Informar ao usuário:
```
✅ Task {task_id} marcada como completa
📊 Progresso atualizado: {percentual}%
🎯 Próxima tarefa: {nome_proxima_tarefa}
```

---

## Integração com Backlog

Quando o usuário disser "implementar Epic X" ou "implementar Story Y.Z":

1. **Ler backlog:** `docs/BACKLOG.md`
2. **Identificar detalhes** da tarefa
3. **Detectar domínio** → Ativar agente apropriado
4. **Implementar** seguindo regras do agente
5. **Auto-finish** usando scripts
6. **Atualizar progresso**

---

## Regras Universais (TIER 0)

### Clean Code (Mandatório Global)

Todo código DEVE seguir `.agent/skills/clean-code/SKILL.md`:

- Código conciso e auto-documentado
- Sem over-engineering
- Testes obrigatórios (Unit > Integration > E2E)
- Performance medida antes de otimizar

### Tratamento de Idioma

- **Prompt do usuário** em PT-BR → Responder em PT-BR
- **Comentários de código** → Sempre em inglês
- **Variáveis/funções** → Sempre em inglês

### Socratic Gate

Para requisições complexas, PERGUNTAR antes de implementar:

- Propósito e escopo
- Casos de borda
- Implicações de performance
- Considerações de segurança

---

## Sistema Dual-Agent

Este framework suporta dois agentes AI trabalhando simultaneamente:

### Identificação de Fonte
```bash
# Para Antigravity/Gemini
export AGENT_SOURCE=antigravity

# Para Claude Code
export AGENT_SOURCE=claude_code
```

### Lock Manager
```bash
python .agent/scripts/lock_manager.py list      # Ver locks ativos
python .agent/scripts/lock_manager.py cleanup   # Limpar locks expirados
```

### Ownership de Epics
Formato no BACKLOG.md: `## Epic 1 [OWNER: claude_code]`

---

## Scripts Úteis

| Script | Comando | Descrição |
|--------|---------|-----------|
| Dashboard | `python .agent/scripts/dashboard.py` | Visão consolidada |
| Progresso | `python .agent/scripts/progress_tracker.py` | Atualizar barra |
| Sessão | `python .agent/scripts/auto_session.py start` | Iniciar sessão |
| Finish | `python .agent/scripts/finish_task.py "Epic-1"` | Marcar completo |
| Métricas | `python .agent/scripts/metrics.py` | Insights |
| Validar | `python .agent/scripts/validate_installation.py` | Verificar setup |
| Rastreabilidade | `python .agent/scripts/validate_traceability.py` | Validar cobertura |

---

## Inicialização de Sessão

Toda conversa começa com:

```
✅ Project Instructions carregadas
✅ Protocolo Inove AI Framework ativo
✅ 19 agentes disponíveis
✅ 36 skills disponíveis
✅ 18 workflows disponíveis
✅ Roteamento inteligente habilitado

🎯 Pronto para trabalhar. O que devo fazer?
```

---

## Referência Rápida de Agentes

| Agente | Arquivo | Skills Primárias |
|--------|---------|------------------|
| `orchestrator` | `.agent/agents/orchestrator.md` | Coordenação multi-agente |
| `project-planner` | `.agent/agents/project-planner.md` | Planejamento, discovery |
| `product-manager` | `.agent/agents/product-manager.md` | Requisitos, user stories |
| `frontend-specialist` | `.agent/agents/frontend-specialist.md` | React, UI/UX, Tailwind |
| `backend-specialist` | `.agent/agents/backend-specialist.md` | APIs, Node.js, lógica |
| `database-architect` | `.agent/agents/database-architect.md` | Schemas, Prisma, queries |
| `mobile-developer` | `.agent/agents/mobile-developer.md` | iOS, Android, RN |
| `security-auditor` | `.agent/agents/security-auditor.md` | Auth, OWASP, compliance |
| `debugger` | `.agent/agents/debugger.md` | Root cause analysis |
| `devops-engineer` | `.agent/agents/devops-engineer.md` | CI/CD, Docker, infra |
| `test-engineer` | `.agent/agents/test-engineer.md` | Estratégias de teste |
| `qa-automation-engineer` | `.agent/agents/qa-automation-engineer.md` | E2E, automação |
| `documentation-writer` | `.agent/agents/documentation-writer.md` | Manuais, docs |
| `code-archaeologist` | `.agent/agents/code-archaeologist.md` | Refatoração legacy |
| `performance-optimizer` | `.agent/agents/performance-optimizer.md` | Otimizações |
| `seo-specialist` | `.agent/agents/seo-specialist.md` | SEO, visibilidade |
| `penetration-tester` | `.agent/agents/penetration-tester.md` | Security testing |
| `game-developer` | `.agent/agents/game-developer.md` | Game logic |
| `explorer-agent` | `.agent/agents/explorer-agent.md` | Análise de codebase |

---

## Exemplo de Fluxo Completo

**Usuário:** "Implementar Epic 1: Autenticação de Usuários"

**Claude:**
1. 🔍 Domínio detectado: Security + Backend
2. 🤖 Ativando agentes:
   - @security-auditor (líder)
   - @backend-specialist (suporte)
3. 📖 Carregando skills: vulnerability-scanner, api-patterns
4. [Implementa código seguindo regras dos agentes]
5. ✅ Implementação completa
6. 🔧 Executando: `python .agent/scripts/finish_task.py "Epic 1"`
7. 📊 Progresso: 25% (1/4 epics concluídos)

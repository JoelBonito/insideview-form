---
description: Exibe dashboard consolidado com progresso, sessões e métricas do projeto.
---

# Workflow: /status

> **Propósito:** Painel centralizado que combina progresso real (backlog), sessões ativas, estatísticas semanais e sync status (dual-agent).

## Fluxo de Execução

### Passo 1: Exibir Dashboard Unificado

Executa o dashboard consolidado que integra todas as fontes de dados:

```bash
python .agent/scripts/dashboard.py
```

**O dashboard automaticamente:**
- ✅ Carrega progresso do BACKLOG.md
- ✅ Detecta sessão ativa (se houver)
- ✅ Calcula estatísticas semanais dos logs
- ✅ Verifica sync status (locks ativos, múltiplos agentes)
- ✅ Lista próximas tarefas prioritárias
- ✅ Salva output em `docs/dashboard.md`

---

## Exemplo de Output

```markdown
# 📊 Dashboard - 2026-01-26 16:30

## 🎯 Progresso do Projeto

██████████████░░░░░░ 74.47%
Tarefas: 35/47

## ⏱️ Sessão Atual

🟢 Ativa desde 14:30 (2h 00m decorridos)
   🤖 Agente: antigravity
   📁 Projeto: inove-ai-framework

## 📅 Esta Semana (últimos 7 dias)

- Tempo total: 25h 30m
- Sessões: 13
- Média/dia: 3h 38m

## 🔄 Sync Status (Dual-Agent)

| Agente | Última Atividade | Tempo (7 dias) | Sessões |
|--------|------------------|----------------|---------|
| 🤖 antigravity | 2026-01-26 10:30<br/>*Implementação Epic 2* | 15h 30m | 8 |
| 🔵 claude_code | 2026-01-25 14:00<br/>*Refatoração código* | 10h 00m | 5 |

**Conflitos:** Nenhum ✅

## 🔥 Próximas Tarefas

1. Conexão com WhatsApp [🤖 antigravity]
2. Gestão de Contatos
3. Dashboard de Campanhas

---

**Comandos disponíveis:**
- `python .agent/scripts/auto_session.py start` - Iniciar sessão
- `python .agent/scripts/auto_session.py end` - Encerrar sessão
- `python .agent/scripts/finish_task.py <id>` - Marcar tarefa
- `python .agent/scripts/auto_finish.py --suggest` - Sugerir conclusões
- `python .agent/scripts/metrics.py weekly` - Gerar insights
- `python .agent/scripts/notifier.py test` - Testar notificações
```

---

## Comandos Adicionais

Além do dashboard principal, você pode usar:

### Gestão de Sessões
- `python .agent/scripts/auto_session.py start` - Iniciar sessão
- `python .agent/scripts/auto_session.py status` - Ver sessão atual
- `python .agent/scripts/auto_session.py end` - Encerrar sessão

### Tracking de Tarefas
- `python .agent/scripts/finish_task.py 3.1` - Marcar Story 3.1 completa
- `python .agent/scripts/auto_finish.py --suggest` - Ver candidatas
- `python .agent/scripts/auto_finish.py --check-context` - Auto-detectar

### Métricas e Analytics
- `python .agent/scripts/metrics.py collect` - Coletar métricas
- `python .agent/scripts/metrics.py weekly` - Relatório semanal
- `python .agent/scripts/metrics.py insights` - Ver insights

### Lembretes
- `python .agent/scripts/reminder_system.py check` - Verificar lembretes
- `python .agent/scripts/reminder_system.py end-of-day` - Lembrete de fim de dia

### Notificações
- `python .agent/scripts/notifier.py test` - Testar notificações
- `python .agent/scripts/notifier.py session-start` - Notificar início
- `python .agent/scripts/notifier.py task-complete 3.1` - Notificar conclusão

### Sync e Locks
- `python .agent/scripts/sync_tracker.py` - Ver sync status
- `python .agent/scripts/sync_tracker.py --check-conflicts` - Ver conflitos
- `python .agent/scripts/lock_manager.py list` - Locks ativos

---

*Gerado automaticamente pelo sistema Dual-Agent*

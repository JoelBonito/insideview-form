---
description: Marca uma tarefa do backlog como concluída. Uso: /finish {ID}
---

# Workflow: /finish

> **Propósito:** Automatizar a baixa de tarefas no backlog. Usado por agentes ao finalizar suas tarefas ou pelo usuário manualmente.

## Argumentos

- `task_id`: O identificador da tarefa (ex: "3.1", "Epic 2").

## Execução

// turbo
1. Executar o script de atualização
   Run: python3 .agent/scripts/finish_task.py "{task_id}"

// turbo
2. Atualizar a barra de progresso visual
   Run: python3 .agent/scripts/progress_tracker.py

## Exemplos de Uso

- **Manual:** `/finish 3.1`
- **Agente:** `run_command: /finish "Story 5.2"`

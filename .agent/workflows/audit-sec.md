---
description: Auditoria de Segurança - Firestore Rules, RLS, Validação de Inputs e Variáveis de Ambiente
---

# Auditoria de Segurança (/audit-sec)

Este workflow verifica a segurança da aplicação em múltiplas camadas.

## Checklist de Auditoria

### 1. Variáveis de Ambiente e Secrets
- [ ] Verificar se `.env` está no `.gitignore`
- [ ] Verificar se não há secrets hardcoded no código
- [ ] Verificar se variáveis de ambiente são acessadas via `import.meta.env` (Vite)
- [ ] Verificar se existe um `.env.example` para documentação

### 2. Validação de Inputs (Frontend)
- [ ] Forms devem usar validação com Zod ou similar
- [ ] Sanitização de inputs antes de envio
- [ ] Validação de tipos em runtime

### 3. Backend - Firebase Rules (se aplicável)
- [ ] Verificar existência de `firestore.rules`
- [ ] Regras não devem permitir `allow read, write: if true;` em produção
- [ ] Validar estrutura de dados nas rules
- [ ] Verificar se há `request.auth != null` para operações autenticadas

### 4. Backend - Supabase RLS (se aplicável)
- [ ] Verificar se RLS está habilitado em todas as tabelas
- [ ] Verificar políticas de SELECT, INSERT, UPDATE, DELETE
- [ ] Validar que não há bypass de RLS em funções

### 5. API e Network
- [ ] Verificar se URLs de API usam HTTPS
- [ ] Verificar tratamento de erros (não expor stack traces)
- [ ] Verificar se há rate limiting considerado

### 6. Dependências
// turbo
- [ ] Executar `npm audit` para verificar vulnerabilidades

## Como Executar Este Workflow

1. Revisar cada item do checklist acima
2. Documentar achados críticos, médios e baixos
3. Propor correções para cada vulnerabilidade encontrada
4. Implementar correções aprovadas pelo usuário

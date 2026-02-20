#!/usr/bin/env python3
"""
Validation Script - Inove AI Framework
Valida se todos os componentes das Fases 3 e 4 foram instalados corretamente.

Uso:
    python .agent/scripts/validate_installation.py
"""

import sys
from pathlib import Path
from typing import List, Tuple


def check_file_exists(filepath: Path) -> Tuple[bool, str]:
    """Verifica se arquivo existe."""
    if filepath.exists():
        return True, f"✅ {filepath.name}"
    else:
        return False, f"❌ {filepath.name} - FALTANDO"


def check_executable(filepath: Path) -> Tuple[bool, str]:
    """Verifica se arquivo é executável."""
    if filepath.exists() and filepath.stat().st_mode & 0o111:
        return True, f"✅ {filepath.name} (executável)"
    elif filepath.exists():
        return False, f"⚠️ {filepath.name} - sem permissão de execução"
    else:
        return False, f"❌ {filepath.name} - FALTANDO"


def validate_installation():
    """Valida instalação completa."""
    print("🔍 Validando instalação do Sistema Dual-Agent - Fases 3 e 4")
    print("=" * 70)
    print()

    all_passed = True
    script_dir = Path(__file__).parent

    # Fase 1 e 2 (Pré-requisitos)
    print("📋 FASE 1 e 2 - Pré-requisitos")
    print("-" * 70)

    phase1_files = [
        script_dir / "session_logger.py",
        script_dir / "lock_manager.py",
        script_dir / "auto_session.py",
        script_dir / "progress_tracker.py",
        script_dir / "finish_task.py",
    ]

    for filepath in phase1_files:
        passed, msg = check_file_exists(filepath)
        print(f"  {msg}")
        if not passed:
            all_passed = False

    print()

    # Fase 3 - Automação Avançada
    print("🚀 FASE 3 - Automação Avançada")
    print("-" * 70)

    phase3_files = [
        ("auto_finish.py", "Melhoria #6: Auto-Finish Melhorado"),
        ("reminder_system.py", "Melhoria #8: Sistema de Lembretes"),
    ]

    for filename, description in phase3_files:
        filepath = script_dir / filename
        passed, msg = check_executable(filepath)
        print(f"  {msg}")
        print(f"    → {description}")
        if not passed:
            all_passed = False

    print()

    # Fase 4 - Analytics e UX
    print("📊 FASE 4 - Analytics e UX")
    print("-" * 70)

    phase4_files = [
        ("metrics.py", "Melhoria #10: Métricas Automáticas"),
        ("notifier.py", "Melhoria #11: Notificações macOS"),
    ]

    for filename, description in phase4_files:
        filepath = script_dir / filename
        passed, msg = check_executable(filepath)
        print(f"  {msg}")
        print(f"    → {description}")
        if not passed:
            all_passed = False

    print()

    # Complementos
    print("🔗 COMPLEMENTOS")
    print("-" * 70)

    complementary_files = [
        ("sync_tracker.py", "Melhoria #3: Sync Status"),
        ("dashboard.py", "Melhoria #7: Dashboard Unificado"),
    ]

    for filename, description in complementary_files:
        filepath = script_dir / filename
        passed, msg = check_file_exists(filepath)
        print(f"  {msg}")
        print(f"    → {description}")
        if not passed:
            all_passed = False

    print()

    # Git Hooks
    print("🪝 GIT HOOKS")
    print("-" * 70)

    git_files = [
        (script_dir / "install_git_hooks.sh", "Script de instalação"),
        (script_dir / "GIT_HOOKS_README.md", "Documentação de hooks"),
    ]

    for filepath, description in git_files:
        passed, msg = check_file_exists(filepath)
        print(f"  {msg}")
        print(f"    → {description}")
        if not passed:
            all_passed = False

    print()

    # Documentação
    print("📚 DOCUMENTAÇÃO")
    print("-" * 70)

    docs_dir = script_dir.parent.parent / "docs"
    doc_files = [
        (docs_dir / "IMPLEMENTACAO_FASES_3_4.md", "Resumo da implementação"),
        (docs_dir / "DUAL_AGENT_SYSTEM.md", "Sistema dual-agent"),
    ]

    for filepath, description in doc_files:
        passed, msg = check_file_exists(filepath)
        print(f"  {msg}")
        print(f"    → {description}")
        if not passed and filepath.name == "IMPLEMENTACAO_FASES_3_4.md":
            all_passed = False

    print()

    # Diretórios criados
    print("📁 DIRETÓRIOS")
    print("-" * 70)

    directories = [
        script_dir.parent / "locks",
        script_dir.parent / "metrics",
    ]

    for dirpath in directories:
        if dirpath.exists():
            print(f"  ✅ {dirpath.relative_to(script_dir.parent)}/")
        else:
            print(f"  ℹ️ {dirpath.relative_to(script_dir.parent)}/ - será criado quando necessário")

    print()

    # Resultado final
    print("=" * 70)
    if all_passed:
        print("✅ VALIDAÇÃO COMPLETA - Todos os componentes instalados!")
        print()
        print("📝 Próximos passos:")
        print("  1. Instale os Git Hooks: bash .agent/scripts/install_git_hooks.sh")
        print("  2. Teste os scripts: python .agent/scripts/notifier.py test")
        print("  3. Veja a documentação: docs/IMPLEMENTACAO_FASES_3_4.md")
        print()
        return True
    else:
        print("⚠️ VALIDAÇÃO INCOMPLETA - Alguns componentes estão faltando")
        print()
        print("🔧 Ações recomendadas:")
        print("  1. Verifique os arquivos marcados com ❌")
        print("  2. Para permissões de execução, execute:")
        print("     chmod +x .agent/scripts/*.py")
        print()
        return False


def main():
    success = validate_installation()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()

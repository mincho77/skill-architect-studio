#!/bin/bash
set -e
REPO="$(pwd)"
PASS=0
FAIL=0
echo "🔍 Validando FASE 0 en: $REPO"
echo ""
echo -n "✓ Dependencias (gray-matter, nanoid)... "
if [ -d "$REPO/node_modules/gray-matter" ] && [ -d "$REPO/node_modules/nanoid" ]; then
  echo "✅"
  ((PASS++))
else
  echo "❌ FALTA: npm i gray-matter nanoid"
  ((FAIL++))
fi
echo -n "✓ Backup (skill_db_backup_v1_*)... "
if ls "$REPO"/skill_db_backup_v1_* &>/dev/null; then
  BACKUP_DIR=$(ls -d "$REPO"/skill_db_backup_v1_* | head -1)
  echo "✅ $BACKUP_DIR"
  ((PASS++))
else
  echo "❌ FALTA: ejecutar npx ts-node scripts/backup_data.ts"
  ((FAIL++))
fi
echo -n "✓ Archivos esqueleto... "
MISSING=""
[ -f "$REPO/src/lib/schemas.ts" ] || MISSING="schemas.ts "
[ -f "$REPO/src/lib/portColors.ts" ] || MISSING="${MISSING}portColors.ts "
[ -f "$REPO/src/lib/fsLock.ts" ] || MISSING="${MISSING}fsLock.ts "
[ -f "$REPO/src/lib/engine/index.ts" ] || MISSING="${MISSING}engine/index.ts "
[ -f "$REPO/scripts/backup_data.ts" ] || MISSING="${MISSING}backup_data.ts "
[ -f "$REPO/data/db/settings.json" ] || MISSING="${MISSING}settings.json "
if [ -z "$MISSING" ]; then
  echo "✅"
  ((PASS++))
else
  echo "❌ FALTA: $MISSING"
  ((FAIL++))
fi
echo -n "✓ .gitignore (skill_db_backup)... "
if grep -q "skill_db_backup_v1_" "$REPO/.gitignore" 2>/dev/null; then
  echo "✅"
  ((PASS++))
else
  echo "⚠️  REVISAR: .gitignore"
  ((FAIL++))
fi
echo -n "✓ Git tag v2-fase-0... "
if git tag | grep -q "v2-fase-0"; then
  echo "✅"
  ((PASS++))
else
  echo "❌ FALTA: git tag"
  ((FAIL++))
fi
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Resumen: $PASS ✅  /  $FAIL ❌"
echo ""
if [ $FAIL -eq 0 ]; then
  echo "✅ FASE 0 COMPLETADA — Listo para FASE 1"
  exit 0
else
  echo "❌ FASE 0 INCOMPLETA — Completa los items faltantes"
  exit 1
fi

#!/usr/bin/env npx ts-node
import fs from 'fs';
import path from 'path';
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs';

function backup() {
  const projectRoot = process.cwd();
  const skillDb = path.join(projectRoot, 'skill_db');
  const backupDir = path.join(projectRoot, `skill_db_backup_v1_${Date.now()}`);
  
  console.log('🔒 BACKUP TRANSACCIONAL');
  console.log(`Origen: ${skillDb}`);
  console.log(`Destino: ${backupDir}`);
  
  if (!fs.existsSync(skillDb)) {
    console.error(`❌ ERROR: ${skillDb} no encontrado`);
    process.exit(1);
  }
  
  mkdirSync(backupDir, { recursive: true });
  
  function copyDir(src: string, dest: string) {
    mkdirSync(dest, { recursive: true });
    for (const file of readdirSync(src)) {
      const srcFile = path.join(src, file);
      const destFile = path.join(dest, file);
      if (statSync(srcFile).isDirectory()) copyDir(srcFile, destFile);
      else copyFileSync(srcFile, destFile);
    }
  }
  
  try {
    copyDir(skillDb, backupDir);
    console.log(`✅ Backup completado: ${backupDir}`);
    console.log(`Total archivos: $(find ${backupDir} -type f | wc -l)`);
  } catch (err) {
    console.error(`❌ ERROR:`, err);
    if (fs.existsSync(backupDir)) fs.rmSync(backupDir, { recursive: true, force: true });
    process.exit(1);
  }
}

backup();

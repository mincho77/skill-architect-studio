import fs from 'fs';

const VAULT_PATH = 'skill_db/secrets.json';

export async function getSecret(name: string): Promise<string> {
  const vault = await readVault();
  if (!(name in vault)) {
    throw new Error(`SECRETO_NO_ENCONTRADO: ${name}`);
  }
  return vault[name];
}

export async function setSecret(name: string, value: string): Promise<string> {
  const vault = await readVault();
  vault[name] = value;
  await writeVault(vault);
  return name;
}

export async function listSecretNames(): Promise<string[]> {
  const vault = await readVault();
  return Object.keys(vault);
}

export async function deleteSecret(name: string): Promise<void> {
  const vault = await readVault();
  delete vault[name];
  await writeVault(vault);
}

async function readVault(): Promise<Record<string, string>> {
  if (!fs.existsSync(VAULT_PATH)) {
    return {};
  }

  try {
    const content = fs.readFileSync(VAULT_PATH, 'utf-8');
    return JSON.parse(content) as Record<string, string>;
  } catch (e) {
    console.error(`Error leyendo vault:`, e);
    return {};
  }
}

async function writeVault(vault: Record<string, string>): Promise<void> {
  const tmpPath = `${VAULT_PATH}.tmp`;

  try {
    fs.writeFileSync(tmpPath, JSON.stringify(vault, null, 2), 'utf-8');
    fs.chmodSync(tmpPath, 0o600);
    fs.renameSync(tmpPath, VAULT_PATH);
  } catch (e) {
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    throw e;
  }
}

export async function auditSecretsNotInLogs(logsContent: string): Promise<string[]> {
  const vault = await readVault();
  const foundSecrets: string[] = [];

  for (const [name, value] of Object.entries(vault)) {
    if (value && logsContent.includes(value)) {
      foundSecrets.push(name);
    }
  }

  return foundSecrets;
}

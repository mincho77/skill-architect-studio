import { promises as fs } from 'fs';
import { join } from 'path';

interface OutputFile {
  filename: string;
  path: string;
  size: number;
  mimeType: string;
}

class FileOutputManager {
  private baseDir = process.env.OUTPUT_DIR || '/tmp/skill-outputs';

  async saveFile(
    flowId: string,
    jobId: string,
    skillId: string,
    filename: string,
    buffer: Buffer,
    mimeType: string
  ): Promise<OutputFile> {
    const dir = join(this.baseDir, flowId, jobId, skillId);
    await fs.mkdir(dir, { recursive: true });

    const filepath = join(dir, filename);
    await fs.writeFile(filepath, buffer);

    const stats = await fs.stat(filepath);
    return {
      filename,
      path: filepath,
      size: stats.size,
      mimeType,
    };
  }

  async listOutputs(flowId: string, jobId: string): Promise<OutputFile[]> {
    const dir = join(this.baseDir, flowId, jobId);
    const files: OutputFile[] = [];

    try {
      const entries = await fs.readdir(dir, { recursive: true });
      for (const entry of entries) {
        if (typeof entry === 'string') {
          const fullPath = join(dir, entry);
          const stats = await fs.stat(fullPath);
          if (stats.isFile()) {
            files.push({
              filename: entry.split('/').pop() || entry,
              path: fullPath,
              size: stats.size,
              mimeType: 'application/octet-stream',
            });
          }
        }
      }
    } catch {
      // Directory doesn't exist yet
    }

    return files;
  }
}

export const fileOutputManager = new FileOutputManager();

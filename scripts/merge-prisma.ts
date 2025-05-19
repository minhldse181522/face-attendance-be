import fs from 'fs';
import path from 'path';

const prismaDir = path.join(__dirname, '..', 'prisma');
const schemaFile = path.join(prismaDir, 'schema.prisma');

// Bước 1: Đọc phần header (generator + datasource)
const schemaRaw = fs.readFileSync(schemaFile, 'utf-8');
const [header] = schemaRaw.split('model ');

// Bước 2: Đọc tất cả các file .prisma (trừ schema.prisma)
const modelFiles = fs
  .readdirSync(prismaDir)
  .filter((f) => f.endsWith('.prisma') && f !== 'schema.prisma');

const seenModels = new Set<string>();
const models: string[] = [];

for (const file of modelFiles) {
  const filePath = path.join(prismaDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  const modelDefs = content.match(/model\s+\w+\s+{[^}]*}/gs) ?? [];

  for (const modelDef of modelDefs) {
    const nameMatch = modelDef.match(/model\s+(\w+)/);
    const name = nameMatch?.[1];
    if (!name) continue;

    if (!seenModels.has(name)) {
      seenModels.add(name);
      models.push(`// From ${file}\n${modelDef}`);
    } else {
      console.warn(`⚠️ Model "${name}" in ${file} bị trùng, đã bỏ qua.`);
    }
  }
}

// Bước 3: Ghi đè schema.prisma mới
fs.writeFileSync(schemaFile, `${header.trim()}\n\n${models.join('\n\n')}`);
console.log('✅ schema.prisma đã được cập nhật tự động.');

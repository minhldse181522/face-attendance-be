import fs from 'fs';
import path from 'node:path';

const prismaDir = path.join(__dirname, '..', 'prisma');
const schemaPath = path.join(prismaDir, 'schema.prisma');

// Đọc phần đầu của schema.prisma (generator + datasource)
const schemaHeader = fs
  .readFileSync(schemaPath, 'utf-8')
  .split('model ')[0]
  .trim();

// Lấy tất cả file .prisma trừ schema.prisma
const modelFiles = fs
  .readdirSync(prismaDir)
  .filter((file) => file.endsWith('.prisma') && file !== 'schema.prisma');

const models = modelFiles
  .map((file) => {
    const filePath = path.join(prismaDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    return `// ${file}\n${content.trim()}`;
  })
  .join('\n\n');

// Ghi lại schema.prisma với header và toàn bộ models
fs.writeFileSync(schemaPath, `${schemaHeader}\n\n${models}`);

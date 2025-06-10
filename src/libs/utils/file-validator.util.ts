import { FileValidator } from '@nestjs/common';

type FileType =
  | Express.Multer.File
  | Express.Multer.File[]
  | Record<string, Express.Multer.File[]>;
type Result = { errorFileName?: string; isValid: boolean };

export const runFileValidation = async (args: {
  multiple: boolean;
  file: FileType;
  validator: (file: Express.Multer.File) => Promise<boolean> | boolean;
}): Promise<Result> => {
  if (args.multiple) {
    const fileFields = Object.keys(args.file);
    for (const field of fileFields) {
      const fieldFile = args.file[field];
      if (Array.isArray(fieldFile)) {
        for (const f of fieldFile) {
          if (!args.validator(f)) {
            return { errorFileName: f.originalname, isValid: false };
          }
        }
      } else {
        if (!args.validator(fieldFile)) {
          return { errorFileName: fieldFile.originalname, isValid: false };
        }
      }
    }
    return { isValid: true };
  }

  if (Array.isArray(args.file)) {
    for (const f of args.file) {
      if (!args.validator(f)) {
        return { errorFileName: f.originalname, isValid: false };
      }
    }
    return { isValid: true };
  }

  if (!args.validator(args.file as any)) {
    return { errorFileName: args.file.originalname as string, isValid: false };
  }

  return { isValid: true };
};

export class FileSizeValidator extends FileValidator {
  private maxSizeBytes: number;
  private multiple: boolean;
  private errorFileName: string;

  constructor(args: { maxSizeBytes: number; multiple: boolean }) {
    super({});
    this.maxSizeBytes = args.maxSizeBytes;
    this.multiple = args.multiple;
  }

  async isValid(file?: FileType): Promise<boolean> {
    if (!file) return false;

    const result = await runFileValidation({
      file,
      multiple: this.multiple,
      validator: (f) => f.size < this.maxSizeBytes,
    });
    this.errorFileName = result.errorFileName || '';
    return result.isValid;
  }

  buildErrorMessage(file: unknown): string {
    return (
      `file ${this.errorFileName || ''} exceeded the size limit ` +
      parseFloat((this.maxSizeBytes / 1024 / 1024).toFixed(2)) +
      'MB'
    );
  }
}

export class FileTypeValidator extends FileValidator {
  private multiple: boolean;
  private errorFileName: string;
  private filetype: RegExp | string;

  constructor(args: { multiple: boolean; filetype: RegExp | string }) {
    super({});
    this.multiple = args.multiple;
    this.filetype = args.filetype;
  }

  isPlainText(buffer: Buffer): boolean {
    for (const byte of buffer) {
      // Allow printable ASCII characters (32-126) and common whitespace (9, 10, 13)
      if (
        (byte < 32 || byte > 126) &&
        byte !== 9 && // Tab
        byte !== 10 && // Line feed
        byte !== 13 // Carriage return
      ) {
        return false;
      }
    }
    return true;
  }

  // Check for common file types based on magic numbers
  detectMimeType(file: Express.Multer.File): string | null {
    // Image types
    if (file.buffer[0] === 0xff && file.buffer[1] === 0xd8) {
      return 'image/jpeg';
    }
    if (file.buffer[0] === 0x89 && file.buffer[1] === 0x50) {
      return 'image/png';
    }
    if (file.buffer[0] === 0x47 && file.buffer[1] === 0x49) {
      return 'image/gif';
    }
    if (file.buffer[0] === 0x42 && file.buffer[1] === 0x4d) {
      return 'image/bmp';
    }
    if (file.buffer[0] === 0x49 && file.buffer[1] === 0x49) {
      return 'image/tiff'; // TIFF (little-endian)
    }
    if (file.buffer[0] === 0x4d && file.buffer[1] === 0x4d) {
      return 'image/tiff'; // TIFF (big-endian)
    }

    // Document types
    if (
      file.buffer[0] === 0x25 &&
      file.buffer[1] === 0x50 &&
      file.buffer[2] === 0x44 &&
      file.buffer[3] === 0x46
    ) {
      return 'application/pdf'; // PDF
    }
    if (
      file.buffer[0] === 0xd0 &&
      file.buffer[1] === 0xcf &&
      file.buffer[2] === 0x11 &&
      file.buffer[3] === 0xe0
    ) {
      return 'application/msword'; // .doc or .xls (OLE Compound Document)
    }
    if (
      file.buffer[0] === 0x50 &&
      file.buffer[1] === 0x4b &&
      (file.buffer[2] === 0x03 ||
        file.buffer[2] === 0x05 ||
        file.buffer[2] === 0x07) &&
      file.buffer[3] === 0x04
    ) {
      return 'application/vnd.openxmlformats-officedocument'; // .docx, .xlsx (ZIP-based Office files)
    }
    if (
      file.buffer[0] === 0xef &&
      file.buffer[1] === 0xbb &&
      file.buffer[2] === 0xbf
    ) {
      return 'text/plain'; // UTF-8 BOM (for .txt or .csv)
    }
    if (file.buffer[0] === 0xff && file.buffer[1] === 0xfe) {
      return 'text/plain'; // UTF-16 LE BOM (for .txt or .csv)
    }
    if (file.buffer[0] === 0xfe && file.buffer[1] === 0xff) {
      return 'text/plain'; // UTF-16 BE BOM (for .txt or .csv)
    }

    // Fallback for plain text files
    if (this.isPlainText(file.buffer)) {
      return 'text/plain'; // Plain text
    }

    return null;
  }

  isMimeTypeValid(file: Express.Multer.File): boolean {
    const fileType = this.detectMimeType(file);
    return fileType?.search(this.filetype) === 0;
  }

  async isValid(file?: FileType): Promise<boolean> {
    if (!file) return false;

    const result = await runFileValidation({
      multiple: this.multiple,
      file,
      validator: (f) => this.isMimeTypeValid(f),
    });
    this.errorFileName = result.errorFileName || '';
    return result.isValid;
  }

  buildErrorMessage(file: unknown): string {
    return `file ${this.errorFileName || ''} must be of type ${this.filetype}`;
  }
}

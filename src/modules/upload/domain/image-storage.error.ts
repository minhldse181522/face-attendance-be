import { ExceptionBase } from '@libs/exceptions';

export class ImageStorageNotFoundError extends ExceptionBase {
  static readonly message = 'ImageStorage not found';

  public readonly code = 'IMAGE_STORAGE.NOT_FOUND';

  constructor(cause?: Error, metadata?: unknown) {
    super(ImageStorageNotFoundError.message, cause, metadata);
  }
}

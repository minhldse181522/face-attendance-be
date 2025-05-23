export class FieldValidationException extends Error {
  constructor(
    public readonly errors: Record<string, string>,
    public readonly status: number = 400,
  ) {
    super('Validation failed');
  }
}

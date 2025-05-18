export type IField = { field: string; type: 'string' | 'number' | 'datetime' };

export function builderPrismaCondition<T = any>(
  field: IField,
  value?: string | number | null,
): T {
  if (
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value === 'null')
  ) {
    return { [field.field]: null } as T;
  }

  if (field.type === 'number') {
    const numericValue = Number(value);
    if (isNaN(numericValue)) {
      return { [field.field]: null } as T;
    }
    return { [field.field]: { equals: numericValue } } as T;
  }

  return {
    [field.field]: { contains: String(value), mode: 'insensitive' },
  } as T;
}

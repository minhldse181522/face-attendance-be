export function copyNonUndefinedProps(
  target: object,
  source: object,
  excludes: string[] = [],
): void {
  // if excludes is not empty, remove the excludes from source
  const keys = Object.keys(source).filter(
    (key) => !excludes.includes(key) && source[key] !== undefined,
  );

  return keys.forEach((key) => {
    if (source[key] !== undefined) {
      target[key] = source[key];
    }
  });
}

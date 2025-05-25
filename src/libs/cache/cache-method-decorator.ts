// Type alias for the decorator function type
export type CacheMethodDecorator = (
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) => void;

export type ErrorResponseType<T> = {
  item: T;
  errorCode?: string;
  message: string;
};

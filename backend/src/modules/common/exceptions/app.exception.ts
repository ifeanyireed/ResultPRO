export class AppException extends Error {
  public readonly status: number;
  public readonly code: string;

  constructor(message: string, status: number = 500, code: string = 'ERROR') {
    super(message);
    this.name = 'AppException';
    this.status = status;
    this.code = code;
  }
}

import { AppException } from './app.exception';

export class ConflictException extends AppException {
  constructor(message: string = 'Conflict', code: string = 'CONFLICT') {
    super(message, 409, code);
    this.name = 'ConflictException';
  }
}

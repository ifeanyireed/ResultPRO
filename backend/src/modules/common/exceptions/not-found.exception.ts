import { AppException } from './app.exception';

export class NotFoundException extends AppException {
  constructor(message: string = 'Not Found', code: string = 'NOT_FOUND') {
    super(message, 404, code);
    this.name = 'NotFoundException';
  }
}

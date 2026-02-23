import { AppException } from './app.exception';

export class UnauthorizedException extends AppException {
  constructor(message: string = 'Unauthorized', code: string = 'UNAUTHORIZED') {
    super(message, 401, code);
    this.name = 'UnauthorizedException';
  }
}

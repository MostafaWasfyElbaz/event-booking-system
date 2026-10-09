export class ApplicationException extends Error {
  statusCode: number;
  constructor(msg: string, statusCode: number, options?: ErrorOptions) {
    super(msg, options);
    this.statusCode = statusCode;
  }
}

export class validationError extends ApplicationException {
  constructor(msg: string[], statusCode: number, options?: ErrorOptions) {
    super(msg.join("\n"), statusCode, options);
  }
}
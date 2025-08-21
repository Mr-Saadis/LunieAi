export class AIError extends Error {
  constructor(message, details = null, provider = null) {
    super(message);
    this.name = 'AIError';
    this.details = details;
    this.provider = provider;
    this.timestamp = new Date().toISOString();
  }
}

export class RateLimitError extends AIError {
  constructor(message, resetTime = null) {
    super(message);
    this.name = 'RateLimitError';
    this.resetTime = resetTime;
  }
}

export class InvalidRequestError extends AIError {
  constructor(message, details = null) {
    super(message);
    this.name = 'InvalidRequestError';
    this.details = details;
  }
}

export class QuotaExceededError extends AIError {
  constructor(message, quotaType = 'daily') {
    super(message);
    this.name = 'QuotaExceededError';
    this.quotaType = quotaType;
  }
}
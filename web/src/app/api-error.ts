import { HttpErrorResponse } from '@angular/common/http';

interface ApiErrorBody {
  error: {
    message: string;
    details?: { field?: string; message: string }[];
  };
}

function isApiErrorBody(body: unknown): body is ApiErrorBody {
  return (
    typeof body === 'object' &&
    body !== null &&
    'error' in body &&
    typeof body.error === 'object' &&
    body.error !== null &&
    'message' in body.error &&
    typeof body.error.message === 'string'
  );
}

// Turns the API's { error: { message, details } } shape into one readable line.
export function apiErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse && isApiErrorBody(error.error)) {
    const { message, details } = error.error.error;
    if (details?.length) {
      return details.map((d) => (d.field ? `${d.field}: ${d.message}` : d.message)).join('; ');
    }
    return message;
  }
  return 'Something went wrong. Please try again.';
}

import { HttpErrorResponse } from '@angular/common/http';

// Turns the API's { error: { message, details } } shape into one readable line.
export function apiErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse && error.error?.error) {
    const { message, details } = error.error.error as {
      message: string;
      details?: { field?: string; message: string }[];
    };
    if (details?.length) {
      return details.map((d) => (d.field ? `${d.field}: ${d.message}` : d.message)).join('; ');
    }
    return message;
  }
  return 'Something went wrong. Please try again.';
}

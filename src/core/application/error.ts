import { AnyError } from "@/lib/error.ts";

export class ApplicationError extends AnyError {
  override name = "ApplicationError";

  constructor(
    public readonly usecase: string,
    message: string,
    cause?: unknown,
  ) {
    super(message, cause);
  }
}

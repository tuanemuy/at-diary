import { AnyError } from "@/lib/error.ts";

export class EventManagerError extends AnyError {
  override readonly name = "EventManagerError";
}

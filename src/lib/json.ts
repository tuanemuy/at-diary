import { z } from "zod/v4";
import { type Result, ok, err } from "neverthrow";
import { AnyError } from "./error.ts";

export type JsonPrimitive = string | number | boolean | null;
export type JsonObject = {
  [key in string]?: JsonValue;
};
export type JsonArray = JsonValue[];
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

export const jsonPrimitiveSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);
export const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    jsonPrimitiveSchema,
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ]),
);
export const jsonObjectSchema: z.ZodType<JsonObject> = z.record(
  z.string(),
  jsonValueSchema,
);

export class JsonParseError extends AnyError {
  override name = "JsonParseError";
}

export function parseJson(json: string): Result<JsonValue, JsonParseError> {
  try {
    const parsed = JSON.parse(json);
    const result = jsonValueSchema.parse(parsed);

    return ok(result);
  } catch (error) {
    return err(new JsonParseError("Invalid JSON", error));
  }
}

import { AnyError } from "@/lib/error.ts";

export const RepositoryErrorCode = {
  // データベース接続関連
  CONNECTION_ERROR: "connection_error",

  // トランザクション関連
  TRANSACTION_ERROR: "transaction_error",

  // トランザクション関連
  TRANSACTION_ROLLBACK_ERROR: "transaction_rollback_error",

  // 構文エラーもしくはアクセス規則違反
  SYNTAX_OR_ACCESS_ERROR: "syntax_or_access_error",

  // システムエラー
  SYSTEM_ERROR: "system_error",

  // データエラー
  DATA_ERROR: "data_error",

  // 制約関連
  UNIQUE_VIOLATION: "unique_violation",
  CONSTRAINT_VIOLATION: "constraint_violation",

  // データが見つからない
  NOT_FOUND: "not_found",

  // その他
  UNKNOWN_ERROR: "unknown_error",
} as const;
export type RepositoryErrorCode =
  (typeof RepositoryErrorCode)[keyof typeof RepositoryErrorCode];

export class RepositoryError extends AnyError {
  override readonly name = "RepositoryError";

  constructor(
    public readonly code: RepositoryErrorCode | string,
    message: string,
    cause?: unknown,
  ) {
    super(message, cause);
  }
}

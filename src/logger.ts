type LogLevel = "info" | "warn" | "error" | "debug";

const disabled = process.env.NODE_ENV === "production"; // false in production

export function log(level: LogLevel, ...args: unknown[]) {
  if (disabled && level !== "error") return;
  console[level]("WHPC - ", ...args);
}

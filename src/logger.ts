type LogLevel = "info" | "warn" | "error" | "debug";

const disabled = true;

export function log(level: LogLevel, ...args: unknown[]) {
  if (disabled && level !== "error") return;
  console[level](`WHPC - ${new Date().toISOString()}`, ...args);
}

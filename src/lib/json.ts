export function safeStringify(value: unknown, space = 2): string {
  return JSON.stringify(
    value,
    (_key, val) => (typeof val === "bigint" ? val.toString() : val),
    space,
  );
}

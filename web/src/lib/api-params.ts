export function buildListParams(
  params: Record<string, string | number | null | undefined>
): Record<string, string | number> {
  const result: Record<string, string | number> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (value === null) {
      result[key] = "";
      continue;
    }
    result[key] = value;
  }

  return result;
}

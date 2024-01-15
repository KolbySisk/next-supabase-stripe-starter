export function getEnvVar(varValue: string | undefined, varName: string): string {
  if (varValue === undefined) throw new ReferenceError(`Reference to undefined env var: ${varName}`);
  return varValue;
}

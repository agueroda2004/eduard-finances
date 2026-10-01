import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El correo es obligatorio")
    .email("Correo electrónico inválido"),
  password: z
    .string()
    .min(1, "La contraseña es obligatoria")
    .min(6, "Mínimo 6 caracteres"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export function collectFieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !result[key]) {
      result[key] = issue.message;
    }
  }
  return result;
}

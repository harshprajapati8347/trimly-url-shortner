import { z } from "zod";

/**
 * Zod schemas — chosen over Yup because Zod:
 *  - infers static TypeScript types (`z.infer`) so client + server share one source of truth,
 *  - validates cleanly inside Server Actions / Route Handlers (no extra adapter),
 *  - plugs into react-hook-form via `@hookform/resolvers/zod`.
 */

export const createLinkSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  longUrl: z
    .string()
    .trim()
    .min(1, "Long URL is required")
    .url("Must be a valid URL"),
  customUrl: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9_-]*$/, "Only letters, numbers, - and _ allowed")
    .optional()
    .or(z.literal("")),
});
export type CreateLinkInput = z.infer<typeof createLinkSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type SignupInput = z.infer<typeof signupSchema>;

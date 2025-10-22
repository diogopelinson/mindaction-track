import { z } from "zod";

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email("Email inválido").max(255, "Email muito longo"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export const signupSchema = z.object({
  email: z.string().email("Email inválido").max(255, "Email muito longo"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  fullName: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(200, "Nome muito longo"),
  cpf: z.string().length(14, "CPF deve estar no formato 000.000.000-00"),
  phone: z.string().min(10, "Telefone inválido").max(20, "Telefone muito longo"),
  sex: z.enum(["male", "female"]),
  age: z.number().int().min(18, "Idade mínima: 18 anos").max(120, "Idade máxima: 120 anos"),
  height: z.number().min(100, "Altura mínima: 100 cm").max(250, "Altura máxima: 250 cm"),
  initialWeight: z.number().min(30, "Peso mínimo: 30 kg").max(300, "Peso máximo: 300 kg"),
  targetWeight: z.number().min(30, "Peso mínimo: 30 kg").max(300, "Peso máximo: 300 kg"),
  goalType: z.enum(["perda_peso", "ganho_massa"]),
});

// Check-in schemas
export const checkInSchema = z.object({
  weight: z.number().min(30, "Peso mínimo: 30 kg").max(300, "Peso máximo: 300 kg"),
  neckCircumference: z.number().min(25, "Circunferência do pescoço mínima: 25 cm").max(60, "Circunferência do pescoço máxima: 60 cm").optional(),
  waistCircumference: z.number().min(50, "Circunferência da cintura mínima: 50 cm").max(150, "Circunferência da cintura máxima: 150 cm").optional(),
  hipCircumference: z.number().min(50, "Circunferência do quadril mínima: 50 cm").max(170, "Circunferência do quadril máxima: 170 cm").optional(),
  notes: z.string().max(1000, "Notas devem ter no máximo 1000 caracteres").optional(),
}).refine(
  (data) => {
    // If measurements are provided, validate waist > neck
    if (data.neckCircumference && data.waistCircumference) {
      return data.waistCircumference > data.neckCircumference;
    }
    return true;
  },
  {
    message: "A circunferência da cintura deve ser maior que a do pescoço",
    path: ["waistCircumference"],
  }
);

// Profile update schema
export const profileUpdateSchema = z.object({
  fullName: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(200, "Nome muito longo").optional(),
  phone: z.string().min(10, "Telefone inválido").max(20, "Telefone muito longo").optional(),
  age: z.number().int().min(18, "Idade mínima: 18 anos").max(120, "Idade máxima: 120 anos").optional(),
  height: z.number().min(100, "Altura mínima: 100 cm").max(250, "Altura máxima: 250 cm").optional(),
  targetWeight: z.number().min(30, "Peso mínimo: 30 kg").max(300, "Peso máximo: 300 kg").optional(),
});

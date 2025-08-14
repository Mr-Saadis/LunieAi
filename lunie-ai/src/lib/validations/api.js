// lib/validations/api.js - API VALIDATION SCHEMAS
import { z } from 'zod'

export const createChatbotSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_.']+$/, 'Name contains invalid characters')
    .trim(),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .nullable(),
  instructions: z.string()
    .max(2000, 'Instructions must be less than 2000 characters')
    .optional()
    .nullable(),
  ai_model: z.enum(['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gemini-pro'])
    .default('gpt-3.5-turbo'),
  theme_color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color format')
    .default('#3B82F6'),
  chat_icon: z.string()
    .url('Invalid icon URL')
    .optional()
    .nullable(),
  is_active: z.boolean().default(true),
  welcome_message: z.string()
    .max(500, 'Welcome message must be less than 500 characters')
    .optional()
    .nullable()
})

export const updateChatbotSchema = createChatbotSchema.partial()

import { z } from 'zod';

export const ChatRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty'),
  systemInstruction: z.string().optional(),
  language: z.string().optional()
});

export const VisionRequestSchema = z.object({
  imageBase64: z.string().min(1, 'Image base64 is required'),
  mimeType: z.string().optional().default('image/jpeg'),
  prompt: z.string().optional(),
  cropType: z.string().optional()
});

export const SupportEnquirySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(5, 'Valid phone number required'),
  village: z.string().optional(),
  enquiry: z.string().min(1, 'Enquiry description is required'),
  lang: z.string().optional()
});

export const DiseaseAnalysisResponseSchema = z.object({
  diseaseName: z.string().optional(),
  confidence: z.number().optional(),
  description: z.string().optional(),
  treatment: z.object({
    immediate: z.string().optional(),
    preventative: z.string().optional()
  }).optional(),
  disclaimer: z.string().optional()
});

export type ChatRequestInput = z.infer<typeof ChatRequestSchema>;
export type VisionRequestInput = z.infer<typeof VisionRequestSchema>;
export type SupportEnquiryInput = z.infer<typeof SupportEnquirySchema>;

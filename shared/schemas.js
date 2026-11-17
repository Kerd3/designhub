/**
 * Validation schemas shared by React Hook Form (frontend), the mock API
 * and the Express backend. One definition per entity means the browser and
 * the server always agree on what a valid record is.
 */
import { z } from 'zod';
import {
  PROJECT_STATUSES, TASK_STATUSES, INQUIRY_STATUSES, CLIENT_STATUSES, PRIORITIES,
  PROJECT_CATEGORIES, INQUIRY_PROJECT_TYPES, BUDGET_RANGES,
} from './domain.js';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'Choose a date' });
const required = (label, max) =>
  z.string().trim().min(1, { error: `${label} is required` }).max(max, { error: `${label} must be ${max} characters or fewer` });
const optionalText = (label, max) =>
  z.string().trim().max(max, { error: `${label} must be ${max} characters or fewer` }).optional();
const email = z.string().trim().min(1, { error: 'Email address is required' }).pipe(z.email({ error: 'Enter a valid email address, like name@company.com' }));

export const LIMITS = { name: 80, company: 100, description: 1000, title: 120, inquiryDescription: 1500 };

export const inquirySchema = z.object({
  name: required('Full name', LIMITS.name).refine((v) => v.length >= 2, { error: 'Enter your full name' }),
  email,
  company: optionalText('Company name', LIMITS.company),
  projectType: z.enum(INQUIRY_PROJECT_TYPES, { error: 'Choose a project type' }),
  budget: z.enum(BUDGET_RANGES, { error: 'Choose a budget range' }),
  description: z
    .string()
    .trim()
    .min(30, { error: 'Tell us a little more: at least 30 characters' })
    .max(LIMITS.inquiryDescription, { error: `Keep the description under ${LIMITS.inquiryDescription} characters` }),
});

export const inquiryStatusSchema = z.object({ status: z.enum(INQUIRY_STATUSES) });

export const projectSchema = z
  .object({
    name: required('Project name', LIMITS.title),
    clientId: z.string().min(1, { error: 'Choose a client' }),
    description: optionalText('Description', LIMITS.description),
    category: z.enum(PROJECT_CATEGORIES, { error: 'Choose a category' }),
    startDate: isoDate,
    dueDate: isoDate,
    status: z.enum(PROJECT_STATUSES),
    priority: z.enum(PRIORITIES),
    memberIds: z.array(z.string()).default([]),
    progress: z.number({ error: 'Enter a number from 0 to 100' }).int().min(0, { error: 'Minimum is 0' }).max(100, { error: 'Maximum is 100' }),
  })
  .refine((p) => p.dueDate >= p.startDate, { path: ['dueDate'], error: 'Due date must be on or after the start date' });

/** PATCH payloads: any subset of fields, validated individually. */
export const projectPatchSchema = z.object({
  name: required('Project name', LIMITS.title),
  clientId: z.string().min(1),
  description: optionalText('Description', LIMITS.description),
  category: z.enum(PROJECT_CATEGORIES),
  startDate: isoDate,
  dueDate: isoDate,
  status: z.enum(PROJECT_STATUSES),
  priority: z.enum(PRIORITIES),
  memberIds: z.array(z.string()),
  progress: z.number().int().min(0).max(100),
}).partial();

export const clientSchema = z.object({
  companyName: required('Company name', LIMITS.company),
  contactPerson: required('Contact person', LIMITS.name),
  email,
  phone: z.string().trim().max(30, { error: 'Phone must be 30 characters or fewer' }).regex(/^[+()\d\s.-]*$/, { error: 'Use digits, spaces and + ( ) - only' }).optional(),
  industry: required('Industry', 60),
  website: z.union([z.literal(''), z.url({ error: 'Enter a full URL, like https://company.com' })]).optional(),
  status: z.enum(CLIENT_STATUSES),
  notes: optionalText('Notes', 500),
});
export const clientPatchSchema = clientSchema.partial();

export const taskSchema = z.object({
  title: required('Task title', LIMITS.title),
  description: optionalText('Description', 600),
  projectId: z.string().min(1, { error: 'Choose a project' }),
  assigneeId: z.string().min(1, { error: 'Assign a team member' }),
  dueDate: isoDate,
  priority: z.enum(PRIORITIES),
  status: z.enum(TASK_STATUSES),
});
export const taskPatchSchema = taskSchema.partial();

export const teamPatchSchema = z.object({
  availability: z.enum(['available', 'limited', 'unavailable']),
}).partial();

/** Flattens a ZodError into { field: message } for API responses. */
export function fieldErrors(zodError) {
  const out = {};
  for (const issue of zodError.issues) {
    const key = issue.path.join('.') || '_';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

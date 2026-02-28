import { z } from 'zod';

// Note: query parameters are universally parsed as strings by express,
// so we use a preprocessor to convert numeric strings into integers.
export const paginationSchema = z.object({
    page: z.preprocess(
        (val) => (val ? Number(val) : 1),
        z.number().int().min(1).default(1)
    ),
    limit: z.preprocess(
        (val) => (val ? Number(val) : 20),
        z.number().int().min(1).max(100).default(20)
    ),
}).strict();

export type PaginationQuery = z.infer<typeof paginationSchema>;

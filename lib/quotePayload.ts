import { z } from "zod";

const optionalText = z.preprocess((value) => value == null ? "" : String(value), z.string().trim().max(2000));
const optionalBool = z.preprocess((value) => value == null ? false : value, z.coerce.boolean()).default(false);

export const quotePayloadSchema = z.object({
  first_name: optionalText.default(""), last_name: optionalText.default(""),
  postal_code: optionalText.default(""), property_occupancy: optionalText.default("unknown"),
  mow_area: optionalText.default(""), property_address: optionalText.default(""),
  latitude: z.coerce.number().finite().nullable().optional().default(null),
  longitude: z.coerce.number().finite().nullable().optional().default(null),
  is_corner_lot: optionalBool, grass_over_6in: optionalBool, grass_over_12in: optionalBool,
  community_gate: optionalBool, backyard_gate: optionalBool, flower_beds: optionalBool,
  pets_in_backyard: optionalBool, white_vinyl_fence: optionalBool, above_ground_pool: optionalBool,
  trampoline: optionalBool, optional_services: z.array(z.string()).default([]),
  referral_source: optionalText.default("website"), special_requests: optionalText.default(""),
  payment_preference: optionalText.default("not_selected"),
});

export type QuotePayload = z.infer<typeof quotePayloadSchema>;
export const normalizeQuotePayload = (value: unknown): QuotePayload => quotePayloadSchema.parse(value ?? {});

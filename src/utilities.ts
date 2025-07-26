// This file has been refactored. All schemas have been moved to schemas.ts
// This file is kept for backward compatibility but should be removed in a future version

import { z } from "zod";
import { 
  DevSpaceUseSchema,
  DevSpaceResetSchema,
  DevSpaceSetSchema,
  DevSpaceAnalyzeSchema,
  DevSpaceVersionSchema,
  DevSpaceUISchema,
  DevSpaceOpenSchema,
  DevSpacePrintSchema,
  DevSpaceRunSchema,
  DevSpaceAddSchema,
  DevSpaceRemoveSchema
} from "./schemas.js";

// Re-export schemas for backward compatibility
export {
  DevSpaceUseSchema,
  DevSpaceResetSchema,
  DevSpaceSetSchema,
  DevSpaceAnalyzeSchema,
  DevSpaceVersionSchema,
  DevSpaceUISchema,
  DevSpaceOpenSchema,
  DevSpacePrintSchema,
  DevSpaceRunSchema,
  DevSpaceAddSchema,
  DevSpaceRemoveSchema
};

// Additional utility schemas that weren't in the original utilities.ts
export const DevSpaceUpdateSchema = DevSpaceAddSchema.extend({
  type: DevSpaceAddSchema.shape.type.or(z.literal('dependencies')),
  name: z.string().optional().describe("Plugin name to update (required for plugin updates)"),
});

export const DevSpaceStatusSchema = z.object({
  workingDirectory: z.string().optional().describe("Working directory to execute command in"),
});

export const DevSpaceAttachSchema = z.object({
  container: z.string().optional().describe("Container to attach to"),
  workingDirectory: z.string().optional().describe("Working directory to execute command in"),
});

export const DevSpaceRenderSchema = z.object({
  profile: z.string().optional().describe("DevSpace profile to use"),
  workingDirectory: z.string().optional().describe("Working directory to execute command in"),
}); 
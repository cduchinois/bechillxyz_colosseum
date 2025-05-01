export interface ConvexDocument {
  _id: string;
  _creationTime: number;
}

export interface ResourceData extends ConvexDocument {
  name: string;
  content: string;
  mimeType: string;
  description?: string;
}

export interface ToolResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface QueryArgs {
  filter?: string;
  limit?: number;
}

// Type guard for query arguments
export function isValidQueryArgs(args: any): args is QueryArgs {
  return (
    typeof args === "object" &&
    args !== null &&
    (args.filter === undefined || typeof args.filter === "string") &&
    (args.limit === undefined || typeof args.limit === "number")
  );
}

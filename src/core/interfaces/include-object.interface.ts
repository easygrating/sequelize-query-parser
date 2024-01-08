import { WhereType } from "../types";

/**
 * Interface for generated include objects.
 */
export interface IncludeObject {
  association: string;
  required: boolean;
  include?: IncludeObject[];
  where?: WhereType;
}

import { AssociationsAttributesConfig } from "./associations-attributes-config.interface";

/**
 * Query parser attributes config interface
 */
export interface AttributesConfig {
  include: string[];
  exclude: string[];
  associations: AssociationsAttributesConfig[];
}

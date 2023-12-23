import { Model } from "sequelize";
import { LibConfigOptionsInterface } from "../interfaces/lib-config-options.interface";
import { DEFAULT_CUSTOM_MIDDLEWARES_PATH } from "../constants";

/**
 * Singleton class for library setup
 */
export class QueryParserConfig {
  private static instance: QueryParserConfig | undefined = undefined;
  private config: LibConfigOptionsInterface;

  private constructor() {
    this.config = {
      models: [],
      customMiddlewaresPath: DEFAULT_CUSTOM_MIDDLEWARES_PATH,
    };
  }

  /**
   *
   * Get library configuration instance
   *
   * @returns configuration instance
   */
  static getConfig() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new QueryParserConfig();
    return this.instance;
  }

  /**
   * Sequelize models
   */
  get models(): (typeof Model)[] {
    return this.config.models;
  }

  /**
   * Get custom middlewares folder path
   */
  get customMiddlewaresPath() {
    return this.config.customMiddlewaresPath;
  }

  /**
   * Update library configuration values
   *
   * @param options configuration options
   */
  configure(options: Partial<LibConfigOptionsInterface>) {
    this.config = { ...this.config, ...options };
  }
}

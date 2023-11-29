import { OrderType } from "./order-type";
import { WhereType } from "./where-type";

/**
 * `QueryType` is used to define the structure of a QUERY clause in a Sequelize SELECT type function.
 * */
export type QueryType = {
  attributes?: any;
  where?: WhereType;
  include?: any;
  order?: OrderType[];
  offset: number;
  limit: number;
};

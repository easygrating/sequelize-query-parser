import { NextFunction, Request, Response } from "express";
import { col, Model, ModelStatic } from "sequelize";

/**
 * Middleware to create a Sequelize query order object. The `req.query.order`
 * value, for example `date:desc,order=name:asc`, will yield a
 * Sequelize order object as follows:
 * @example
 * ```js
 * [
 *  [col('date'), 'DESC'],
 *  [col('name'), 'ASC']
 * ]
 * ```
 * By default, the `createdAt` attribute is used, obtained from the model's attributes,
 * or the `primaryKey` in descending order if `createdAt` is not present, in case
 * `req.query.order` is not defined.
 *
 * @param req - Express Request object.
 * @param res - Express Response object.
 * @param next - Express NextFunction to pass control to the next middleware/controller.
 */
export async function order<T extends Model>(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // @ts-ignore since sequelizeQueryParser does not exist on req object by default.
    const model = req.sequelizeQueryParser.model as ModelStatic<T>;

    const primaryKey = model.primaryKeyAttribute;
    const attributes = Object.keys(model.getAttributes());
    const timestampKey = attributes.find((key) => {
      const attribute = model.getAttributes()[key];
      return attribute?.field === "createdAt";
    });

    let order: [any, "ASC" | "DESC"][] = [
      [col(timestampKey ? timestampKey : primaryKey), "DESC"],
    ];

    const rawOrder = req.query.order;
    if (rawOrder && typeof rawOrder === "string") {
      const parsedOrder = rawOrder.split(",").map((item) => {
        const [column, direction] = item.split(":");
        // Check if the specified column exists in the model's attributes
        if (!attributes.includes(column)) {
          // Handle when the attribute doesn't exist in the model
          throw new Error(`Attribute '${column}' not found in the model`);
        }
        return [col(column), direction.toUpperCase()] as [any, "ASC" | "DESC"];
      });
      order = parsedOrder;
    }

    // @ts-ignore since sequelizeQueryParser does not exist on req object by default.
    req.sequelizeQueryParser.order = order;

    next();
  } catch (error) {
    // Handle errors
    console.error("Error in order middleware:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const MODEL_NOT_FOUND_ERROR: string =
  "Model not found. Check that req.params.model is a pluralization of an existing model name or that modelName param matches with a existing model";
export const SEQUELIZE_QUERY_PARSER_DATA_NOT_FOUND_ERROR: string =
  "The req.sequelizeQueryParser property was not found or is possibly undefined. Check that your parser middlewares are in the correct order, starting with buildModel()";

export const MODEL_NOT_FOUND_ERROR: string =
  "Model not found. Check that req.params.model is a pluralization of an existing model name or that modelName param matches with a existing model";
export const SEQUELIZE_QUERY_PARSER_DATA_NOT_FOUND_ERROR: string =
  "The req.sequelizeQueryParser property was not found or is possibly undefined. Check that your parser middlewares are in the correct order, starting with buildModel()";
export const TIMESTAMP_ATTRIBUTE: string = "createdAt";
export const MODEL_NOT_CONFIGURED_ERROR =
  "To use 'buildAttributes' you first must configure a model using 'buildModel' middleware";
export const ATTRIBUTE_NOT_FOUND_ERROR =
  "Attribute '{1}' was not found in the model";
export const INVALID_SEARCH_ATTRIBUTES_ERROR =
  "Invalid search attribute(s) or attribute type(s)";
export const INVALID_NUMBER = "The param send is not a valid number";
export const INVALID_DATE = "The param send is not a valid date";
export const WHERE_CLAUSE_NOT_FOUND_ERROR =
  "To use 'buildSearch' you first must configure a 'where' clause using 'buildWhere' middleware";
export const MODEL_ATTRIBUTE_NOT_FOUND =
  "Attribute '{1}' does not belong to model '{2}'";
export const INVALID_FILTER = "Invalid filter '{1}'";
export const INVALID_INCLUDE = "Invalid association for model '{1}'";

# sequelize-query-parser

Sequelize Query Parser is a middleware library for Express.js designed to simplify the process of parsing client requests and creating Sequelize-compatible queries effortlessly.

# Installation

You can install Sequelize Query Parser via npm:

```bash
npm install @easygrating/sequelize-query-parser
```

# Features

- Parse Express.js request data into Sequelize-compatible queries.
- Build where clauses for Sequelize queries based on request parameters.
- Specify attributes to include/exclude in query responses.
- Enable searching within string or text attributes of Sequelize models.
- Define query ordering and sorting attributes easily.
- Pagination support with limit and skip parameters.

## Middleware Functions

- `buildModel(db, modelName?)`: Extracts the database model to be used in the query from the request params or set by the user.
- `buildAttributes`: Selects attributes to include/exclude in the query response from query params. Example query: `?attributes=name,age` will generate: 
```js 
{ select: ['name', 'age'] } 
```
- `buildWhere`: Builds the where clause for Sequelize queries using the query params from the client. Example query: `?age=30` will generate:
```js
{ where: { age: 30 } }
```
- `buildSearch`: Enables searching within string or text parameters of the model. Example query: `?search=Zeus` will generate:
```js
{ where: { [Op.iLike]: { name: '%Zeus%'} } }
```
- `buildOrder`: Specifies the order and attribute for sorting the query results. Example query: `?order=age:asc,name:desc` will generate:
```js
{ order: [ [col('name'), 'DESC'], [col('age'), 'ASC'] ] }
```
- `buildQuery()`: Builds a valid Sequelize query object, using the resulting object from the previous middlewares use. Finally this will generate Sequelize-compatible query object:
```js
{ 
  select: ['name', 'age'], 
  where: { [Op.iLike]: { name: '%Zeus%'}, age: 30 }, 
  order: [[col('name'), 'DESC'], [col('age'), 'ASC']] 
}
```

# Implementation

After installing

1. Import the middleware functions into your Express.js application.
```javascript
// Import required functions
const { buildModel, buildWhere, buildAttributes, buildSearch, buildOrder, buildQuery } = require('@easygrating/sequelize-query-parser');
// ...
```

2. Apply the middleware functions to your routes.

Example usage within an Express.js route:

```js
// Sample route implementing Sequelize Query Parser middlewares
app.get('/api/:model', buildModel(db, 'YourModelName'), buildWhere, buildAttributes, buildSearch, buildOrder, buildQuery(), async (req, res) => {
  // Execute Sequelize query
  const query = req.sequelizeQueryParser.query;
  try{
    await YourModelName.findAll(query)
    res.json(result);
  }catch(error){ 
    res.status(500).json({ error: error.message });
  }
});
```

# License
This project is licensed under the MIT License.

# Keywords
`sequelize`, `query`, `parser`
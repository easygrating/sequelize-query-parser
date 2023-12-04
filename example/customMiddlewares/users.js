module.exports = {
  modelName: "User",
  route: "users",
  customMiddleware: (req, res, next) => {
    console.log("hello from ", this.name);
    next();
  },
};

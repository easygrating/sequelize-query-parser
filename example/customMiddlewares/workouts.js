module.exports = {
  modelName: "Workout",
  route: "workouts",
  customMiddleware: (req, res, next) => {
    console.log("hello from ", this.name);
    next();
  },
};

const transformToJSON = (schema) => {
  schema.set("toJSON", {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString();
      delete returnedObject._id;
      delete returnedObject.__v;
      delete returnedObject.password;
    },
  });
};

export { transformToJSON };

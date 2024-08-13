const User = require("../models/User");

const users = [
  {
    email: "alice.johnson@example.com",
    password: "$2b$10$rsxYGBy3tHl3kNDk92p5LOQ/f2z7rV4qt/EAbFZ3Wc/uz1bKLhY/G",
    verificationToken:
      "1f77ede5ff0c7bf8d2500a32521c5eb35687e53de290ad3b95a9ffc2ba9cc348",
  },
  {
    email: "bob.smith@example.com",
    password: "$2b$10$ot6/BLkLNTI3UYXa7QYMkuhN1gCSWHgfC/Bq9uwO/ieg4b7UdtRnK",
    verificationToken:
      "d493acc7eb685718fe0e544f9d8033fcba95d97f81ef04178629983be2c8737c",
  },
];

const initialUsers = users.map((user) => {
  user.verificationTokenExpiration = Date.now() + 24 * 60 * 60 * 1000;
  return user;
});

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((user) => user.toJSON());
};

module.exports = { usersInDb, initialUsers };

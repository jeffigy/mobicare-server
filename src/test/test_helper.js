const User = require("../models/User");

const initialUsers = [
  {
    email: "alice.johnson@example.com",
    password: "$2b$10$rsxYGBy3tHl3kNDk92p5LOQ/f2z7rV4qt/EAbFZ3Wc/uz1bKLhY/G",
    verificationToken:
      "1f77ede5ff0c7bf8d2500a32521c5eb35687e53de290ad3b95a9ffc2ba9cc348",
    verificationTokenExpiration: Date.now() + 24 * 60 * 60 * 1000,
  },
  {
    email: "bob.smith@example.com",
    password: "$2b$10$ot6/BLkLNTI3UYXa7QYMkuhN1gCSWHgfC/Bq9uwO/ieg4b7UdtRnK",
    verified: true,
  },
  {
    email: "carol.davis@example.com",
    password: "$2a$12$7jF7ogMirmaQPK/9TmEDm.fe2DaXzLbegEiQFdwT4eUgsFS/bGu/S",
    verified: true,
    active: false,
  },
  {
    email: "dave.wilson@example.com",
    password: "$2a$12$.nI1ZlgeFcAB.WMbVQln7.iWESE4sIybl.YFM3Br8yarAeykkCjru",
    verificationToken:
      "1f77ede5ff0c7bf8d2500a32521c5eb35687e53de290ad3b95a9ffc2ba9cc348",
    verificationTokenExpiration: Date.now() - 24 * 60 * 60 * 1000,
  },
];

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((user) => user.toJSON());
};

module.exports = { usersInDb, initialUsers };

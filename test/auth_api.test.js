const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");
const { initialUsers, usersInDb } = require("./test_helper");
const api = supertest(app);

beforeEach(async () => {
  await User.deleteMany({});
  await User.insertMany(initialUsers);
});

describe("Registering user", () => {
  jest.setTimeout(10000);
  test("should not proceed with missing data", async () => {
    const newUser = {
      email: "johndoe@gmail.com",
      password: "",
    };
    await api.post("/auth/signup").send(newUser).expect(400);

    const usersAtEnd = await usersInDb();
    expect(usersAtEnd).toHaveLength(initialUsers.length);
  });

  test("fails with status 409 with duplicate email", async () => {
    const newUser = {
      email: "bob.smith@example.com",
      password: "B0bSm1th2024",
    };

    await api.post("/auth/signup").send(newUser).expect(409);
  });

  test("succeeds with valid data", async () => {
    const newUser = {
      email: "johndoe@gmail.com",
      password: "1234",
    };

    await api
      .post("/auth/signup")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await usersInDb();

    expect(usersAtEnd).toHaveLength(initialUsers.length + 1);

    const emails = usersAtEnd.map((user) => user.email);
    expect(emails).toContain("johndoe@gmail.com");
  });
});

describe("Verifying email", () => {
  test("returns status 400 if without token", async () => {
    await api.get("/auth/verify/").expect(400);
  });

  test("fails with status 400 if token is invalid", async () => {
    const token =
      "1f77ede5ff0c7bf8d2500a32521c5eb35687e53de290ad3b95a9ffc2ba9cc347";
    await api.get(`/auth/verify/${token}`).expect(400);
  });

  test("succeeds with correct token", async () => {
    const token =
      "1f77ede5ff0c7bf8d2500a32521c5eb35687e53de290ad3b95a9ffc2ba9cc348";

    await api
      .get(`/auth/verify/${token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await usersInDb();

    const user = usersAtEnd.find(
      (user) => user.email === "alice.johnson@example.com"
    );
    expect(user.verified).toEqual(true);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

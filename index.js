const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 5000;

app.use(express.json());

const filePath = path.join(__dirname, "users.json");

// helper functions
const readUsers = () => {
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
};

const writeUsers = (users) => {
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
};

////////////////////////////////////////////////
// 1️ POST /user (add user – email unique)
app.post("/user", (req, res) => {
  const users = readUsers();
  const { name, age, email } = req.body;

  const exists = users.find(u => u.email === email);
  if (exists) {
    return res.status(409).json({ message: "Email already exists" });
  }

  const newUser = {
    id: users.length + 1,
    name,
    age,
    email
  };

  users.push(newUser);
  writeUsers(users);

  res.status(201).json({ message: "User added successfully", user: newUser });
});

////////////////////////////////////////////////
// 2️ PATCH /user/:id (update user)
app.patch("/user/:id", (req, res) => {
  const users = readUsers();
  const id = parseInt(req.params.id);

  const user = users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const { name, age, email } = req.body;
  if (name) user.name = name;
  if (age) user.age = age;
  if (email) user.email = email;

  writeUsers(users);
  res.json({ message: "User updated", user });
});

////////////////////////////////////////////////
// 3️ DELETE /user/:id
app.delete("/user/:id", (req, res) => {
  const users = readUsers();
  const id = parseInt(req.params.id);

  const index = users.findIndex(u => u.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  users.splice(index, 1);
  writeUsers(users);

  res.json({ message: "User deleted successfully" });
});

////////////////////////////////////////////////
// 4️ GET /user/getByName?name=ali
app.get("/user/getByName", (req, res) => {
  const users = readUsers();
  const { name } = req.query;

  const user = users.find(u => u.name === name);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
});

////////////////////////////////////////////////
// 5️ GET /user (get all users)
app.get("/user", (req, res) => {
  const users = readUsers();
  res.json(users);
});

////////////////////////////////////////////////
// 6️ GET /user/filter?minAge=25
app.get("/user/filter", (req, res) => {
  const users = readUsers();
  const minAge = parseInt(req.query.minAge);

  if (isNaN(minAge)) {
    return res.status(400).json({ message: "minAge is required" });
  }

  const result = users.filter(u => u.age >= minAge);
  res.json(result);
});

////////////////////////////////////////////////
// 7️ GET /user/:id
app.get("/user/:id", (req, res) => {
  const users = readUsers();
  const id = parseInt(req.params.id);

  const user = users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
});

////////////////////////////////////////////////
// Not Found
app.use( (req, res) => {
  res.status(404).json({ message: "Not Found" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
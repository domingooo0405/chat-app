const users = [];

//  addUser removeUser getUser getUsersInRoom

const addUser = ({ id, username, room }) => {
  // clean data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // valid the data
  if (!username || !room) {
    return {
      error: "Username and room are required",
    };
  }

  // Check for existing user

  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  //   validate username
  if (existingUser) {
    return {
      error: "Username is in use!",
    };
  }

  //   Store user

  const user = { id, username, room };

  users.push(user);
  return { user };
};

// addUser({
//   id: 22,
//   username: "Andrew",
//   room: "room",
// });

const removeUser = (id) => {
  const index = users.findIndex((user) => {
    return user.id === id;
  });
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUserById = (id) => {
  return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
};
// console.log(users);
// console.log(getUserById(22));
// console.log(getUsersInRoom("Room"));
// console.log(removeUser(22));
// console.log(users);

module.exports = {
  addUser,
  removeUser,
  getUserById,
  getUsersInRoom,
};

const connections = new Map();

async function addConnectedUser(user) {
  connections.set(user.socketId, {
    userOneId: user.oneId,
    userType: user.type,
  });

  const addedUser = connections.get(user.socketId);

  return { user: addedUser };
}

async function checkUserExists(socketId) {
  const userExists = connections.has(socketId);

  return userExists;
}

async function removeConnectedUser(socketId) {
  const removed = connections.delete(socketId);
  console.log(`Removed: ${removed}`);
  return;
}

module.exports = {
  connections,
  addConnectedUser,
  removeConnectedUser,
  checkUserExists,
};

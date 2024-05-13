const connections = new Map();

async function addConnectedUser(user) {
  console.log(user);
  connections.set(user.oneId, {
    userSocket: user.socketId,
    userType: user.type,
  });

  const addedUser = connections.get(user.oneId);

  return { user: addedUser };
}

async function removeConnectedUser(oneId) {
  connections.delete(oneId);
  return;
}

module.exports = { connections, addConnectedUser, removeConnectedUser };

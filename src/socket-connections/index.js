const connections = new Map()

// Connections
async function addConnectedUser(user) {
	connections.set(user.socketId, {
		userOneId: user.oneId,
		userType: user.type,
		userSocketId: user.socketId,
	})

	const addedUser = connections.get(user.socketId)

	return { user: addedUser }
}

async function checkUserExists(socketId) {
	const userExists = connections.get(socketId)

	if (!userExists) {
		return { exists: false }
	}

	return { exists: true, user: userExists }
}

async function removeConnectedUser(socketId) {
	const removed = connections.delete(socketId)
	console.log(`Removed: ${removed}`)
	return
}

async function countOnlineDrivers() {
	let count = 0
	connections.forEach(value => {
		if (value.userType === 'driver') {
			count++
		}
	})
	return count
}

module.exports = {
	connections,
	addConnectedUser,
	removeConnectedUser,
	checkUserExists,
	countOnlineDrivers,
}
// Connections end

require('dotenv').config()
const express = require('express')
const router = express.Router()
const {
	checkIfAdminExistsOnServer,
	auth,
	checkAdminsData,
	getAllDrivers,
} = require('../controllers/admin.controller')
const { checkAvailability, checkBoth } = require('../middleware/admin.middleware')

// check if there is any admins registered on the server
// RETURNS: {count: number}
router.get('/check-admins', checkIfAdminExistsOnServer)

// auth
router.post('/auth', auth)

// check admin's data
router.get('/check/:oneId', checkAdminsData)

// get all driver's data
router.get('/drivers/all', checkAvailability, checkBoth, getAllDrivers)

module.exports = router

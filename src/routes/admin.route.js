require('dotenv').config()
const express = require('express')
const router = express.Router()
const {
	checkIfAdminExistsOnServer,
	auth,
	checkAdminsData,
} = require('../controllers/admin.controller')

// check if there is any admins registered on the server
// RETURNS: {count: number}
router.get('/check-admins', checkIfAdminExistsOnServer)

// auth
router.post('/auth', auth)

// check admin's data
router.get('/check/:oneId', checkAdminsData)
module.exports = router

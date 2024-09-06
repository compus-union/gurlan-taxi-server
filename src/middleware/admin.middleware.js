const { PrismaClient, AdminType } = require('@prisma/client')
const prisma = new PrismaClient()
const { verifyToken } = require('../utils/jwt.util')
const { ADMIN_TOKEN, SUPER_ADMIN_TOKEN } = require('../configs/token.config')
const { PASSWORD_FOR_EMERGENCE_LOGIN_DRIVER } = require('../configs/other.config')

async function checkAvailability(req, res, next) {
	try {
		const { adminId } = req.body

		const admin = await prisma.admin.count({
			where: { oneId: adminId },
		})

		if (!admin) {
			return res.json({
				status: 'forbidden',
				msg: 'Admin akkaunti topilmadi',
				id: adminId,
			})
		}

		return next()
	} catch (error) {
		return res.status(500).json(error)
	}
}

async function checkAdmin(req, res, next) {
	try {
		if (!req.headers['authorization']) {
			return res.json({ status: 'bad', msg: 'Sizga mumkin emas (token mavjud emas)' })
		}

		const token = req.headers['authorization'].split(' ')[1]

		const verifiedToken = await verifyToken(token, ADMIN_TOKEN)

		if (!verifiedToken) {
			return res.json({
				status: 'forbidden',
				msg: "Sizda ruxsat yo'q (not admin)",
			})
		}

		return next()
	} catch (error) {
		return res.status(500).json(error)
	}
}

async function checkSuperAdmin(req, res, next) {
	try {
		if (!req.headers['authorization']) {
			return res.json({ status: 'bad', msg: 'Sizga mumkin emas (token mavjud emas)' })
		}

		const token = req.headers['authorization'].split(' ')[1]

		const verifiedToken = await verifyToken(token, SUPER_ADMIN_TOKEN)

		if (verifiedToken.superAdmin !== PASSWORD_FOR_EMERGENCE_LOGIN_DRIVER) {
			return res.json({
				status: 'forbidden',
				msg: "Sizda ruxsat yo'q (not super-admin)",
			})
		}

		return next()
	} catch (error) {
		return res.status(500).json(error)
	}
}

async function checkBoth(req, res, next) {
	try {
		if (!req.headers['authorization']) {
			return res.json({ status: 'bad', msg: 'Sizga mumkin emas (token mavjud emas)' })
		}

		const token = req.headers['authorization'].split(' ')[1]

		const verifiedAdminToken = await verifyToken(token, ADMIN_TOKEN)
		const verifiedSuperAdminToken = await verifyToken(token, SUPER_ADMIN_TOKEN)

		if (!verifiedAdminToken && !verifiedSuperAdminToken) {
			return res.json({
				status: 'forbidden',
				msg: "Sizda ruxsat yo'q (not admin or super-admin)",
			})
		}

		return next()
	} catch (error) {
		return res.status(500).json(error)
	}
}

module.exports = {
	checkAvailability,
	checkAdmin,
	checkSuperAdmin,
	checkBoth,
}

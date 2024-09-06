const { PrismaClient } = require('@prisma/client')
const { ADMIN_TOKEN, SUPER_ADMIN_TOKEN } = require('../configs/token.config.js')
const { createPassword, checkPassword } = require('../utils/password.util')
const { createToken } = require('../utils/jwt.util.js')
const { PASSWORD_FOR_EMERGENCE_LOGIN_DRIVER } = require('../configs/other.config')
const { verifyToken } = require('../utils/jwt.util')

const prisma = new PrismaClient()

/**
 * @param {Request} req
 * @param {Response} res
 * @returns
 */
async function checkIfAdminExistsOnServer(req, res) {
	try {
		const adminExists = await prisma.admin.count()

		return res.json({ count: adminExists })
	} catch (error) {
		return res.status(500).json(error)
	}
}

/**
 * @param {Request} req
 * @param {Response} res
 * @returns
 */
async function auth(req, res) {
	try {
		const { oneId, password, emergencyPassword } = req.body

		const adminExists = await prisma.admin.count()

		// admin mavjud bo'lmasa => parol hashlaydi, yangi admin yaratadi, yangi token yaratadi, userga jo'natadi
		if (!adminExists) {
			const hashPass = await createPassword(password)

			const newAdmin = await prisma.admin.create({ data: { oneId, password: hashPass } })

			if (emergencyPassword && emergencyPassword === PASSWORD_FOR_EMERGENCE_LOGIN_DRIVER) {
				const token = await createToken(
					{ ...newAdmin, superAdmin: PASSWORD_FOR_EMERGENCE_LOGIN_DRIVER },
					SUPER_ADMIN_TOKEN
				)

				return res.json({
					status: 'super-ok',
					msg: 'Yangi super admin yaratildi!',
					token,
					admin: newAdmin,
				})
			}

			const token = await createToken(newAdmin, ADMIN_TOKEN)

			return res.json({ status: 'ok', msg: 'Yangi admin yaratildi!', token, admin: newAdmin })
		}

		const adminWithCurrentOneId = await prisma.admin.findUnique({ where: { oneId } })

		// user kiritgan oneId bo'yicha admin topilmasa xabar beriladi
		if (!adminWithCurrentOneId) {
			return res.json({ status: 'bad', msg: 'Siz kiritgan OneId xato' })
		}

		const isPasswordCorrect = await checkPassword(password, adminWithCurrentOneId.password)

		// parol togri yoki notogriligi aniqlanadi
		if (!isPasswordCorrect) {
			return res.json({ status: 'bad', msg: 'Siz kiritgan parol xato' })
		}

		if (emergencyPassword && emergencyPassword !== PASSWORD_FOR_EMERGENCE_LOGIN_DRIVER) {
			return res.json({ status: 'bad', msg: 'Super admin uchun favqulodda parol xato' })
		}

		if (emergencyPassword && emergencyPassword === PASSWORD_FOR_EMERGENCE_LOGIN_DRIVER) {
			const token = await createToken(
				{ ...adminWithCurrentOneId, superAdmin: PASSWORD_FOR_EMERGENCE_LOGIN_DRIVER },
				SUPER_ADMIN_TOKEN
			)

			return res.json({
				status: 'super-ok',
				msg: 'Super admin sifatida tizimga kirildi',
				token,
				admin: adminWithCurrentOneId,
			})
		}

		// parol togri bolsa token yaratiladi va userga jonatiladi

		const token = await createToken(adminWithCurrentOneId, ADMIN_TOKEN)

		return res.json({ status: 'ok', msg: 'Tizimga kirildi', admin: adminWithCurrentOneId, token })
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

/**
 * @param {Request} req
 * @param {Response} res
 * @returns
 */
async function checkAdminsData(req, res) {
	try {
		const { oneId } = req.params
		const existAdmin = await prisma.admin.findUnique({ where: { oneId } })

		if (!existAdmin) {
			return res.json({ status: 'bad', msg: "Bu OneId bo'yicha admin topilmadi" })
		}

		const headers = req.headers['authorization']

		if (!headers) {
			return res.json({ status: 'bad', msg: 'Headers mavjud emas' })
		}

		const token = headers.split(' ')[1]

		if (!token) {
			return res.json({ status: 'bad', msg: 'Token mavjud emas' })
		}

		const isTokenValidForAdmin = await verifyToken(token, ADMIN_TOKEN)
		const isTokenValidForSuperAdmin = await verifyToken(token, SUPER_ADMIN_TOKEN)

		if (!isTokenValidForAdmin && !isTokenValidForSuperAdmin) {
			return res.json({
				status: 'bad',
				msg: 'Token ikkala admin uchun ham yaroqsiz!',
				admin: isTokenValidForAdmin,
				superAdmin: isTokenValidForSuperAdmin,
			})
		}

		if (isTokenValidForAdmin) {
			if (isTokenValidForAdmin.oneId !== oneId) {
				return res.json({
					status: 'bad',
					msg: 'Tokendagi oneId tizimda mavjud emas (oddiy admin)',
				})
			}

			if (isTokenValidForAdmin.superAdmin) {
				return res.json({
					status: 'bad',
					msg: 'Oddiy admin favqulodda parolni olishi mumkin emas',
				})
			}

			const newToken = await createToken(existAdmin, ADMIN_TOKEN)

			return res.json({ status: 'ok', msg: 'Token yaroqli!', token: newToken, admin: existAdmin })
		}

		if (isTokenValidForSuperAdmin) {
			if (isTokenValidForSuperAdmin.oneId !== oneId) {
				return res.json({
					status: 'bad',
					msg: 'Tokendagi oneId tizimda mavjud emas (super admin)',
				})
			}

			if (!isTokenValidForSuperAdmin.superAdmin) {
				return res.json({
					status: 'bad',
					msg: 'Super adminda favqulodda parol mavjud emas',
				})
			}

			if (isTokenValidForSuperAdmin.superAdmin !== PASSWORD_FOR_EMERGENCE_LOGIN_DRIVER) {
				return res.json({
					status: 'bad',
					msg: 'Super adminda favqulodda parol xato',
				})
			}

			const newToken = await createToken(
				{ ...existAdmin, superAdmin: PASSWORD_FOR_EMERGENCE_LOGIN_DRIVER },
				SUPER_ADMIN_TOKEN
			)

			return res.json({
				status: 'ok',
				msg: 'Token yaroqli!',
				token: newToken,
				admin: existAdmin,
			})
		}
	} catch (error) {
		return res.status(500).json(error)
	}
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns
 */
async function getAllDrivers(req, res) {
	try {
		const driversCount = await prisma.driver.count()

		const driversList = await prisma.driver.findMany({
			include: { ban: true, car: true, earnings: true, rides: true },
		})

		if (!driversList) {
			return res.json({ status: 'bad', msg: 'Haydovchilar mavjud emas!' })
		}

		let drivers = []

		driversList.forEach(driver => {
			drivers.push({
				...driver,
				car: {},
				carDetails: `${driver.car.name} ${driver.car.number}`,
				carOneId: driver.car.oneId,
			})
		})

		return res.json({ status: 'ok', drivers, count: driversCount })
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

module.exports = { checkIfAdminExistsOnServer, auth, checkAdminsData, getAllDrivers }

const { Schema, model } = require('mongoose')

const rideSchema = new Schema(
	{
		oneId: {
			type: String,
			required: true,
			unique: true,
		},
		from: {
			type: {
				lng: Number,
				lat: Number,
				displayName: String,
			},
			required: true,
		},
		to: {
			type: {
				lng: Number,
				lat: Number,
				displayName: String,
			},
			required: true,
		},
		driverAddress: {
			type: {
				lng: Number,
				lat: Number,
				displayName: String,
			},
			default: {},
		},
		driverId: {
			type: String,
			default: '',
		},
		clientId: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			default: 'CLIENT_LOOKING', //   CANCELLED_BY_CLIENT, CANCELLED_BY_DRIVER, CANCELLED_BY_SERVER, CLIENT_LOOKING, CLIENT_WAITING, DRIVER_WAITING, ON_THE_WAY, FINISHED
		},
		price: {
			type: String,
			required: true,
		},
		startedAt: {
			type: Date,
			default: null,
		},
		arrivedAt: {
			type: Date,
			default: null,
		},
		rideType: {
			type: String, // STANDARD,
			required: true,
		},
		distanceToClient: {
			type: Object,
			required: true,
		},
	},
	{ timestamps: true }
)

/**
 * clientLooking - client is requesting a driver
 * clientWaiting - driver found, he is going
 * driverWaiting - driver came to client's address, he is waiting for client
 * onTheWay - no waitings, client got in the car, a ride has started
 */

module.exports = model('Ride', rideSchema)

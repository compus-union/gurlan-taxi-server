const { Schema, model } = require("mongoose");

const rideSchema = new Schema(
  {
    oneId: {
      type: String,
      required: true,
      unique: true,
    },
    from: {
      type: Object,
      required: true,
    },
    to: {
      type: Object,
      required: true,
    },
    driverAddress: {
      type: Object,
      default: {},
    },
    driverId: {
      type: String,
      default: "",
    },
    clientId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "clientLooking", // clientLooking, clientWaiting, driverWaiting, onTheWay
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
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

/**
 * clientLooking - client is requesting a driver
 * clientWaiting - driver found, he is going
 * driverWaiting - driver came to client's address, he is waiting for client
 * onTheWay - no waitings, client got in the car, a ride has started
 */

module.exports = model("Ride", rideSchema);

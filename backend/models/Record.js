const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  salesForecast: { type: Number, required: true, default: 0 },
  calboralDDXRxForecast: { type: Number, required: true, default: 0 },
  neuroBRxForecast: { type: Number, required: true, default: 0 },
  zimaxRxForecast: { type: Number, required: true, default: 0 },
  urologicalRxForecast: { type: Number, required: true, default: 0 },
  hormoneRxForecast: { type: Number, required: true, default: 0 },
  torax10RxForecast: { type: Number, required: true, default: 0 },
  opdRxForecast: { type: Number, required: true, default: 0 },
  gpRxForecast: { type: Number, required: true, default: 0 },
  dischargeRxForecast: { type: Number, required: true, default: 0 },
  totalRxForecast: { type: Number, required: true, default: 0 },

  calboralDDXRx: { type: Number, required: true, default: 0 },
  neuroBRx: { type: Number, required: true, default: 0 },
  zimaxRx: { type: Number, required: true, default: 0 },
  urologicalRx: { type: Number, required: true, default: 0 },
  hormonalRx: { type: Number, required: true, default: 0 },
  aceBrand: { type: Number, required: true, default: 0 },
  totalStrategicRx: { type: Number, required: true, default: 0 },
  otherProductsRxSBUC: { type: Number, required: true, default: 0 },
  totalRxs: { type: Number, required: true, default: 0 },

  opdRx: { type: Number, required: true, default: 0 },
  dischargeRx: { type: Number, required: true, default: 0 },
  gpRx: { type: Number, required: true, default: 0 },

  sbuCOrderRouteName: { type: String, required: true, default: "" },
  noOfPartySBUCOrderRoute: { type: Number, required: true, default: 0 },
  noOfCollectedOrderSBUC: { type: Number, required: true, default: 0 },
  noOfNotGivingOrderParty: { type: Number, required: true, default: 0 },
  causeOfNotGivingOrder: { type: String, required: true, default: "" },
  marketTotalOrder: { type: Number, required: true, default: 0 },
  acetab250Order: { type: Number, required: true, default: 0 },
  acetab500Order: { type: Number, required: true, default: 0 },
  torax10TabOrder: { type: Number, required: true, default: 0 },
  feozaOrder: { type: Number, required: true, default: 0 },
  aceDuoOrder: { type: Number, required: true, default: 0 },
  amenavirOrder: { type: Number, required: true, default: 0 },

  rxSendInDIDS: { type: Number, required: true, default: 0 },
  writtenRxInSurveyPad: { type: Number, required: true, default: 0 },
  indoorSurvey: { type: String, required: true, default: "" },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Record", recordSchema);

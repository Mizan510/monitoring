const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Forecast Section
  salesForecast: { type: Number, required: true },
  strategicRxForecast: { type: Number },
  focusRxForecast: { type: Number },

  emergingRxForecast: { type: Number }, // corrected line

  newProductRxForecast: { type: Number },
  opdRxForecast: { type: Number },
  gpRxForecast: { type: Number },
  dischargeRxForecast: { type: Number },
  totalRxForecast: { type: Number },

  // Rx Section
  totalStrategicBasketRx: { type: Number },
  totalFocusBasketRx: { type: Number },
  totalEmergingBasketRx: { type: Number }, // corrected line
  totalNewProductRx: { type: Number },
  totalBasketandNewProductRx: { type: Number },
  opdRx: { type: Number },
  dischargeRx: { type: Number },
  gpRx: { type: Number },
  SBUCRxWithoutBasketandNewProductRx: { type: Number },
  totalRxs: { type: Number },

    // Order Section
  SBUCOrderRouteName: { type: String },
  noOfPartySBUCOrderRoute: { type: Number },
  noOfCollectedOrderSBUC: { type: Number },
  noOfNotGivingOrderParty: { type: Number },
  causeOfNotGivingOrder: { type: String },
  marketTotalOrder: { type: Number },

  //Strategic Basket Orders
  NeuroBOrder: { type: Number }, // corrected line
  CalboralDDXOrder: { type: Number }, // corrected line
  ToraxOrder: { type: Number }, // corrected line
  AceAceplusOrder: { type: Number }, // corrected line

  //Focus Basket Orders
  ZimaxOrder: { type: Number }, // corrected line
  CalboDOrder: { type: Number }, // corrected line
  AnadolAnadolplusOrder: { type: Number }, // corrected line

  //Emerging Basket Orders
  SafyronOrder: { type: Number }, // corrected line
  DBalanceOrder: { type: Number }, // corrected line
  TezoOrder: { type: Number }, // corrected line
  ContilexContilexTSOrder: { type: Number }, // corrected line
  MaxrinMaxrinDOrder: { type: Number }, // corrected line

  newProductOrder: { type: Number },

  // Survey Section
  rxSendInDIDS: { type: Number },
  writtenRxInSurveyPad: { type: Number },
  indoorSurvey: { type: String },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Record", recordSchema);

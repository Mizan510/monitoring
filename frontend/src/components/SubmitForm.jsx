import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api from "../api/api";

const FIELD_GROUPS = [
  // ================= Forecast =================
  [
    { name: "salesForecast", label: "Sales Forecast", type: "number" },
    { name: "strategicRxForecast", label: "Strategic Rx Forecast", type: "number" },
    { name: "focusRxForecast", label: "Focus Rx Forecast", type: "number" },
    { name: "emergingRxForecast", label: "Emerging Rx Forecast", type: "number" },
    { name: "newProductRxForecast", label: "New Product Rx Forecast", type: "number" },
    { name: "opdRxForecast", label: "OPD Rx Forecast", type: "number" },
    { name: "gpRxForecast", label: "GP Rx Forecast", type: "number" },
    { name: "dischargeRxForecast", label: "Discharge Rx Forecast", type: "number" },
    { name: "totalRxForecast", label: "Total Rx Forecast", type: "number", readOnly: true },
  ],

  // ================= Rx Summary =================
  [
    { name: "aceAcePlusRx", label: "Ace / Ace Plus Rx", type: "number" },
    { name: "toraxRx", label: "Torax Rx", type: "number" },
    { name: "calboralDDXRx", label: "Calboral D/DX Rx", type: "number" },
    { name: "neuroBRx", label: "Neuro B Rx", type: "number" },
    {
      name: "totalStrategicBasketRx",
      label: "Total Strategic Basket Rx",
      type: "number",
      readOnly: true,
    },

    { name: "zimaxRx", label: "Zimax Rx", type: "number" },
    { name: "calboDRx", label: "Calbo D Rx", type: "number" },
    { name: "anadolAnadolPlusRx", label: "Anadol / Anadol Plus Rx", type: "number" },
    { name: "totalFocusBasketRx", label: "Total Focus Basket Rx", type: "number", readOnly: true },

    { name: "tezoRx", label: "Tezo Rx", type: "number" },
    { name: "safyronRx", label: "Safyron Rx", type: "number" },
    { name: "maxrinMaxrinDRx", label: "Maxrin / Maxrin D Rx", type: "number" },
    { name: "contilexContilexTSRx", label: "Contilex / Contilex TS Rx", type: "number" },
    { name: "dBalanceRx", label: "D-Balance Rx", type: "number" },
    {
      name: "totalEmergingBasketRx",
      label: "Total Emerging Basket Rx",
      type: "number",
      readOnly: true,
    },

    { name: "totalBasketRx", label: "Total Basket Rx", type: "number", readOnly: true },

    { name: "opdRx", label: "OPD Rx", type: "number" },
    { name: "dischargeRx", label: "Discharge Rx", type: "number" },
    { name: "gpRx", label: "GP Rx", type: "number" },
    {
      name: "SBUCRxWithoutBasketandNewProductRx",
      label: "SBU-C Rx (Without Basket)",
      type: "number",
      readOnly: true,
    },
    { name: "totalRxs", label: "Total Rxs", type: "number", readOnly: true },
  ],

  // ================= Orders =================
  [
    { name: "SBUCOrderRouteName", label: "SBU-C Order Route Name", type: "text" },
    { name: "noOfPartySBUCOrderRoute", label: "No. of Party", type: "number" },
    { name: "noOfCollectedOrderSBUC", label: "Collected Orders", type: "number" },
    { name: "noOfNotGivingOrderParty", label: "Not Giving Order", type: "number", readOnly: true },
    { name: "causeOfNotGivingOrder", label: "Cause of Not Giving Order", type: "text" },
    { name: "marketTotalOrder", label: "Market Total Order", type: "number" },
  ],

  // ================= Strategic Basket =================
  [
    { name: "NeuroBOrder", label: "Neuro B Order", type: "number" },
    { name: "CalboralDDXOrder", label: "Calboral D/DX Order", type: "number" },
    { name: "ToraxOrder", label: "Torax Order", type: "number" },
    { name: "AceAceplusOrder", label: "Ace / Ace Plus Order", type: "number" },
  ],

  // ================= Focus Basket =================
  [
    { name: "ZimaxOrder", label: "Zimax Order", type: "number" },
    { name: "CalboDOrder", label: "Calbo D Order", type: "number" },
    { name: "AnadolAnadolplusOrder", label: "Anadol / Anadol Plus Order", type: "number" },
  ],

  // ================= Emerging Basket =================
  [
    { name: "SafyronOrder", label: "Safyron Order", type: "number" },
    { name: "DBalanceOrder", label: "D-Balance Order", type: "number" },
    { name: "TezoOrder", label: "Tezo Order", type: "number" },
    { name: "ContilexContilexTSOrder", label: "Contilex / Contilex TS Order", type: "number" },
    { name: "MaxrinMaxrinDOrder", label: "Maxrin / Maxrin D Order", type: "number" },
  ],

  // ================= New Product =================
  [
    { name: "FeozaOrder", label: "Feoza Order", type: "number" },
    { name: "AceDuoOrder", label: "Ace Duo Order", type: "number" },
    { name: "AmenavirOrder", label: "Amenavir Order", type: "number" },
  ],

  // ================= Survey =================
  [
    { name: "rxSendInDIDS", label: "Rx Send in DIDS", type: "number" },
    { name: "writtenRxInSurveyPad", label: "Written Rx in Survey Pad", type: "number" },
    { name: "indoorSurvey", label: "Indoor Survey", type: "text" },
  ],
];

export default function SubmitForm() {
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: FIELD_GROUPS.flat().reduce((acc, f) => ({ ...acc, [f.name]: "" }), {}),
  });

  const watchedValues = watch();

  // ✅ Check if user already submitted today
  useEffect(() => {
    const checkSubmission = async () => {
      try {
        const res = await api.get("/records/check-today"); // Backend returns { submitted: true/false }
        setAlreadySubmitted(res.data.submitted);
      } catch (err) {
        console.error("Failed to check today's submission:", err);
      }
    };
    checkSubmission();
  }, []);

  // ✅ Calculate totals dynamically
  useEffect(() => {
    const getNumber = (name) => Math.max(Number(watchedValues[name] || 0), 0);

    // Forecast totals
    const totalRxForecast =
      getNumber("opdRxForecast") + getNumber("gpRxForecast") + getNumber("dischargeRxForecast");

    // ========== Basket Calculations ==========
    // Total Strategic Basket Rx = Ace/Ace Plus Rx + Torax Rx + Calboral D/DX Rx + Neuro B Rx
    const totalStrategicBasketRx =
      getNumber("aceAcePlusRx") +
      getNumber("toraxRx") +
      getNumber("calboralDDXRx") +
      getNumber("neuroBRx");

    // Total Focus Basket Rx = Zimax Rx + Calbo D Rx + Anadol/Anadol Plus Rx
    const totalFocusBasketRx =
      getNumber("zimaxRx") + getNumber("calboDRx") + getNumber("anadolAnadolPlusRx");

    // Total Emerging Basket Rx = Tezo Rx + Safyron Rx + Maxrin/Maxrin D Rx + Contilex/Contilex TS Rx + D-Balance Rx
    const totalEmergingBasketRx =
      getNumber("tezoRx") +
      getNumber("safyronRx") +
      getNumber("maxrinMaxrinDRx") +
      getNumber("contilexContilexTSRx") +
      getNumber("dBalanceRx");

    // Total Basket Rx = Total Strategic Basket Rx + Total Focus Basket Rx + Total Emerging Basket Rx
    const totalBasketRx = totalStrategicBasketRx + totalFocusBasketRx + totalEmergingBasketRx;

    // Total Rx
    const totalRxs = getNumber("opdRx") + getNumber("dischargeRx") + getNumber("gpRx");

    // SBU-C Rx Without Basket
    const SBUCRxWithoutBasketandNewProductRx = Math.max(totalRxs - totalBasketRx, 0);

    // Orders
    const noOfNotGivingOrderParty = Math.max(
      getNumber("noOfPartySBUCOrderRoute") - getNumber("noOfCollectedOrderSBUC"),
      0
    );

    // Set values in form
    setValue("totalRxForecast", totalRxForecast);
    setValue("totalStrategicBasketRx", totalStrategicBasketRx);
    setValue("totalFocusBasketRx", totalFocusBasketRx);
    setValue("totalEmergingBasketRx", totalEmergingBasketRx);
    setValue("totalBasketRx", totalBasketRx);
    setValue("totalRxs", totalRxs);
    setValue("SBUCRxWithoutBasketandNewProductRx", SBUCRxWithoutBasketandNewProductRx);
    setValue("noOfNotGivingOrderParty", noOfNotGivingOrderParty);
  }, [watchedValues, setValue]);

  // ✅ Handle Submit
  const onSubmit = async (data) => {
    if (alreadySubmitted) {
      alert("You have already submitted data today.");
      return;
    }
    try {
      FIELD_GROUPS.flat().forEach((f) => {
        if (f.type === "number") data[f.name] = Math.max(Number(data[f.name]), 0);
      });
      await api.post("/records", data);
      setSuccessMessage("✅ Data submitted successfully!");
      setAlreadySubmitted(true);
      reset();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.msg || "Submit failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {alreadySubmitted && (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded mb-4 text-center font-semibold">
          ⚠️ You have already submitted data today.
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 text-green-800 p-4 rounded mb-4 text-center font-semibold">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {FIELD_GROUPS.map((group, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-xl border-2 shadow-md transition duration-300 ${
              ["bg-blue-50", "bg-green-50", "bg-yellow-50", "bg-pink-50", "bg-purple-50"][idx % 5]
            }`}
          >
            {(() => {
              const sectionTitles = [
                "Forecast Section (Todays Forecast)",
                "Rx Section (Yesterday no. of Rx)",
                "Order Section",
                "Strategic Basket Order",
                "Focus Basket Order",
                "Emerging Basket Order",
                "New Product Order",
                "Survey Section",
              ];
              return (
                <h2 className="font-semibold text-lg mb-4">
                  {sectionTitles[idx] || `Section ${idx + 1}`}
                </h2>
              );
            })()}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {group.map((f) => (
                <div key={f.name} className="flex flex-col">
                  <label className="block text-sm font-medium mb-1">
                    {f.label} <span className="text-red-600">*</span>
                  </label>

                  <input
                    type={f.type}
                    {...register(f.name, {
                      required: true,
                      pattern: [
                        "indoorSurvey",
                        "SBUCOrderRouteName",
                        "causeOfNotGivingOrder",
                      ].includes(f.name)
                        ? {
                            value: /^[A-Za-z\s.,-]+$/,
                            message: "Only text allowed",
                          }
                        : undefined,
                    })}
                    placeholder={
                      ["indoorSurvey", "SBUCOrderRouteName", "causeOfNotGivingOrder"].includes(
                        f.name
                      )
                        ? "Text only (No numbers allowed)"
                        : f.placeholder
                    }
                    className={`border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      f.readOnly || alreadySubmitted ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                    readOnly={f.readOnly || alreadySubmitted}
                    onKeyDown={(e) => {
                      if (
                        ["indoorSurvey", "SBUCOrderRouteName", "causeOfNotGivingOrder"].includes(
                          f.name
                        ) &&
                        /[0-9]/.test(e.key)
                      ) {
                        e.preventDefault();
                      }
                      if (f.type === "number" && e.key === "-") {
                        e.preventDefault();
                      }
                    }}
                  />

                  {errors[f.name] && (
                    <div className="text-red-600 text-sm mt-1">
                      {errors[f.name].message || "Required"}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex flex-col md:flex-row gap-2 justify-center">
          <button
            type="submit"
            disabled={isSubmitting || alreadySubmitted}
            className={`px-6 py-2 rounded text-white font-semibold transition ${
              alreadySubmitted
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isSubmitting ? "Saving..." : alreadySubmitted ? "Already Submitted" : "Submit"}
          </button>

          <button
            type="button"
            onClick={() => reset()}
            disabled={alreadySubmitted}
            className={`px-6 py-2 rounded font-semibold transition ${
              alreadySubmitted ? "bg-gray-300 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

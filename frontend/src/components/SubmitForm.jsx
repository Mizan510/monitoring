import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api from "../api/api";

const FIELD_GROUPS = [
  [
    {
      name: "salesForecast",
      label: "Sales Forecast",
      type: "number",
      placeholder: "Sales Forecast",
    },
    {
      name: "calboralDDXRxForecast",
      label: "Calboral-D/DX Rx forecast",
      type: "number",
      placeholder: "Calboral-D/DX Rx forecast",
    },
    {
      name: "neuroBRxForecast",
      label: "Neuro-B Rx forecast",
      type: "number",
      placeholder: "Neuro-B Rx forecast",
    },
    {
      name: "zimaxRxForecast",
      label: "Zimax Rx forecast",
      type: "number",
      placeholder: "Zimax Rx forecast",
    },
    {
      name: "urologicalRxForecast",
      label: "Urological Rx forecast",
      type: "number",
      placeholder: "Urological Rx forecast",
    },
    {
      name: "hormoneRxForecast",
      label: "Hormone Rx forecast",
      type: "number",
      placeholder: "Hormone Rx forecast",
    },
    {
      name: "torax10RxForecast",
      label: "Torax 10 RxForecast",
      type: "number",
      placeholder: "Torax 10 RxForecast",
    },
    {
      name: "opdRxForecast",
      label: "OPD Rx forecast",
      type: "number",
      placeholder: "OPD Rx forecast",
    },
    {
      name: "gpRxForecast",
      label: "GP Rx forecast",
      type: "number",
      placeholder: "GP Rx forecast",
    },
    {
      name: "dischargeRxForecast",
      label: "Discharge Rx forecast",
      type: "number",
      placeholder: "Discharge Rx forecast",
    },
    {
      name: "totalRxForecast",
      label: "Total Rx forecast",
      type: "number",
      placeholder: "Total Rx forecast",
      readOnly: true,
    },
  ],
  [
    {
      name: "calboralDDXRx",
      label: "Calboral-D/DX Rx",
      type: "number",
      placeholder: "Calboral-D/DX Rx",
    },
    { name: "neuroBRx", label: "Neuro-B Rx", type: "number", placeholder: "Neuro-B Rx" },
    { name: "zimaxRx", label: "Zimax Rx", type: "number", placeholder: "Zimax Rx" },
    { name: "urologicalRx", label: "Urological Rx", type: "number", placeholder: "Urological Rx" },
    { name: "hormonalRx", label: "Hormonal Rx", type: "number", placeholder: "Hormonal Rx" },
    { name: "aceBrand", label: "Ace Brand", type: "number", placeholder: "Ace Brand" },
    {
      name: "totalStrategicRx",
      label: "Total Strategic Rx",
      type: "number",
      placeholder: "Total Strategic Rx",
      readOnly: true,
    },
    {
      name: "otherProductsRxSBUC",
      label: "Other Products Rx of SBU-C",
      type: "number",
      placeholder: "Other Products Rx of SBU-C",
      readOnly: true,
    },
    {
      name: "totalRxs",
      label: "Total Rxs",
      type: "number",
      placeholder: "Total Rxs",
      readOnly: true,
    },
  ],
  [
    { name: "opdRx", label: "OPD Rx", type: "number", placeholder: "OPD Rx" },
    { name: "dischargeRx", label: "Discharge Rx", type: "number", placeholder: "Discharge Rx" },
    { name: "gpRx", label: "GP Rx", type: "number", placeholder: "GP Rx" },
  ],
  [
    {
      name: "sbuCOrderRouteName",
      label: "SBU-C Order Route Name",
      type: "text",
      placeholder: "SBU-C Order Route Name",
    },
    {
      name: "noOfPartySBUCOrderRoute",
      label: "No# of party in SBU-C Order Route",
      type: "number",
      placeholder: "No# of party in SBU-C Order Route",
    },
    {
      name: "noOfCollectedOrderSBUC",
      label: "No# of Collected order by SBU-C",
      type: "number",
      placeholder: "No# of Collected order by SBU-C",
    },
    {
      name: "noOfNotGivingOrderParty",
      label: "No# of Not giving order party",
      type: "number",
      placeholder: "No# of Not giving order party",
      readOnly: true,
    },
    {
      name: "causeOfNotGivingOrder",
      label: "Cause of Not giving order",
      type: "text",
      placeholder: "Cause of Not giving order",
    },
    {
      name: "marketTotalOrder",
      label: "Market Total Order (All SBU)",
      type: "number",
      placeholder: "Market Total Order (All SBU)",
    },
    {
      name: "acetab250Order",
      label: "AceTab (250's) Order",
      type: "number",
      placeholder: "AceTab (250's) Order",
    },
    {
      name: "acetab500Order",
      label: "AceTab (500's) Order",
      type: "number",
      placeholder: "AceTab (500's) Order",
    },
    {
      name: "torax10TabOrder",
      label: "Torax 10 TabOrder",
      type: "number",
      placeholder: "Torax 10 TabOrder",
    },
    { name: "tezo200Order", label: "Tezo 200Order", type: "number", placeholder: "Tezo 200Order" },
  ],
  [
    {
      name: "rxSendInDIDS",
      label: "Rx send in DIDS",
      type: "number",
      placeholder: "Rx send in DIDS",
    },
    {
      name: "writtenRxInSurveyPad",
      label: "Written Rx in Survey Pad",
      type: "number",
      placeholder: "Written Rx in Survey Pad",
    },
    { name: "indoorSurvey", label: "Indoor survey", type: "text", placeholder: "Indoor survey" },
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
    const totalRxForecast =
      getNumber("opdRxForecast") + getNumber("gpRxForecast") + getNumber("dischargeRxForecast");
    const totalStrategicRx =
      getNumber("calboralDDXRx") +
      getNumber("neuroBRx") +
      getNumber("zimaxRx") +
      getNumber("urologicalRx") +
      getNumber("hormonalRx") +
      getNumber("aceBrand");
    const totalRxs = getNumber("opdRx") + getNumber("dischargeRx") + getNumber("gpRx");
    const otherProducts = Math.max(totalRxs - totalStrategicRx, 0);
    const noOfNotGivingOrderParty = Math.max(
      getNumber("noOfPartySBUCOrderRoute") - getNumber("noOfCollectedOrderSBUC"),
      0
    );

    setValue("totalRxForecast", totalRxForecast);
    setValue("totalStrategicRx", totalStrategicRx);
    setValue("totalRxs", totalRxs);
    setValue("otherProductsRxSBUC", otherProducts);
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
                "Hospital Rx",
                "Order Section",
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
                    {...register(f.name, { required: true, min: 0 })}
                    placeholder={f.placeholder}
                    className={`border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      f.readOnly || alreadySubmitted ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                    readOnly={f.readOnly || alreadySubmitted}
                    onKeyDown={(e) => e.key === "-" && e.preventDefault()}
                  />
                  {errors[f.name] && (
                    <div className="text-red-600 text-sm mt-1">Required & non-negative</div>
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

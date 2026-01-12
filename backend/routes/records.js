const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const Record = require("../models/Record");
const User = require("../models/User");
const ExcelJS = require("exceljs");

// ===============================
// Create Record
// ===============================
router.post("/", authMiddleware, async (req, res) => {
  try {
    const payload = { ...req.body, userId: req.user.id };

    for (const key in payload) {
      if (!isNaN(payload[key])) {
        payload[key] = Math.max(Number(payload[key]), 0);
      }
    }

    const requiredFields = [
      // Forecast (only required one)
      "salesForecast",

      // Optional but validated numeric fields
      "strategicRxForecast",
      "focusRxForecast",
      "emergingRxForecast",
      "newProductRxForecast",
      "opdRxForecast",
      "gpRxForecast",
      "dischargeRxForecast",
      "totalRxForecast",

      // Rx Section
      "aceAcePlusRx",
      "toraxRx",
      "calboralDDXRx",
      "neuroBRx",
      "totalStrategicBasketRx",
      "zimaxRx",
      "calboDRx",
      "anadolAnadolPlusRx",
      "totalFocusBasketRx",
      "tezoRx",
      "safyronRx",
      "maxrinMaxrinDRx",
      "contilexContilexTSRx",
      "dBalanceRx",
      "totalEmergingBasketRx",
      "totalBasketRx",
      "opdRx",
      "dischargeRx",
      "gpRx",
      "SBUCRxWithoutBasketandNewProductRx",
      "totalRxs",

      // Order Section
      "SBUCOrderRouteName",
      "noOfPartySBUCOrderRoute",
      "noOfCollectedOrderSBUC",
      "noOfNotGivingOrderParty",
      "causeOfNotGivingOrder",
      "marketTotalOrder",

      // Strategic Basket
      "NeuroBOrder",
      "CalboralDDXOrder",
      "ToraxOrder",
      "AceAceplusOrder",

      // Focus Basket
      "ZimaxOrder",
      "CalboDOrder",
      "AnadolAnadolplusOrder",

      // Emerging Basket
      "SafyronOrder",
      "DBalanceOrder",
      "TezoOrder",
      "ContilexContilexTSOrder",
      "MaxrinMaxrinDOrder",

      // New Product Orders
      "FeozaOrder",
      "AceDuoOrder",
      "AmenavirOrder",

      // Survey
      "rxSendInDIDS",
      "writtenRxInSurveyPad",
      "indoorSurvey",
    ];

    for (const field of requiredFields) {
      if (
        payload[field] === undefined ||
        payload[field] === null ||
        payload[field] === ""
      ) {
        return res.status(400).json({ msg: `Field "${field}" is required.` });
      }
    }

    const record = await Record.create(payload);
    res.status(201).json({ record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ===============================
// List Records
// ===============================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { start, end, page = 1, pageSize = 50, userId } = req.query;
    const filter = {};

    // Date filtering
    if (start) {
      const s = new Date(start);
      s.setHours(0, 0, 0, 0);
      filter.createdAt = { ...filter.createdAt, $gte: s };
    }
    if (end) {
      const e = new Date(end);
      e.setHours(23, 59, 59, 999);
      filter.createdAt = { ...filter.createdAt, $lte: e };
    }

    // User/Admin filtering
    if (req.user.role === "user") {
      filter.userId = req.user.id;
    } else if (req.user.role === "admin") {
      if (userId) {
        // Ensure the requested user belongs to this admin
        const user = await User.findOne({ _id: userId, adminId: req.user.id });
        if (!user)
          return res.status(403).json({ msg: "Access denied to this user" });
        filter.userId = userId;
      } else {
        // Get all users under this admin
        const users = await User.find({ adminId: req.user.id }).select("_id");
        filter.userId = { $in: users.map((u) => u._id) };
      }
    }

    // Pagination
    const skip = (page - 1) * pageSize;
    const [total, records] = await Promise.all([
      Record.countDocuments(filter),
      Record.find(filter)
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(pageSize))
        .populate("userId", "name email") // include user name and email
        .lean(),
    ]);

    res.json({
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      records,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ===============================
// Export Records to Excel
// ===============================
router.get("/export", authMiddleware, async (req, res) => {
  try {
    const { start, end, userId } = req.query;
    const filter = {};

    // Date filtering
    if (start) {
      const s = new Date(start);
      s.setHours(0, 0, 0, 0);
      filter.createdAt = { ...filter.createdAt, $gte: s };
    }
    if (end) {
      const e = new Date(end);
      e.setHours(23, 59, 59, 999);
      filter.createdAt = { ...filter.createdAt, $lte: e };
    }

    // User/Admin filtering
    if (req.user.role === "user") {
      filter.userId = req.user.id;
    } else if (req.user.role === "admin") {
      if (userId) {
        // Ensure the requested user belongs to this admin
        const user = await User.findOne({ _id: userId, adminId: req.user.id });
        if (!user)
          return res.status(403).json({ msg: "Access denied to this user" });
        filter.userId = userId;
      } else {
        // Get all users under this admin
        const users = await User.find({ adminId: req.user.id }).select("_id");
        filter.userId = { $in: users.map((u) => u._id) };
      }
    }

    // Fetch records with filter
    const records = await Record.find(filter)
      .sort({ createdAt: -1 })
      .populate("userId", "name email")
      .lean();

    // ... rest of your Excel export code remains unchanged

    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Records");

    // Add User section first
    const sections = [
      {
        name: "User Info",
        fields: ["User Name", "User Email"],
        color: "FFD9EAD3",
      },

      // Forecast Section
      {
        name: "Forecast",
        fields: [
          "Created At",
          "Sales Forecast",
          "Strategic Rx Forecast",
          "Focus Rx Forecast",
          "Emerging Rx Forecast",
          "New Product Rx Forecast",
          "OPD Rx Forecast",
          "GP Rx Forecast",
          "Discharge Rx Forecast",
          "Total Rx Forecast",
        ],
        color: "FFCCE5FF",
      },

      // Rx Section
      {
        name: "Rx Summary",
        fields: [
          "Ace / Ace Plus Rx",
          "Torax Rx",
          "Calboral D/DX Rx",
          "Neuro B Rx",
          "Total Strategic Basket Rx",
          "Zimax Rx",
          "Calbo D Rx",
          "Anadol / Anadol Plus Rx",
          "Total Focus Basket Rx",
          "Tezo Rx",
          "Safyron Rx",
          "Maxrin / Maxrin D Rx",
          "Contilex / Contilex TS Rx",
          "D-Balance Rx",
          "Total Emerging Basket Rx",
          "Total Basket Rx",
          "OPD Rx",
          "Discharge Rx",
          "GP Rx",
          "SBU-C Rx (Without Basket)",
          "Total Rxs",
        ],
        color: "FFCCFFCC",
      },

      // Order Section
      {
        name: "Orders",
        fields: [
          "SBU C Order Route Name",
          "No Of Party SBU C Order Route",
          "No Of Collected Order SBU C",
          "No Of Not Giving Order Party",
          "Cause Of Not Giving Order",
          "Market Total Order",
        ],
        color: "FFFFFF99",
      },

      // Strategic Basket Orders
      {
        name: "Strategic Basket Orders",
        fields: [
          "Neuro B Order",
          "Calboral DDX Order",
          "Torax Order",
          "Ace Aceplus Order",
        ],
        color: "FFFFCCCC",
      },

      // Focus Basket Orders
      {
        name: "Focus Basket Orders",
        fields: ["Zimax Order", "Calbo D Order", "Anadol / Anadol Plus Order"],
        color: "FFE5F5CC",
      },

      // Emerging Basket Orders
      {
        name: "Emerging Basket Orders",
        fields: [
          "Safyron Order",
          "D-Balance Order",
          "Tezo Order",
          "Contilex / Contilex TS Order",
          "Maxrin / Maxrin D Order",
        ],
        color: "FFE5CCFF",
      },

      // New Product Orders
      {
        name: "New Product Orders",
        fields: ["Feoza Order", "Ace Duo Order", "Amenavir Order"],
        color: "FFFFE0B3",
      },

      // Survey Section
      {
        name: "Survey",
        fields: [
          "Rx Send In DIDS",
          "Written Rx In Survey Pad",
          "Indoor Survey",
        ],
        color: "FFD9D2E9",
      },
    ];

    const headerToField = {
      // User
      "User Name": "userName",
      "User Email": "userEmail",

      // Forecast
      "Created At": "createdAt",
      "Sales Forecast": "salesForecast",
      "Strategic Rx Forecast": "strategicRxForecast",
      "Focus Rx Forecast": "focusRxForecast",
      "Emerging Rx Forecast": "emergingRxForecast",
      "New Product Rx Forecast": "newProductRxForecast",
      "OPD Rx Forecast": "opdRxForecast",
      "GP Rx Forecast": "gpRxForecast",
      "Discharge Rx Forecast": "dischargeRxForecast",
      "Total Rx Forecast": "totalRxForecast",

      // Rx Summary
      "Ace / Ace Plus Rx": "aceAcePlusRx",
      "Torax Rx": "toraxRx",
      "Calboral D/DX Rx": "calboralDDXRx",
      "Neuro B Rx": "neuroBRx",
      "Total Strategic Basket Rx": "totalStrategicBasketRx",
      "Zimax Rx": "zimaxRx",
      "Calbo D Rx": "calboDRx",
      "Anadol / Anadol Plus Rx": "anadolAnadolPlusRx",
      "Total Focus Basket Rx": "totalFocusBasketRx",
      "Tezo Rx": "tezoRx",
      "Safyron Rx": "safyronRx",
      "Maxrin / Maxrin D Rx": "maxrinMaxrinDRx",
      "Contilex / Contilex TS Rx": "contilexContilexTSRx",
      "D-Balance Rx": "dBalanceRx",
      "Total Emerging Basket Rx": "totalEmergingBasketRx",
      "Total Basket Rx": "totalBasketRx",
      "OPD Rx": "opdRx",
      "Discharge Rx": "dischargeRx",
      "GP Rx": "gpRx",
      "SBU-C Rx (Without Basket)": "SBUCRxWithoutBasketandNewProductRx",
      "Total Rxs": "totalRxs",

      // Orders
      "SBU C Order Route Name": "SBUCOrderRouteName",
      "No Of Party SBU C Order Route": "noOfPartySBUCOrderRoute",
      "No Of Collected Order SBU C": "noOfCollectedOrderSBUC",
      "No Of Not Giving Order Party": "noOfNotGivingOrderParty",
      "Cause Of Not Giving Order": "causeOfNotGivingOrder",
      "Market Total Order": "marketTotalOrder",

      // Strategic Basket
      "Neuro B Order": "NeuroBOrder",
      "Calboral DDX Order": "CalboralDDXOrder",
      "Torax Order": "ToraxOrder",
      "Ace Aceplus Order": "AceAceplusOrder",

      // Focus Basket
      "Zimax Order": "ZimaxOrder",
      "Calbo D Order": "CalboDOrder",
      "Anadol / Anadol Plus Order": "AnadolAnadolplusOrder",

      // Emerging Basket
      "Safyron Order": "SafyronOrder",
      "D-Balance Order": "DBalanceOrder",
      "Tezo Order": "TezoOrder",
      "Contilex / Contilex TS Order": "ContilexContilexTSOrder",
      "Maxrin / Maxrin D Order": "MaxrinMaxrinDOrder",

      // New Product Orders
      "Feoza Order": "FeozaOrder",
      "Ace Duo Order": "AceDuoOrder",
      "Amenavir Order": "AmenavirOrder",

      // Survey
      "Rx Send In DIDS": "rxSendInDIDS",
      "Written Rx In Survey Pad": "writtenRxInSurveyPad",
      "Indoor Survey": "indoorSurvey",
    };

    // Row 1: Section headers
    let colIndex = 1;
    sections.forEach((section) => {
      const startCol = colIndex;
      section.fields.forEach(() => colIndex++);
      const endCol = colIndex - 1;
      ws.mergeCells(1, startCol, 1, endCol);
      const cell = ws.getCell(1, startCol);
      cell.value = section.name;
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: section.color },
      };
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      cell.font = { bold: true };
      for (let c = startCol; c <= endCol; c++) {
        ws.getCell(1, c).border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      }
    });

    ws.getRow(1).height = 35;

    // Row 2: Field headers
    const allFields = sections.flatMap((s) => s.fields);
    const headerRow = ws.addRow(allFields);

    let currentCol = 1;
    sections.forEach((section) => {
      section.fields.forEach(() => {
        const cell = headerRow.getCell(currentCol);
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: section.color },
        };
        cell.font = { bold: true };
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        currentCol++;
      });
    });

    ws.getRow(2).height = 65;

    const numericFields = Object.values(headerToField).filter(
      (f) =>
        ![
          "createdAt",
          "userName",
          "userEmail",
          "SBUCOrderRouteName",
          "causeOfNotGivingOrder",
          "indoorSurvey",
        ].includes(f)
    );

    const totals = {};

    records.forEach((r) => {
      const rowData = allFields.map((f) => {
        const field = headerToField[f];
        if (field === "userName") return r.userId?.name || "";
        if (field === "userEmail") return r.userId?.email || "";
        if (field === "createdAt")
          return r.createdAt ? new Date(r.createdAt).toLocaleString() : "";
        const value = r[field] ?? 0;
        if (numericFields.includes(field))
          totals[field] = (totals[field] || 0) + Number(value);
        return value;
      });

      const row = ws.addRow(rowData);
      let colNum = 1;
      sections.forEach((section) => {
        section.fields.forEach(() => {
          const cell = row.getCell(colNum);
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: section.color },
          };
          cell.alignment = {
            horizontal: "left",
            vertical: "top",
            wrapText: true,
          };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          colNum++;
        });
      });
      row.height = 25;
    });

    // Add totals
    const totalRowData = allFields.map((f) => {
      const field = headerToField[f];
      if (field === "createdAt") return "Total";
      if (numericFields.includes(field)) return totals[field] ?? 0;
      return "";
    });
    const totalRow = ws.addRow(totalRowData);
    totalRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD9D9D9" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    ws.columns.forEach((col) => (col.width = 12));

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Report_${userId || "all"}_${Date.now()}.xlsx`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("❌ Export failed:", err);
    res.status(500).json({ msg: "Export failed" });
  }
});

module.exports = router;

// for email address show in excel column, replace below lines.

// // Add User section first
//     const sections = [
//       { name: 'User Info', fields: ['User Name'], color: 'FFD9EAD3' },

// by below lineS

// Add User section first
//     const sections = [
//       { name: 'User Info', fields: ['User Name', 'User Email'], color: 'FFD9EAD3' },

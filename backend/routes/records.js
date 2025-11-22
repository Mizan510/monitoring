const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const Record = require('../models/Record');
const User = require('../models/User');
const ExcelJS = require('exceljs');

// ===============================
// Create Record
// ===============================
router.post('/', authMiddleware, async (req, res) => {
  try {
    const payload = { ...req.body, userId: req.user.id };

    for (const key in payload) {
      if (!isNaN(payload[key])) {
        payload[key] = Math.max(Number(payload[key]), 0);
      }
    }

    const requiredFields = [
      "salesForecast", "calboralDDXRxForecast", "neuroBRxForecast", "zimaxRxForecast", "urologicalRxForecast",
      "hormoneRxForecast", "torax10RxForecast", "opdRxForecast", "gpRxForecast", "dischargeRxForecast",
      "calboralDDXRx", "neuroBRx", "zimaxRx", "urologicalRx", "hormonalRx", "aceBrand",
      "opdRx", "dischargeRx", "gpRx",
      "sbuCOrderRouteName", "noOfPartySBUCOrderRoute", "noOfCollectedOrderSBUC", "causeOfNotGivingOrder",
      "marketTotalOrder", "acetab250Order", "acetab500Order", "torax10TabOrder", "feozaOrder", "aceDuoOrder", "amenavirOrder",
      "rxSendInDIDS", "writtenRxInSurveyPad", "indoorSurvey"
    ];

    for (const field of requiredFields) {
      if (payload[field] === undefined || payload[field] === null || payload[field] === "") {
        return res.status(400).json({ msg: `Field "${field}" is required.` });
      }
    }

    const record = await Record.create(payload);
    res.status(201).json({ record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ===============================
// List Records
// ===============================
router.get('/', authMiddleware, async (req, res) => {
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
    if (req.user.role === 'user') {
      filter.userId = req.user.id;
    } else if (req.user.role === 'admin') {
      if (userId) {
        // Ensure the requested user belongs to this admin
        const user = await User.findOne({ _id: userId, adminId: req.user.id });
        if (!user) return res.status(403).json({ msg: 'Access denied to this user' });
        filter.userId = userId;
      } else {
        // Get all users under this admin
        const users = await User.find({ adminId: req.user.id }).select('_id');
        filter.userId = { $in: users.map(u => u._id) };
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
        .populate('userId', 'name email') // include user name and email
        .lean()
    ]);

    res.json({ total, page: Number(page), pageSize: Number(pageSize), records });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});


// ===============================
// Export Records to Excel
// ===============================
router.get('/export', authMiddleware, async (req, res) => {
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
    if (req.user.role === 'user') {
      filter.userId = req.user.id;
    } else if (req.user.role === 'admin') {
      if (userId) {
        // Ensure the requested user belongs to this admin
        const user = await User.findOne({ _id: userId, adminId: req.user.id });
        if (!user) return res.status(403).json({ msg: 'Access denied to this user' });
        filter.userId = userId;
      } else {
        // Get all users under this admin
        const users = await User.find({ adminId: req.user.id }).select('_id');
        filter.userId = { $in: users.map(u => u._id) };
      }
    }

    // Fetch records with filter
    const records = await Record.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .lean();

    // ... rest of your Excel export code remains unchanged


    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('Records');


 // Add User section first
    const sections = [
      { name: 'User Info', fields: ['User Name'], color: 'FFD9EAD3' },

      { name: 'Forecasts', fields: ['Created At', 'Sales Forecast', 'Colboral-D/DX Rx Forecast', 'Neuro B Rx Forecast', 'Zimax Rx Forecast', 'Urological Rx Forecast', 'Hormone Rx Forecast', 'Torax 10 Rx Forecast', 'OPD Rx Forecast', 'GP Rx Forecast', 'Discharge Rx Forecast'], color: 'FFCCE5FF' },
      { name: 'Rx Details', fields: ['Colboral-D/DX Rx', 'Neuro B Rx', 'Zimax Rx', 'Urological Rx', 'Hormonal Rx', 'ACE Brand', 'Total Strategic Rx', 'Other Products Rx SBUC', 'Total Rxs'], color: 'FFCCFFCC' },
      { name: 'OPD', fields: ['OPD Rx', 'Discharge Rx', 'GP Rx'], color: 'FFFFFF99' },
      { name: 'SBU Orders', fields: ['SBU C Order Route Name', 'No Of Party SBU C Order Route', 'No Of Collected Order SBU C', 'No Of Not Giving Order Party', 'Cause Of Not Giving Order', 'Market Total Order', 'Acetab 250 Order', 'Acetab 500 Order', 'Torax 10 Tab Order', 'Feoza Order', "Ace Duo Order", "Amenavir Order"], color: 'FFFFCCCC' },
      { name: 'Survey', fields: ['Rx Send In DIDS', 'Written Rx In Survey Pad', 'Indoor Survey'], color: 'FFE5CCFF' },
    ];

    const headerToField = {
      'User Name': 'userName',
      'User Email': 'userEmail',
      'Created At': 'createdAt',
      'Sales Forecast': 'salesForecast',
      'Colboral-D/DX Rx Forecast': 'calboralDDXRxForecast',
      'Neuro B Rx Forecast': 'neuroBRxForecast',
      'Zimax Rx Forecast': 'zimaxRxForecast',
      'Urological Rx Forecast': 'urologicalRxForecast',
      'Hormone Rx Forecast': 'hormoneRxForecast',
      'Torax 10 Rx Forecast': 'torax10RxForecast',
      'OPD Rx Forecast': 'opdRxForecast',
      'GP Rx Forecast': 'gpRxForecast',
      'Discharge Rx Forecast': 'dischargeRxForecast',
      'Colboral-D/DX Rx': 'calboralDDXRx',
      'Neuro B Rx': 'neuroBRx',
      'Zimax Rx': 'zimaxRx',
      'Urological Rx': 'urologicalRx',
      'Hormonal Rx': 'hormonalRx',
      'ACE Brand': 'aceBrand',
      'Total Strategic Rx': 'totalStrategicRx',
      'Other Products Rx SBUC': 'otherProductsRxSBUC',
      'Total Rxs': 'totalRxs',
      'OPD Rx': 'opdRx',
      'Discharge Rx': 'dischargeRx',
      'GP Rx': 'gpRx',
      'SBU C Order Route Name': 'sbuCOrderRouteName',
      'No Of Party SBU C Order Route': 'noOfPartySBUCOrderRoute',
      'No Of Collected Order SBU C': 'noOfCollectedOrderSBUC',
      'No Of Not Giving Order Party': 'noOfNotGivingOrderParty',
      'Cause Of Not Giving Order': 'causeOfNotGivingOrder',
      'Market Total Order': 'marketTotalOrder',
      'Acetab 250 Order': 'acetab250Order',
      'Acetab 500 Order': 'acetab500Order',
      'Torax 10 Tab Order': 'torax10TabOrder',
      'Feoza Order': 'feozaOrder',
      'Ace Duo Order': 'aceDuoOrder',
      'Amenavir Order': 'amenavirOrder',
      'Rx Send In DIDS': 'rxSendInDIDS',
      'Written Rx In Survey Pad': 'writtenRxInSurveyPad',
      'Indoor Survey': 'indoorSurvey'
    };

    // Row 1: Section headers
    let colIndex = 1;
    sections.forEach(section => {
      const startCol = colIndex;
      section.fields.forEach(() => colIndex++);
      const endCol = colIndex - 1;
      ws.mergeCells(1, startCol, 1, endCol);
      const cell = ws.getCell(1, startCol);
      cell.value = section.name;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: section.color } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.font = { bold: true };
      for (let c = startCol; c <= endCol; c++) {
        ws.getCell(1, c).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      }
    });

    ws.getRow(1).height = 35;

    // Row 2: Field headers
    const allFields = sections.flatMap(s => s.fields);
    const headerRow = ws.addRow(allFields);

    let currentCol = 1;
    sections.forEach(section => {
      section.fields.forEach(() => {
        const cell = headerRow.getCell(currentCol);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: section.color } };
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        currentCol++;
      });
    });

    ws.getRow(2).height = 65;

    const numericFields = Object.values(headerToField).filter(
      f => f !== 'createdAt' && f !== 'sbuCOrderRouteName' && f !== 'userName' && f !== 'userEmail'
    );
    const totals = {};

    records.forEach(r => {
      const rowData = allFields.map(f => {
        const field = headerToField[f];
        if (field === 'userName') return r.userId?.name || '';
        if (field === 'userEmail') return r.userId?.email || '';
        if (field === 'createdAt') return r.createdAt ? new Date(r.createdAt).toLocaleString() : '';
        const value = r[field] ?? 0;
        if (numericFields.includes(field)) totals[field] = (totals[field] || 0) + Number(value);
        return value;
      });

      const row = ws.addRow(rowData);
      let colNum = 1;
      sections.forEach(section => {
        section.fields.forEach(() => {
          const cell = row.getCell(colNum);
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: section.color } };
          cell.alignment = { horizontal: 'left', vertical: 'top', wrapText: true };
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          colNum++;
        });
      });
      row.height = 25;
    });

    // Add totals
    const totalRowData = allFields.map(f => {
      const field = headerToField[f];
      if (field === 'createdAt') return 'Total';
      if (numericFields.includes(field)) return totals[field] ?? 0;
      return '';
    });
    const totalRow = ws.addRow(totalRowData);
    totalRow.eachCell(cell => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    ws.columns.forEach(col => (col.width = 12));

    res.setHeader('Content-Disposition', `attachment; filename=Report_${userId || 'all'}_${Date.now()}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('❌ Export failed:', err);
    res.status(500).json({ msg: 'Export failed' });
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
 
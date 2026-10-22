const SPREADSHEET_ID = '1QrzhgSbYyD6X5bm9XyVCE2OEBEpqqSCqWcIh5maRhqI';
const BUDGET_SOURCE = 'quan-nuong-budget-v1';
const CHECKLIST_SOURCE = 'quan-nuong-checklist-v1';

// Google ContentService can finish a POST by redirecting the HTTP client to a
// GET request.  Supabase follows that redirect, so keep a JSON health response
// here instead of letting Apps Script return its default HTML error page.
function doGet() {
  return json_({ ok: true, endpoint: 'quan-nuong-sheet-sync', updatedAt: new Date().toISOString() });
}

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (![BUDGET_SOURCE, CHECKLIST_SOURCE].includes(payload.source) || !Array.isArray(payload.rows)) {
      return json_({ ok: false, error: 'Yêu cầu không hợp lệ.' });
    }

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const defaultSheet = payload.source === CHECKLIST_SOURCE ? 'CHECKLIST' : 'PHÂN BỔ NGÂN SÁCH';
    const sheet = spreadsheet.getSheetByName(payload.sheetName || defaultSheet);
    if (!sheet) return json_({ ok: false, error: 'Không tìm thấy tab ' + defaultSheet + '.' });
    const render = payload.source === CHECKLIST_SOURCE ? renderChecklist_ : renderBudget_;

    try {
      render(sheet, payload.rows);
    } catch (error) {
      // Older versions of this workbook used a native Google Sheets table.
      // That table can block deleting multiple columns. Recreate the tab once,
      // then all later syncs keep the same clean seven-column sheet.
      if (!String(error).includes('single column')) throw error;
      const originalName = sheet.getName();
      const originalIndex = sheet.getIndex();
      const replacement = spreadsheet.insertSheet('__SHEET_SYNC_' + Date.now(), originalIndex);
      render(replacement, payload.rows);
      spreadsheet.deleteSheet(sheet);
      replacement.setName(originalName);
    }
    return json_({ ok: true, rows: payload.rows.length, updatedAt: new Date().toISOString() });
  } catch (error) {
    return json_({ ok: false, error: String(error && error.message ? error.message : error) });
  }
}

function renderChecklist_(sheet, rows) {
  const columnCount = 7;
  sheet.getDataRange().breakApart();
  sheet.clear();
  if (sheet.getMaxColumns() < columnCount) sheet.insertColumnsAfter(sheet.getMaxColumns(), columnCount - sheet.getMaxColumns());
  if (sheet.getMaxColumns() > columnCount) sheet.deleteColumns(columnCount + 1, sheet.getMaxColumns() - columnCount);

  const requiredRows = Math.max(30, rows.length + 6);
  if (sheet.getMaxRows() < requiredRows) sheet.insertRowsAfter(sheet.getMaxRows(), requiredRows - sheet.getMaxRows());
  if (sheet.getMaxRows() > requiredRows) sheet.deleteRows(requiredRows + 1, sheet.getMaxRows() - requiredRows);

  sheet.getRange('A1:G1').merge().setValue('CHECKLIST');
  sheet.getRange('A2:G2').merge().setValue('Dữ liệu từ ứng dụng · Cập nhật ' + Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm'));
  sheet.getRange('A4:G4').setValues([['Nhóm', 'Công việc', 'Người phụ trách', 'Trạng thái', 'Ưu tiên', 'Hạn hoàn thành', 'Ghi chú']]);

  if (rows.length) {
    const values = rows.map(row => [row.category, row.title, row.assignee || 'Chưa giao', row.status, row.priority, row.deadline || '', row.note || '']);
    sheet.getRange(5, 1, values.length, columnCount).setValues(values);
    sheet.getRange(5, 1, values.length, columnCount).setVerticalAlignment('middle').setWrap(true);
    sheet.getRange(5, 1, values.length, columnCount).setBorder(true, true, true, true, true, true, '#d6dfeb', SpreadsheetApp.BorderStyle.SOLID);
    sheet.getRange(5, 6, values.length, 1).setNumberFormat('dd/MM/yyyy').setHorizontalAlignment('center');
    mergeGroups_(sheet, rows, 5);
    styleTaskStatuses_(sheet, rows, 5);
    renderTaskTotals_(sheet, rows, 5 + rows.length);
  }

  sheet.getRange('A1:G1').setBackground('#172a46').setFontColor('#ffffff').setFontSize(17).setFontWeight('bold').setHorizontalAlignment('center');
  sheet.getRange('A2:G2').setBackground('#eaf2ff').setFontColor('#52657c').setFontSize(9).setHorizontalAlignment('center');
  sheet.getRange('A4:G4').setBackground('#244e7c').setFontColor('#ffffff').setFontWeight('bold').setHorizontalAlignment('center').setVerticalAlignment('middle');
  sheet.setFrozenRows(4);
  sheet.setRowHeight(1, 38);
  sheet.setRowHeight(2, 25);
  sheet.setRowHeight(4, 34);
  sheet.setColumnWidth(1, 160);
  sheet.setColumnWidth(2, 270);
  sheet.setColumnWidth(3, 130);
  sheet.setColumnWidth(4, 125);
  sheet.setColumnWidth(5, 110);
  sheet.setColumnWidth(6, 135);
  sheet.setColumnWidth(7, 290);
  sheet.getRange(1, 1, requiredRows, columnCount).setFontFamily('Arial');
}

function styleTaskStatuses_(sheet, rows, startRow) {
  rows.forEach((row, index) => {
    const status = sheet.getRange(startRow + index, 4);
    const priority = sheet.getRange(startRow + index, 5);
    if (row.status === 'Hoàn thành') status.setBackground('#dff5e8').setFontColor('#18794e');
    else if (row.status === 'Đang làm') status.setBackground('#e1efff').setFontColor('#2463a5');
    else if (row.status === 'Quá hạn') status.setBackground('#ffe4e7').setFontColor('#b42336');
    else status.setBackground('#edf1f6').setFontColor('#607086');
    if (row.priority === 'Khẩn cấp') priority.setFontColor('#b42336');
    else if (row.priority === 'Cao') priority.setFontColor('#a86108');
    else priority.setFontColor('#52657c');
    status.setFontWeight('bold').setHorizontalAlignment('center');
    priority.setFontWeight('bold').setHorizontalAlignment('center');
  });
}

function renderTaskTotals_(sheet, rows, rowNumber) {
  const totals = rows.reduce((sum, row) => {
    sum.total++;
    if (row.status === 'Hoàn thành') sum.done++;
    else if (row.status === 'Đang làm') sum.doing++;
    else if (row.status === 'Quá hạn') sum.overdue++;
    else sum.todo++;
    return sum;
  }, { total: 0, todo: 0, doing: 0, done: 0, overdue: 0 });
  const range = sheet.getRange(rowNumber, 1, 1, 7);
  range.setValues([['TỔNG CÔNG VIỆC', totals.total, 'Cần làm ' + totals.todo, 'Đang làm ' + totals.doing, 'Hoàn thành ' + totals.done, 'Quá hạn ' + totals.overdue, '']]);
  range.setBackground('#173550').setFontColor('#dcecff').setFontWeight('bold').setHorizontalAlignment('center').setVerticalAlignment('middle');
  range.setBorder(true, true, true, true, true, true, '#4c82b5', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  sheet.getRange(rowNumber, 1).setFontColor('#9fd0ff');
  sheet.getRange(rowNumber, 5).setFontColor('#70dba6');
  sheet.getRange(rowNumber, 6).setFontColor('#ff9aa6');
  sheet.setRowHeight(rowNumber, 34);
}

function renderBudget_(sheet, rows) {
  const columnCount = 7;
  sheet.getDataRange().breakApart();
  sheet.clear();
  if (sheet.getMaxColumns() < columnCount) sheet.insertColumnsAfter(sheet.getMaxColumns(), columnCount - sheet.getMaxColumns());
  if (sheet.getMaxColumns() > columnCount) sheet.deleteColumns(columnCount + 1, sheet.getMaxColumns() - columnCount);

  const requiredRows = Math.max(30, rows.length + 10);
  if (sheet.getMaxRows() < requiredRows) sheet.insertRowsAfter(sheet.getMaxRows(), requiredRows - sheet.getMaxRows());
  if (sheet.getMaxRows() > requiredRows) sheet.deleteRows(requiredRows + 1, sheet.getMaxRows() - requiredRows);

  sheet.getRange('A1:G1').merge().setValue('PHÂN BỔ NGÂN SÁCH');
  sheet.getRange('A2:G2').merge().setValue('Dữ liệu từ ứng dụng · Cập nhật ' + Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm'));
  sheet.getRange('A4:G4').setValues([['Nhóm chi phí', 'Hạng mục', 'Dự toán', 'Nam đã chi', 'Phương đã chi', 'Trạng thái', 'Ghi chú']]);

  if (rows.length) {
    const values = rows.map(row => [row.category, row.name, Number(row.planned || 0), Number(row.namSpent || 0), Number(row.phuongSpent || 0), row.status, row.note || '']);
    sheet.getRange(5, 1, values.length, columnCount).setValues(values);
    sheet.getRange(5, 3, values.length, 3).setNumberFormat('#,##0"đ"');
    sheet.getRange(5, 1, values.length, columnCount).setVerticalAlignment('middle').setWrap(true);
    sheet.getRange(5, 1, values.length, columnCount).setBorder(true, true, true, true, true, true, '#d6dfeb', SpreadsheetApp.BorderStyle.SOLID);
    mergeGroups_(sheet, rows, 5);
    styleStatuses_(sheet, rows, 5);
    renderTotals_(sheet, rows, 6 + rows.length);
  }

  sheet.getRange('A1:G1').setBackground('#172a46').setFontColor('#ffffff').setFontSize(17).setFontWeight('bold').setHorizontalAlignment('center');
  sheet.getRange('A2:G2').setBackground('#eaf2ff').setFontColor('#52657c').setFontSize(9).setHorizontalAlignment('center');
  sheet.getRange('A4:G4').setBackground('#244e7c').setFontColor('#ffffff').setFontWeight('bold').setHorizontalAlignment('center').setVerticalAlignment('middle');
  sheet.setFrozenRows(4);
  sheet.setRowHeight(1, 38);
  sheet.setRowHeight(2, 25);
  sheet.setRowHeight(4, 34);
  sheet.setColumnWidth(1, 170);
  sheet.setColumnWidth(2, 260);
  sheet.setColumnWidth(3, 120);
  sheet.setColumnWidth(4, 120);
  sheet.setColumnWidth(5, 130);
  sheet.setColumnWidth(6, 125);
  sheet.setColumnWidth(7, 280);
  sheet.getRange(1, 1, requiredRows, columnCount).setFontFamily('Arial');
  sheet.getRange(5, 3, Math.max(rows.length, 1), 3).setHorizontalAlignment('right');
}

function renderTotals_(sheet, rows, rowNumber) {
  const summaries = [
    { label: 'TỔNG ĐÃ CHI', formula: '=SUM(D5:D)+SUM(E5:E)', background: '#15382e', color: '#93efc3', border: '#3a9b76' },
    { label: 'DỰ TOÁN', formula: '=SUM(C5:C)', background: '#192b40', color: '#91a3b8', border: '#45617f' },
    { label: 'NAM ĐÃ CHI', formula: '=SUM(D5:D)', background: '#292446', color: '#c3b5ff', border: '#6a5ca3' },
    { label: 'PHƯƠNG ĐÃ CHI', formula: '=SUM(E5:E)', background: '#15343c', color: '#77dbea', border: '#397b8b' },
  ];

  sheet.setRowHeight(rowNumber - 1, 12);
  summaries.forEach((summary, index) => {
    const currentRow = rowNumber + index;
    const compactRange = sheet.getRange(currentRow, 1, 1, 2);
    const labelCell = sheet.getRange(currentRow, 1);
    const valueCell = sheet.getRange(currentRow, 2);
    labelCell.setValue(summary.label);
    valueCell.setFormula(summary.formula);
    compactRange.setBackground(summary.background).setVerticalAlignment('middle');
    compactRange.setBorder(true, true, true, true, true, true, summary.border, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    labelCell.setFontColor(summary.color).setFontWeight('bold').setFontSize(9).setHorizontalAlignment('left');
    valueCell.setFontColor(summary.color).setFontWeight('bold').setFontSize(11).setNumberFormat('#,##0"đ"').setHorizontalAlignment('right');
    sheet.setRowHeight(currentRow, 30);
  });
}

function mergeGroups_(sheet, rows, startRow) {
  let index = 0;
  while (index < rows.length) {
    let end = index;
    while (end + 1 < rows.length && rows[end + 1].category === rows[index].category) end++;
    const count = end - index + 1;
    const range = sheet.getRange(startRow + index, 1, count, 1);
    if (count > 1) range.merge();
    range.setBackground(index % 2 === 0 ? '#edf5ff' : '#f3f7fb').setFontColor('#23486f').setFontWeight('bold').setHorizontalAlignment('left').setVerticalAlignment('middle');
    index = end + 1;
  }
}

function styleStatuses_(sheet, rows, startRow) {
  rows.forEach((row, index) => {
    const cell = sheet.getRange(startRow + index, 6);
    if (row.status === 'Đã thanh toán') cell.setBackground('#dff5e8').setFontColor('#18794e');
    else if (row.status === 'Một phần') cell.setBackground('#fff1d6').setFontColor('#a86108');
    else cell.setBackground('#edf1f6').setFontColor('#607086');
    cell.setFontWeight('bold').setHorizontalAlignment('center');
  });
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

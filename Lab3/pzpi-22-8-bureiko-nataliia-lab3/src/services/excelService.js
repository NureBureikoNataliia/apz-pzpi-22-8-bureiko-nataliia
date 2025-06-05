const fs = require('fs')
const XLSX = require('xlsx')

function loadAllowedEmailsFromExcel(filePath) {
  const data = fs.readFileSync(filePath)
  const workbook = XLSX.read(data, { type: 'buffer' })
  const sheet = workbook.SheetNames[0]
  const json = XLSX.utils.sheet_to_json(workbook.Sheets[sheet])
  const emails = json.map(row =>
    row.email || row.Email || row.EMAIL || Object.values(row)[0]
  ).filter(email => email && email.includes('@'))

  return emails.map(e => e.toLowerCase().trim())
}

const emails = loadAllowedEmailsFromExcel('C:/Users/PC/source/repos/atarkProjekt/employees.xlsx')
console.log(emails)

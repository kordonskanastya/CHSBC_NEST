import * as XLSX from 'xlsx'
import * as path from 'path'

export class ExelService {
  // async downloadExel(data) {
  //   const wb = new xl.Workbook()
  //   const ws = wb.addWorksheet('2')
  //
  //   const headingColumnNames = []
  //   data.grades.map((gr) => headingColumnNames.push(Object.keys(gr.course)))
  //
  //   let headingColumnIndex = 1
  //   headingColumnNames.forEach((heading) => {
  //     ws.cell(1, headingColumnIndex++).string(heading)
  //   })
  //
  //   let rowIndex = 2
  //   data.grades.forEach((record) => {
  //     let columnIndex = 1
  //     Object.keys(record).forEach((columnName) => {
  //       ws.cell(rowIndex, columnIndex++).string(record[columnName])
  //     })
  //     rowIndex++
  //   })
  //
  //   return new Promise((resolve, reject) => {
  //     const tempPath = path.join(os.tmpdir(), 'qwe')
  //     fs.mkdtemp(tempPath, (err, folder) => {
  //       if (err) return reject(err)
  //       const file_name = path.join('ind.xlsx')
  //       wb.write(file_name)
  //       return resolve(file_name)
  //     })
  //   })
  // }

  exportUsersToExcel(dataFrom) {
    const headingColumnNames = []
    const worksheetName = 'shew'
    const filePath = './src/upload/stud.xlsx'
    dataFrom.grades.map((gr) => headingColumnNames.push(Object.keys(gr.course)))
    const data = dataFrom.grades.map((grade) => {
      return [grade.course]
    })
    const workBook = XLSX.utils.book_new() // Create a new workbook
    const worksheetData = [headingColumnNames[0], ...data]
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    XLSX.utils.book_append_sheet(workBook, worksheet, worksheetName)

    XLSX.writeFile(workBook, path.resolve(filePath))
    return filePath
  }
}

import * as XLSX from 'xlsx'
import * as path from 'path'
import * as os from 'os'
import * as fs from 'fs'
import { randomUUID } from 'crypto'

export class ExelService {
  exportUsersToExcel(dataFrom) {
    const headingColumnNames = [
      'Предмет',
      'Викладач',
      'Кількість кредитів',
      'Кількість аудиторних годин',
      'Форма контролю',
      'Оцінка',
      'Тип',
    ]
    const worksheetName = 'Індивідуальний план'
    const filePath = `student-individual-plan_${randomUUID()}.xlsx`
    const data = dataFrom.grades.map((grade) => {
      return [
        grade.course.name,
        `${grade.course.teacher.lastName} ${grade.course.teacher.firstName[0]}.${grade.course.teacher.patronymic[0]}`,
        grade.course.credits,
        grade.course.lectureHours,
        grade.course.isExam ? 'Екзамен' : 'Залік',
        grade.grade,
        grade.course.isCompulsory ? `Обов'язковий` : 'Профільний',
      ]
    })
    const workBook = XLSX.utils.book_new()
    const worksheetData = [headingColumnNames, ...data]
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    XLSX.utils.book_append_sheet(workBook, worksheet, worksheetName)
    return new Promise((resolve, reject) => {
      const tempPath = path.join(os.tmpdir(), 'foobar-')
      fs.mkdtemp(tempPath, (err, folder) => {
        if (err) return reject(err)
        const file_name = path.join(folder, filePath)
        XLSX.writeFile(workBook, path.resolve(file_name))
        resolve(file_name)
      })
    })
  }
}

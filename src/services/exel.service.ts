import * as XLSX from 'xlsx'
import * as path from 'path'
import * as os from 'os'
import * as fs from 'fs'
import { randomUUID } from 'crypto'
import { CourseType } from '../api/courses/courses.service'

export class ExelService {
  exportIndividualPlanToExcel(data) {
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
    const fileName = `student-individual-plan_${randomUUID()}.xlsx`
    const dataToExport = data.grades.map((grade) => {
      return [
        grade.course.name,
        `${grade.course.teacher.lastName} ${grade.course.teacher.firstName[0]}.${grade.course.teacher.patronymic[0]}`,
        grade.course.credits,
        grade.course.lectureHours,
        grade.course.isExam ? 'Екзамен' : 'Залік',
        grade.grade,
        grade.course.type === (CourseType.GENERAL_COMPETENCE || CourseType.PROFESSIONAL_COMPETENCE)
          ? `Обов'язковий`
          : `Вибірковий`,
      ]
    })
    const worksheetData = [headingColumnNames, ...dataToExport]
    return this.getPathOfTempFileWithData(headingColumnNames, worksheetData, worksheetName, fileName)
  }

  exportGradesToExel(data) {
    const headingColumnNames = ['ПІБ', 'Група', ...data.grades.map((grade) => grade.course.name)]
    const worksheetName = 'Оцінки'
    const fileName = `student-grades_${randomUUID()}.xlsx`
    const dataToExport = [
      `${data.user.lastName} ${data.user.firstName[0]}.${data.user.patronymic[0]}`,
      data.group.name,
      ...data.grades.map((grade) => {
        return [grade.grade]
      }),
    ]
    const worksheetData = [headingColumnNames, dataToExport]

    return this.getPathOfTempFileWithData(headingColumnNames, worksheetData, worksheetName, fileName)
  }

  getPathOfTempFileWithData(headingColumnNames, worksheetData, worksheetName, fileName) {
    const workBook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    XLSX.utils.book_append_sheet(workBook, worksheet, worksheetName)

    return new Promise((resolve, reject) => {
      const tempPath = path.join(os.tmpdir(), 'foobar-')
      fs.mkdtemp(tempPath, (err, folder) => {
        if (err) return reject(err)
        const file_name = path.join(folder, fileName)
        XLSX.writeFile(workBook, path.resolve(file_name))
        resolve(file_name)
      })
    })
  }
}

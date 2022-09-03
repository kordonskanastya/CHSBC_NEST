import { Expose } from 'class-transformer'

export class GetVoteForStudentPageDto {
  @Expose()
  requiredCourses: number[]

  @Expose()
  notRequiredCourses: number[]
}

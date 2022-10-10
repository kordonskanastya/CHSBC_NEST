import { Expose } from 'class-transformer'

export class GetStudentVoteDto {
  @Expose()
  table: number

  @Expose()
  courseId: number
}

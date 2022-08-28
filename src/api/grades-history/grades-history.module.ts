import { forwardRef, Module } from '@nestjs/common'
import { GradesHistoryService } from './grades-history.service'
import { GradesHistoryController } from './grades-history.controller'
import { gradesHistoryProviders } from './entities/grades-history.providers'
import { DatabaseModule } from '../../database.module'
import { StudentsModule } from '../students/students.module'

@Module({
  imports: [DatabaseModule, forwardRef(() => StudentsModule)],
  controllers: [GradesHistoryController],
  providers: [GradesHistoryService, ...gradesHistoryProviders],
  exports: [GradesHistoryService, ...gradesHistoryProviders],
})
export class GradesHistoryModule {}

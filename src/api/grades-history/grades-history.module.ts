import { Module } from '@nestjs/common'
import { GradesHistoryService } from './grades-history.service'
import { GradesHistoryController } from './grades-history.controller'
import { gradesHistoryProviders } from './entities/grades-history.providers'
import { DatabaseModule } from '../../database.module'

@Module({
  imports: [DatabaseModule],
  controllers: [GradesHistoryController],
  providers: [GradesHistoryService, ...gradesHistoryProviders],
  exports: [GradesHistoryService, ...gradesHistoryProviders],
})
export class GradesHistoryModule {}

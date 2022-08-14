import { Module } from '@nestjs/common'
import { VotingService } from './voting.service'
import { VotingController } from './voting.controller'
import { votingProviders } from './entities/voting.providers'
import { DatabaseModule } from '../../database.module'

@Module({
  imports: [DatabaseModule],
  controllers: [VotingController],
  providers: [VotingService, ...votingProviders],
  exports: [VotingService, ...votingProviders],
})
export class VotingModule {}

import { Module } from '@nestjs/common';
import { RepositoryTokensController } from './repository-tokens.controller';
import { RepositoryTokensService } from './repository-tokens.service';

@Module({
  controllers: [RepositoryTokensController],
  providers: [RepositoryTokensService],
  exports: [RepositoryTokensService],
})
export class RepositoryTokensModule {}

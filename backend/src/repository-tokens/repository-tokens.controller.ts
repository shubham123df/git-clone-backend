import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { RepositoryTokensService } from './repository-tokens.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateTokenDto } from './dto/create-token.dto';

@Controller('repository-tokens')
@UseGuards(JwtAuthGuard)
export class RepositoryTokensController {
  constructor(private readonly service: RepositoryTokensService) {}

  @Post()
  setToken(@CurrentUser() user: { sub: string }, @Body() dto: CreateTokenDto) {
    return this.service.setToken(user.sub, dto);
  }

  @Get()
  list(@CurrentUser() user: { sub: string }) {
    return this.service.list(user.sub);
  }

  @Delete(':provider')
  revoke(@CurrentUser() user: { sub: string }, @Param('provider') provider: string) {
    return this.service.revoke(user.sub, provider.toUpperCase());
  }
}

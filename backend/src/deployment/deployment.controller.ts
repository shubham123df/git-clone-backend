import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { DeploymentService } from './deployment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateDeploymentDto } from './dto/update-deployment.dto';

@Controller('pull-requests/:prId/deployment')
@UseGuards(JwtAuthGuard)
export class DeploymentController {
  constructor(private readonly deploymentService: DeploymentService) {}

  @Get()
  getReadiness(@Param('prId') prId: string) {
    return this.deploymentService.getReadiness(prId);
  }

  @Post('ready')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'RELEASE_MANAGER')
  markReady(@Param('prId') prId: string, @CurrentUser() user: { sub: string }) {
    return this.deploymentService.markReady(prId, user.sub);
  }

  @Post('deploy')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'RELEASE_MANAGER')
  markDeployed(@Param('prId') prId: string, @CurrentUser() user: { sub: string }) {
    return this.deploymentService.markDeployed(prId, user.sub);
  }

  @Patch()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'RELEASE_MANAGER')
  update(@Param('prId') prId: string, @CurrentUser() user: { sub: string }, @Body() dto: UpdateDeploymentDto) {
    return this.deploymentService.update(prId, user.sub, dto);
  }
}

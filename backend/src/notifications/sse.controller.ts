import { Controller, Get, UseGuards, Res, Req } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SseService } from './sse.service';

@Controller('sse')
@UseGuards(JwtAuthGuard)
export class SseController {
  constructor(private readonly sseService: SseService) {}

  @Get('notifications')
  async notifications(
    @Req() req: Request,
    @Res() res: Response,
    @CurrentUser() user: { sub: string }
  ) {
    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    // Send initial connection event
    res.write(`data: ${JSON.stringify({ type: 'connected', userId: user.sub })}\n\n`);

    // Add connection to SSE service
    this.sseService.addConnection(user.sub, res);

    // Handle client disconnect
    req.on('close', () => {
      this.sseService.removeConnection(user.sub, res);
    });

    // Send keep-alive every 30 seconds
    const keepAlive = setInterval(() => {
      try {
        res.write(`data: ${JSON.stringify({ type: 'keep-alive' })}\n\n`);
      } catch (error) {
        clearInterval(keepAlive);
        this.sseService.removeConnection(user.sub, res);
      }
    }, 30000);
  }
}

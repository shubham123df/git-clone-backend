import { Controller, Post, Headers, Body, RawBodyRequest, Req } from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('github')
  async github(
    @Headers('x-hub-signature-256') signature: string,
    @Req() req: RawBodyRequest<Request> & { rawBody?: Buffer },
    @Body() body: Record<string, unknown>,
  ) {
    const raw = req.rawBody ?? Buffer.from(JSON.stringify(body));
    return this.webhookService.handleGitHub(signature, raw, body);
  }

  @Post('gitlab')
  async gitlab(
    @Headers('x-gitlab-token') token: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.webhookService.handleGitLab(token, body);
  }
}

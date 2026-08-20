import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.interface';
import { AnalyticsService } from './analytics.service';
import { PagesService } from './pages.service';
import { TrackEventDto } from './dto/track-event.dto';

@Controller()
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly pagesService: PagesService,
  ) {}

  @Get('public/pages/:slug')
  async getPublishedPage(@Param('slug') slug: string) {
    return this.pagesService.getPublishedPage(slug);
  }

  @Get('pages/:pageId/analytics')
  @UseGuards(JwtAuthGuard)
  async getAnalytics(
    @Param('pageId') pageId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.analyticsService.getAnalytics(user.id, pageId, from, to);
  }

  @Post('public/pages/:slug/track')
  async trackEvent(
    @Param('slug') slug: string,
    @Body() trackEventDto: TrackEventDto,
  ) {
    return this.analyticsService.trackEvent(slug, trackEventDto);
  }
}

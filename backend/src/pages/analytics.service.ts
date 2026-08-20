import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Analytics } from './schemas/analytics.schema';
import { Page } from './schemas/page.schema';
import { TrackEventDto } from './dto/track-event.dto';

export interface ComponentClickSummary {
  componentId?: string;
  componentType?: string;
  clicks: number;
}

interface AnalyticsQuery {
  pageId: Types.ObjectId;
  timestamp?: {
    $gte?: Date;
    $lte?: Date;
  };
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel('Analytics') private readonly analyticsModel: Model<Analytics>,
    @InjectModel('Page') private readonly pageModel: Model<Page>,
  ) {}

  // Track event (public, no auth)
  async trackEvent(slug: string, trackEventDto: TrackEventDto) {
    const page = await this.pageModel.findOne({ slug });
    if (!page) {
      throw new NotFoundException('Page not found');
    }

    await this.analyticsModel.create({
      pageId: page._id,
      eventType: trackEventDto.eventType,
      componentId: trackEventDto.componentId,
      componentType: trackEventDto.componentType,
      timestamp: new Date(),
    });

    return { success: true };
  }

  // Query analytics
  async getAnalytics(
    userId: string,
    pageId: string,
    from?: string,
    to?: string,
  ) {
    // Verify ownership
    const page = await this.pageModel.findById(pageId);
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    if (page.userId.toString() !== userId) {
      throw new ForbiddenException('Unauthorized');
    }

    // Build date filter
    const query: AnalyticsQuery = {
      pageId: new Types.ObjectId(pageId),
    };
    if (from || to) {
      query.timestamp = {};
      if (from) {
        query.timestamp.$gte = new Date(from);
      }
      if (to) {
        query.timestamp.$lte = new Date(to);
      }
    }

    // Get all events
    const events = await this.analyticsModel.find(query);

    // Count totals
    const totalViews = events.filter((e) => e.eventType === 'view').length;
    const totalClicks = events.filter((e) => e.eventType === 'click').length;

    // Views by date
    const viewsByDateMap: Record<string, number> = {};
    events
      .filter((e) => e.eventType === 'view')
      .forEach((e) => {
        const date = e.timestamp.toISOString().split('T')[0];
        viewsByDateMap[date] = (viewsByDateMap[date] || 0) + 1;
      });

    const viewsByDate = Object.entries(viewsByDateMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top components
    const componentClicksMap: Record<string, ComponentClickSummary> = {};
    events
      .filter((e) => e.eventType === 'click')
      .forEach((e) => {
        const key = e.componentId ?? 'unknown';
        if (!componentClicksMap[key]) {
          componentClicksMap[key] = {
            componentId: e.componentId,
            componentType: e.componentType,
            clicks: 0,
          };
        }
        componentClicksMap[key].clicks += 1;
      });

    const topComponents = Object.values(componentClicksMap)
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

    return {
      totalViews,
      totalClicks,
      viewsByDate,
      topComponents,
    };
  }
}

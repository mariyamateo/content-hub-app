import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PagesController } from './pages.controller';
import { ComponentsController } from './components.controller';
import { AnalyticsController } from './analytics.controller';
import { PagesService } from './pages.service';
import { ComponentsService } from './components.service';
import { AnalyticsService } from './analytics.service';
import { PageSchema } from './schemas/page.schema';
import { PageComponentSchema } from './schemas/page-component.schema';
import { AnalyticsSchema } from './schemas/analytics.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Page', schema: PageSchema },
      { name: 'PageComponent', schema: PageComponentSchema },
      { name: 'Analytics', schema: AnalyticsSchema },
    ]),
  ],
  controllers: [PagesController, ComponentsController, AnalyticsController],
  providers: [PagesService, ComponentsService, AnalyticsService],
})
export class PagesModule {}

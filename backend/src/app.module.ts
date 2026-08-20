import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { UserSchema } from './pages/schemas/user.schema';
import { PageSchema } from './pages/schemas/page.schema';
import { PageComponentSchema } from './pages/schemas/page-component.schema';
import { AnalyticsSchema } from './pages/schemas/analytics.schema';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.DATABASE_URL as string),
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Page', schema: PageSchema },
      { name: 'PageComponent', schema: PageComponentSchema },
      { name: 'Analytics', schema: AnalyticsSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

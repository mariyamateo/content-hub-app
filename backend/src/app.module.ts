import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { PagesModule } from './pages/pages.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.DATABASE_URL as string),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    AuthModule,
    PagesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

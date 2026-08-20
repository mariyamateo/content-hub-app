import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { KeycloakStrategy } from '../config/keycloak.config';
import { AuthController } from './auth.controller';
import { UserSchema } from '../pages/schemas/user.schema';

@Module({
  imports: [
    PassportModule,
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [KeycloakStrategy],
})
export class AuthModule {}

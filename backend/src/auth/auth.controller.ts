import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getCurrentUser(@CurrentUser() user: any) {
    return {
      keycloakId: user.keycloakId,
      email: user.email,
      name: user.name,
    };
  }
}

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthenticatedUser } from '../auth/types/authenticated-user.interface';
import { User } from '../pages/schemas/user.schema';

interface KeycloakJwtPayload {
  sub: string;
  email: string;
  name: string;
  preferred_username: string;
}

@Injectable()
export class KeycloakStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/certs`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Keycloak's default `aud` claim is "account", not the requesting
      // client id (that's in `azp`) — so we validate issuer + signature only.
      issuer: `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: KeycloakJwtPayload): Promise<AuthenticatedUser> {
    // Pages reference the local User's Mongo _id, not the Keycloak subject —
    // sync/upsert here so every authenticated request resolves both.
    const user = await this.userModel.findOneAndUpdate(
      { keycloakId: payload.sub },
      { keycloakId: payload.sub, email: payload.email, name: payload.name },
      { upsert: true, new: true },
    );

    return {
      id: user._id.toString(),
      keycloakId: payload.sub,
      email: payload.email,
      name: payload.name,
      preferred_username: payload.preferred_username,
    };
  }
}

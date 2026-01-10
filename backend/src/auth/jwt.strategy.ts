import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private usersService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'SECRET_KEY_MUST_BE_IN_ENV',
        });
    }

    async validate(payload: any) {
        const user = await this.usersService.findOneById(payload.sub);
        if (!user) {
            throw new UnauthorizedException();
        }
        return { userId: payload.sub, email: payload.email };
    }
}

// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Lấy token từ header Authorization dạng Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Không bỏ qua token hết hạn
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  // Hàm validate sẽ chạy khi token hợp lệ, payload là phần giải mã từ token
  async validate(payload: any) {
    // Trả về đối tượng user sẽ được inject vào Request (req.user)
    return {
      userId: payload.sub,
      userName: payload.userName,
      role: payload.roleName,
    };
  }
}

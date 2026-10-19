import {Injectable, UnauthorizedException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "./users.entities.js";
import {Repository} from "typeorm";
import * as argon2 from 'argon2';
import {RegisterUserDto} from "./dto/register-user.dto.js";
import {LoginUserDto} from "./dto/login-user.dto.js";
import {TokenService} from "../auth/token.service.js";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly rep: Repository<User>,
        private readonly tokenService: TokenService){}

    async registerUser(dto: RegisterUserDto): Promise<User> {
        const passwordHash = await argon2.hash(dto.password);

        const newUser = this.rep.create({
            username: dto.username,
            password: passwordHash,
        });

        return this.rep.save(newUser);
    }

    async login(dto: LoginUserDto): Promise<{ accessToken: string }> {
        const user = await this.rep.findOneBy({username: dto.username});

        if (!user || !(await argon2.verify(user.password, dto.password))) {
            throw new UnauthorizedException('Invalid username or password');
        }

        return {
            accessToken: this.tokenService.generateToken({
                sub: user.username,
            }),
        };
    }
}

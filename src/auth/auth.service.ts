import { HttpStatus, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "generated/prisma";
import { LoginUserDto, RegisterUserDto } from "./dto";
import { RpcException } from "@nestjs/microservices";

import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { JwtPayloadDto } from "./interfaces/jwt-payload.interface";

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {


    
    private readonly logger = new Logger(AuthService.name);

    constructor(private readonly jwtService: JwtService) {
        super();
    }

    onModuleInit() {
        this.$connect();
        this.logger.log('Connected to MongoDB');
    }

    async signJwt(payload: JwtPayloadDto) {
        return this.jwtService.sign(payload);
    }

    async registerUser(registerUserDto: RegisterUserDto) {
        try {
            const { name, email, password } = registerUserDto;
            const user = await this.user.findUnique({
                where: { email },
            });
            if (user) {
                throw new RpcException({
                    status: HttpStatus.BAD_REQUEST,
                    message: 'User already exists',
                });
            }
            const userDB = await this.user.create({
                data: { 
                    name, 
                    email, 
                    password: bcrypt.hashSync(password, 10),
                },
            });

            const { password: _, ...userWithoutPassword } = userDB;
            return {
                user: userWithoutPassword,
                token: await this.signJwt(userWithoutPassword)
            };
        } catch (error) {
            throw new RpcException({
                status: HttpStatus.BAD_REQUEST,
                message: error.message,
            });
        }
    }

    async loginUser(loginUserDto: LoginUserDto) {
        const userOrEmailIncorrect = {
            
                status: HttpStatus.BAD_REQUEST,
                message: 'User/Pass incorrect',
            
        }
        try {
            const { email, password } = loginUserDto;
            const user = await this.user.findUnique({
                where: { email },
            });
            if (!user) {
                throw new RpcException(userOrEmailIncorrect);
            }
            const isPasswordValid = bcrypt.compareSync(password, user.password);
            if (!isPasswordValid) {
                throw new RpcException(userOrEmailIncorrect);
            }

            const { password: _, ...userWithoutPassword } = user;
            return {
                user: userWithoutPassword,
                token: await this.signJwt(userWithoutPassword)
            };
        } catch (error) {
            throw new RpcException({
                status: HttpStatus.BAD_REQUEST,
                message: error.message,
            });
        }
    }
  
}

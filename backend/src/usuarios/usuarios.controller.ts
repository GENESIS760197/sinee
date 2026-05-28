import { Controller, Post, Body } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post('registro')
  async registro(
    @Body() body: {
      nombre: string;
      edad: number;
      correo: string;
      contrasena: string;
      nivel_educativo?: string;
    }
  ) {
    return this.usuariosService.registro(body);
  }

  @Post('login')
  async login(
    @Body() body: {
      correo: string;
      contrasena: string;
    }
  ) {
    return this.usuariosService.login(body.correo, body.contrasena);
  }
}
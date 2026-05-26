import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
  ) {}

  async registro(datos: {
    nombre: string;
    edad: number;
    correo: string;
    contrasena: string;
    nivel_educativo?: string;
  }) {
    const existe = await this.usuariosRepository.findOne({
      where: { correo: datos.correo },
    });

    if (existe) {
      throw new BadRequestException('El correo ya está registrado');
    }

    const hash = await bcrypt.hash(datos.contrasena, 10);

    const usuario = this.usuariosRepository.create({
      ...datos,
      contrasena: hash,
    });

    await this.usuariosRepository.save(usuario);

    return { mensaje: 'Usuario registrado correctamente' };
  }

  async login(correo: string, contrasena: string) {
    const usuario = await this.usuariosRepository.findOne({
      where: { correo },
    });

    if (!usuario) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    const valido = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!valido) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    return {
      mensaje: 'Login exitoso',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
      },
    };
  }
}
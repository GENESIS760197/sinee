import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column()
  edad: number;

  @Column({ length: 150, unique: true })
  correo: string;

  @Column({ length: 255 })
  contrasena: string;

  @Column({ length: 50, nullable: true })
  nivel_educativo: string;

  @CreateDateColumn()
  creado_en: Date;
}
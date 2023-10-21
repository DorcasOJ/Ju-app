import { Exclude } from 'class-transformer';
import { pbkdf2Sync, randomBytes } from 'crypto';
import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({})
  fullName: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column({})
  password: string;

  @Column({ nullable: true })
  profileID?: string;

  @Column({ unique: true, nullable: true })
  @Exclude()
  refreshToken?: string;

  @BeforeInsert()
  public setPassword() {
    const salt = randomBytes(32).toString('hex');
    const hash = pbkdf2Sync(this.password, salt, 1000, 64, 'sha512').toString(
      'hex',
    );
    const hashedPassword = `${salt}:${hash}`;
    this.password = hashedPassword;
    return this.password;
  }
}

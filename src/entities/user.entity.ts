import { Exclude } from 'class-transformer';
import { pbkdf2Sync, randomBytes } from 'crypto';
import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
  })
  fullName: string;

  @Column({
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    nullable: false,
  })
  password: string;

  @Column({ nullable: true })
  profileID?: string;

  @Column({ unique: true, nullable: tue })
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

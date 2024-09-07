import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class StravaCredentials {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  accessToken: string;

  @Column()
  refreshToken: string;

  @Column({ type: 'timestamptz' })
  tokenExpiresAt: Date;
}

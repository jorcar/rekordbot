import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/user.entity';
import { StravaCredentials } from './strava-credentials.entity';

@Entity()
export class StravaAthlete {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', unique: true })
  @Index()
  stravaId: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  profileUrl: string;

  @Column({ nullable: true })
  subscriptionId?: number;

  @OneToOne(() => User, { nullable: false })
  @JoinColumn()
  user: Promise<User>;

  @OneToOne(() => StravaCredentials, { nullable: false })
  @JoinColumn()
  credentials: Promise<StravaCredentials>;
}

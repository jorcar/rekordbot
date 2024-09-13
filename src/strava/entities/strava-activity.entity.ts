import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StravaAthlete } from './strava-athlete.entity';

@Entity()
export class StravaActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  @Index()
  stravaId: number;

  @Column()
  name: string;

  @Column()
  sportType: string;

  @Column()
  distance: number;

  @Column()
  movingTime: number;

  @Column()
  elapsedTime: number;

  @Column()
  totalElevationGain: number;

  @Column({ type: 'timestamptz' })
  startDate: Date;

  @ManyToOne(() => StravaAthlete, { nullable: false })
  @JoinColumn()
  athlete: Promise<StravaAthlete>;
}

// watts?
// heartrate?

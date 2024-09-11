import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StravaActivity } from './strava-activity.entity';
import { StravaAthlete } from './strava-athlete.entity';

@Entity()
export class StravaSegment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  stravaId: string;

  @Column()
  name: string;

  @ManyToOne(() => StravaAthlete, { nullable: false })
  @JoinColumn()
  athlete: Promise<StravaAthlete>;
}

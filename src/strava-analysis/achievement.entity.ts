import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StravaAthlete } from '../strava/entities/strava-athlete.entity';
import { StravaActivity } from '../strava/entities/strava-activity.entity';

@Entity()
export class Achievement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @ManyToOne(() => StravaActivity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn()
  @Index()
  activity: Promise<StravaActivity>;

  @ManyToOne(() => StravaAthlete, { nullable: false })
  @JoinColumn()
  athlete: Promise<StravaAthlete>;
}

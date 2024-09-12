import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StravaActivity } from './strava-activity.entity';
import { StravaAthlete } from './strava-athlete.entity';

@Entity()
export class StravaAchievementEffort {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  effortName: string;

  @Column()
  movingTime: number;

  @Column()
  elapsedTime: number;

  @Column({ type: 'timestamptz' })
  startDate: Date;

  @ManyToOne(() => StravaActivity, { nullable: false })
  @JoinColumn()
  activity: Promise<StravaActivity>;

  @ManyToOne(() => StravaAthlete, { nullable: false })
  @JoinColumn()
  athlete: Promise<StravaAthlete>;
}

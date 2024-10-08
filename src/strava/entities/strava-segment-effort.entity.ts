import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { StravaActivity } from './strava-activity.entity';
import { StravaSegment } from './strava-segment.entity';
import { StravaAthlete } from './strava-athlete.entity';

@Entity()
export class StravaSegmentEffort {
  @PrimaryColumn()
  stravaId: string;

  @ManyToOne(() => StravaSegment, { nullable: false })
  @JoinColumn()
  @Index()
  segment: Promise<StravaSegment>;

  @Column()
  movingTime: number;

  @Column()
  elapsedTime: number;

  @Column({ type: 'timestamptz' })
  startDate: Date;

  @ManyToOne(() => StravaActivity, { nullable: false })
  @JoinColumn()
  @Index()
  activity: Promise<StravaActivity>;

  @ManyToOne(() => StravaAthlete, { nullable: false })
  @JoinColumn()
  athlete: Promise<StravaAthlete>;
}

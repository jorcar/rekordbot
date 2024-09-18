import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { StravaAthlete } from './strava-athlete.entity';
import { StravaSegmentEffort } from './strava-segment-effort.entity';
import { StravaAchievementEffort } from './strava-achievement-effort.entity';

@Entity()
export class StravaActivity {
  @PrimaryColumn({ type: 'bigint' })
  stravaId: number;

  @Column()
  name: string;

  @Column()
  sportType: string;

  @Column()
  distance: number; // centimeters

  @Column()
  movingTime: number;

  @Column()
  elapsedTime: number;

  @Column()
  totalElevationGain: number; // centimeters

  @Column({ type: 'timestamptz' })
  startDate: Date;

  @ManyToOne(() => StravaAthlete, { nullable: false })
  @JoinColumn()
  athlete: Promise<StravaAthlete>;

  @OneToMany(
    () => StravaSegmentEffort,
    (segmentEffort) => segmentEffort.activity,
    { nullable: true },
  )
  segmentEfforts: Promise<StravaSegmentEffort[]>;

  @OneToMany(
    () => StravaAchievementEffort,
    (achievementEffort) => achievementEffort.activity,
    { nullable: true },
  )
  achievementEfforts: Promise<StravaAchievementEffort[]>;
}

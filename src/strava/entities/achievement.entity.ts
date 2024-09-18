import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StravaAthlete } from './strava-athlete.entity';
import { StravaActivity } from './strava-activity.entity';

@Entity()
export class Achievement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @ManyToOne(() => StravaActivity, { nullable: false })
  @JoinColumn()
  @Index()
  activity: Promise<StravaActivity>;

  @ManyToOne(() => StravaAthlete, { nullable: false })
  @JoinColumn()
  athlete: Promise<StravaAthlete>;

  /*@ManyToOne(() => StravaAthlete, (athlete) => athlete.id, {
    nullable: false,
  })
  athlete: Promise<StravaAthlete>;*/

  /*@ManyToOne(() => StravaActivity, (activity) => activity.stravaId, {
    nullable: false,
  })
  activity: Promise<StravaActivity>;*/
}

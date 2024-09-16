import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { StravaAthlete } from './strava-athlete.entity';

@Entity()
export class StravaActivity {
  @PrimaryColumn({ type: 'bigint' })
  stravaId: bigint;

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
}

// watts?
// heartrate?

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StravaAthlete } from './strava-athlete.entity';

export interface StravaBackfillProgress {
  activitiesSynched: boolean;
  segmentEffortsSynched: boolean;
  lastProcessedActivityIdx?: number;
  synchUntil: string;
  synchCutOff: string;
  processedPages: number;
}

@Entity()
export class StravaBackfillStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'jsonb' })
  progress: StravaBackfillProgress;

  @Column({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => StravaAthlete, { nullable: false })
  @JoinColumn()
  athlete: Promise<StravaAthlete>;
}

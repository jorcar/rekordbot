import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class StravaSegment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  stravaId: string;

  @Column()
  name: string;
}

import { BaseEntity } from 'src/common/database/base.entity';
import { Schedule } from 'src/schedule/entities/schedule.entity';
import { Theatre } from 'src/theatre/entities/theatre.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

interface SeatMap {
	rows: {
		row: string; // Row identifier such as A, B, C
		seats: {
			column: number; // Seat column number 1, 2, 3
			seatNumber: string; // Unique seat identifier such as A1
		}[];
	}[];
}

@Entity()
export class Auditorium extends BaseEntity {
	@Column()
	name: string;

	@Column()
	capacity: number;

	@Column({ type: 'json' })
	seatMap: SeatMap;

	@ManyToOne(() => Theatre, (theatre) => theatre.auditoriums)
	theatre: Theatre;

	@OneToMany(() => Schedule, (schedule) => schedule.auditorium)
	schedules: Schedule[];
}

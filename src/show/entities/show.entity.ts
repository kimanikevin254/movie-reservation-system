import { BaseEntity } from 'src/common/database/base.entity';
import { Schedule } from 'src/schedule/entities/schedule.entity';
import { Theatre } from 'src/theatre/entities/theatre.entity';
import { User } from 'src/user/entities/user.entity';
import {
	Column,
	Entity,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
} from 'typeorm';

@Entity()
export class Show extends BaseEntity {
	@Column()
	name: string;

	@Column()
	releaseDate: Date;

	@Column()
	duration: number; // In minutes

	@Column()
	description: string;

	@Column()
	rating: number; // A number between 1 and 10

	@ManyToOne(() => User, (user) => user.shows)
	user: User;

	@ManyToMany(() => Theatre, (theatre) => theatre.shows)
	@JoinTable()
	theatres: Theatre[];

	@OneToMany(() => Schedule, (schedule) => schedule.show)
	schedules: Schedule[];
}

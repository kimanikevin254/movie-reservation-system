import { Auditorium } from 'src/auditorium/entities/auditorium.entity';
import { BaseEntity } from 'src/common/database/base.entity';
import { Show } from 'src/show/entities/show.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToMany, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Theatre extends BaseEntity {
	@Column()
	name: string;

	@Column()
	location: string;

	@ManyToOne(() => User, (user) => user.theatres)
	user: User;

	@OneToMany(() => Auditorium, (auditorium) => auditorium.theatre)
	auditoriums: Auditorium[];

	@ManyToMany(() => Show, (show) => show.theatres)
	shows: Show[];
}

import { Auditorium } from 'src/auditorium/entities/auditorium.entity';
import { BaseEntity } from 'src/common/database/base.entity';
import { Show } from 'src/show/entities/show.entity';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Schedule extends BaseEntity {
	@ManyToOne(() => Auditorium, (auditorium) => auditorium.schedules)
	auditorium: Auditorium;

	@ManyToOne(() => Show, (show) => show.schedules)
	show: Show;

	@Column({ type: 'timestamptz' })
	startTime: Date;

	@Column({ type: 'timestamptz' })
	endTime: Date;

	@OneToMany(() => Ticket, (ticket) => ticket.schedule)
	tickets: Ticket[];
}

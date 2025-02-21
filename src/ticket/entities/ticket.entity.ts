import { BaseEntity } from 'src/common/database/base.entity';
import { Schedule } from 'src/schedule/entities/schedule.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

export enum TicketStatusEnum {
	DRAFT = 'DRAFT', // Not yet available for purchase
	ACTIVE = 'ACTIVE', // Available for purchase
	INACTIVE = 'INACTIVE', // No longer available for purchase
}

@Entity()
export class Ticket extends BaseEntity {
	@Column()
	name: string;

	@Column()
	description: string;

	@Column()
	price: number;

	@Column()
	quantity: number;

	@Column()
	available: number;

	@Column({
		type: 'enum',
		enum: TicketStatusEnum,
		default: TicketStatusEnum.DRAFT,
	})
	status: TicketStatusEnum;

	@ManyToOne(() => Schedule, (schedule) => schedule.tickets)
	schedule: Schedule;
}

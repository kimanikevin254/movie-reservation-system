import {
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

@Entity()
export abstract class BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@UpdateDateColumn({ type: 'timestamptz' })
	updatedAt: Date;

	@CreateDateColumn({ type: 'timestamptz' })
	createdAt: Date;
}

import { BaseEntity } from 'src/common/database/base.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Theatre extends BaseEntity {
	@Column()
	name: string;

	@Column()
	location: string;

	@ManyToOne(() => User, (user) => user.theatres)
	user: User;
}

import { RefreshToken } from 'src/auth/entities/refresh-token.entity';
import { BaseEntity } from 'src/common/database/base.entity';
import { Show } from 'src/show/entities/show.entity';
import { Theatre } from 'src/theatre/entities/theatre.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class User extends BaseEntity {
	@Column({ nullable: true })
	name: string;

	@Column()
	email: string;

	@OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
	refreshTokens: RefreshToken[];

	@OneToMany(() => Theatre, (theatre) => theatre.user)
	theatres: Theatre[];

	@OneToMany(() => Show, (show) => show.user)
	shows: Show[];
}

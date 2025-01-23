import { BaseEntity } from 'src/common/database/base.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class PasswordResetToken extends BaseEntity {
	@Column({ unique: true })
	token: string;

	@Column({ type: 'timestamptz' })
	expiresAt: Date;

	@ManyToOne(() => User, (user) => user.passwordResetTokens)
	user: User;
}

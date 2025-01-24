import { EmailVerificationToken } from 'src/auth/entities/email-verification-token.entity';
import { PasswordResetToken } from 'src/auth/entities/password-reset-token.entity';
import { RefreshToken } from 'src/auth/entities/refresh-token.entity';
import { BaseEntity } from 'src/common/database/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class User extends BaseEntity {
	@Column({ nullable: true })
	name: string;

	@Column()
	email: string;

	@OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
	refreshTokens: RefreshToken[];

	@OneToMany(
		() => PasswordResetToken,
		(passwordResetToken) => passwordResetToken.user,
	)
	passwordResetTokens: PasswordResetToken[];

	@OneToMany(
		() => EmailVerificationToken,
		(emailVerificationToken) => emailVerificationToken.user,
	)
	emailVerificationTokens: EmailVerificationToken[];
}

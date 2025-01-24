export interface IUser {
	id: string;
	next_action?: 'sign_in' | 'complete_signup';
}

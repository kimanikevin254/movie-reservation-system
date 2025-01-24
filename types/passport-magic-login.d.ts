declare module 'passport-magic-login' {
	import { Request, Response } from 'express';
	import { SignOptions } from 'jsonwebtoken';
	import { StrategyCreatedStatic } from 'passport';

	// Re-export the Options interface
	export interface Options {
		secret: string;
		callbackUrl: string;
		jwtOptions?: SignOptions;
		sendMagicLink: (
			destination: string,
			href: string,
			verificationCode: string,
			req: Request,
		) => Promise<void>;
		verify: (
			payload: any,
			verifyCallback: (
				err?: Error | null,
				// eslint-disable-next-line @typescript-eslint/ban-types
				user?: Object,
				info?: any,
			) => void,
			req: Request,
		) => void;
		/** @deprecated */
		confirmUrl?: string;
	}

	// Re-export the MagicLoginStrategy class
	export default class MagicLoginStrategy {
		private _options: Options;
		name: string;
		constructor(_options: Options);
		authenticate(
			this: StrategyCreatedStatic & MagicLoginStrategy,
			req: Request,
		): void;
		send: (req: Request, res: Response) => void;
		/** @deprecated */
		confirm: (req: Request, res: Response) => void;
	}
}

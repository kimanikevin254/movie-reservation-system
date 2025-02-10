import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class BaseService<T> {
	constructor(private readonly repository: Repository<T>) {}

	// Remove specified fields from an object before returning it
	sanitize<U>(obj: U, excludedFields: (keyof U)[]): Partial<U> {
		const sanitizedObj = { ...obj };
		excludedFields.forEach((field) => delete sanitizedObj[field]);
		return sanitizedObj;
	}

	// Find entity by ID with optinal relations
	findById(id: string, relations: string[] = []): Promise<T> {
		return this.repository.findOne({
			where: { id } as any, // any avoids TS errors
			relations: relations.length > 0 ? relations : undefined,
		});
	}
}

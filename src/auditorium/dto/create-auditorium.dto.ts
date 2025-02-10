import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	ArrayNotEmpty,
	ArrayUnique,
	IsArray,
	IsDefined,
	IsInt,
	IsNotEmpty,
	IsString,
	registerDecorator,
	ValidateNested,
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';

// Custom validator to check duplicate seat numbers across rows
@ValidatorConstraint({ async: false })
export class UniqueSeatNumbersConstraint
	implements ValidatorConstraintInterface
{
	validate(
		seatMap: any,
		_validationArguments?: ValidationArguments,
	): boolean {
		const seen = new Set<string>();
		for (const row of seatMap) {
			for (const seat of row.seats) {
				const seatIdentifier = `${seat.seatNumber}`;

				if (seen.has(seatIdentifier)) {
					return false; // Duplicate seat number found
				}
				seen.add(seatIdentifier);
			}
		}
		return true; // No duplicate seat number
	}
}

// Decorator for the validator
function UniqueSeatNumbers(validationOptions: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [],
			validator: UniqueSeatNumbersConstraint,
		});
	};
}

// Individual seat in a row
class SeatDto {
	@IsInt()
	@IsDefined()
	column: number;

	@IsString()
	@IsNotEmpty()
	seatNumber: string;
}

// Individual row
export class RowDto {
	@IsString()
	@IsNotEmpty()
	row: string;

	@IsArray()
	@ArrayUnique((seat: SeatDto) => seat.seatNumber) // Ensure each seat in the row has a unique seatNumber
	@ArrayUnique((seat: SeatDto) => seat.column)
	@ValidateNested({ each: true })
	@Type(() => SeatDto) // Transform incoming JSON into an instance of SeatDto
	seats: SeatDto[];
}

export class CreateAuditoriumDto {
	@ApiProperty({
		description: 'The name of the auditorium',
		example: 'Auditorium 1',
	})
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty({
		description: 'The seating capacity of the auditorium',
		example: 100,
	})
	@IsInt()
	@IsDefined()
	capacity: number;

	@ApiProperty({
		description: 'The seat map of the auditorium',
		example: [
			{
				row: 'A',
				seats: [
					{
						column: 1,
						seatNumber: 'A1',
					},
					{
						column: 2,
						seatNumber: 'A2',
					},
				],
			},
			{
				row: 'B',
				seats: [
					{
						column: 1,
						seatNumber: 'B1',
					},
					{
						column: 2,
						seatNumber: 'B2',
					},
				],
			},
		],
	})
	@IsArray()
	@ArrayNotEmpty()
	@ArrayUnique((row: RowDto) => row.row)
	@ValidateNested({ each: true })
	@Type(() => RowDto)
	@UniqueSeatNumbers({
		message: 'Seat numbers must be unique across all rows.',
	})
	seatMap: RowDto[];
}

// * Data Transfer Objects (DTOs) for the Card domain.
// * This file contains both output DTOs (what the API returns to clients)
// * and input DTOs (what the API accepts from clients when creating/updating cards).
// ? Keep input and output DTOs together here for discoverability — input DTOs
// ? are used by controllers/services for validation; output DTOs are returned
// ? to clients. This file intentionally groups both shapes and the mapping helpers.
import { Expose } from 'class-transformer';
import { Card } from '../models/card.entity';
import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  Length,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

// * Output DTO: the shape returned by the API for a card.
// * Uses `@Expose()` so class-transformer will include these fields when serializing.
export class CardDto {
  @Expose()
  id!: number;
  @Expose()
  title!: string;
  @Expose()
  image!: string;
  @Expose()
  rating!: number;
  @Expose()
  description!: string;
  @Expose()
  author!: string;
  @Expose()
  createdAt!: string;
  @Expose()
  updatedAt!: string;
}

// * Input DTO: data required to create a new card.
// * Validation decorators ensure incoming payloads are validated at runtime
// ? Fields marked with decorators describe expected types and constraints:
// ? - `title`, `image`, `description`, `author` are required strings with length limits.
// ? - `rating` is optional numeric
export class CreateCardDto {
  @IsString()
  @Length(1, 120)
  title!: string;

  @IsString()
  @Length(1, 300)
  image!: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(5)
  rating?: number;

  @IsString()
  @Length(1, 2000)
  description!: string;

  @IsString()
  @Length(1, 120)
  author!: string;
}

// * Input DTO for updates: all fields are optional but validated when provided.
// ? `UpdateCardDto` is implemented as `PartialType(CreateCardDto)` so validation
// ? rules from `CreateCardDto` are preserved but fields become optional.
export class UpdateCardDto extends PartialType(CreateCardDto) {}

// ? Helper: convert a Card entity instance into a `CardDto`.
// ? Keep transformations centralized to keep responses consistent.
export const toCardDto = (card: Card): CardDto => {
  return {
    id: card.id,
    title: card.title,
    image: card.image,
    rating: card.rating,
    description: card.description,
    author: card.author,
    createdAt: card.createdAt.toISOString(),
    updatedAt: card.updatedAt.toISOString(),
  };
};

// ? Map an array of Card entities to DTOs
export const toCardDtoArray = (cards: Card[]): CardDto[] =>
  cards.map(toCardDto);

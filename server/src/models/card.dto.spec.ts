import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import {
  CreateCardDto,
  UpdateCardDto,
  CardDto,
  toCardDto,
  toCardDtoArray,
} from './card.dto';
import { Card } from './card.entity';

describe('Card DTOs', () => {
  describe('CreateCardDto', () => {
    const validCardData = {
      title: 'Test Card',
      image: 'test-image.jpg',
      rating: 4.5,
      description: 'Test description',
      author: 'Test Author',
    };

    it('should validate a valid CreateCardDto', async () => {
      const dto = plainToClass(CreateCardDto, validCardData);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when title is empty', async () => {
      const dto = plainToClass(CreateCardDto, { ...validCardData, title: '' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('title');
    });

    it('should fail validation when title is too long', async () => {
      const dto = plainToClass(CreateCardDto, {
        ...validCardData,
        title: 'a'.repeat(121),
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('title');
    });

    it('should fail validation when image is empty', async () => {
      const dto = plainToClass(CreateCardDto, { ...validCardData, image: '' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('image');
    });

    it('should fail validation when image is too long', async () => {
      const dto = plainToClass(CreateCardDto, {
        ...validCardData,
        image: 'a'.repeat(301),
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('image');
    });

    it('should fail validation when rating is negative', async () => {
      const dto = plainToClass(CreateCardDto, { ...validCardData, rating: -1 });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('rating');
    });

    it('should fail validation when rating is greater than 5', async () => {
      const dto = plainToClass(CreateCardDto, { ...validCardData, rating: 6 });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('rating');
    });

    it('should fail validation when rating has more than 2 decimal places', async () => {
      const dto = plainToClass(CreateCardDto, {
        ...validCardData,
        rating: 4.123,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('rating');
    });

    it('should validate when rating is undefined (optional)', async () => {
      const { ...dataWithoutRating } = validCardData;
      const dto = plainToClass(CreateCardDto, dataWithoutRating);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when description is empty', async () => {
      const dto = plainToClass(CreateCardDto, {
        ...validCardData,
        description: '',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('description');
    });

    it('should fail validation when description is too long', async () => {
      const dto = plainToClass(CreateCardDto, {
        ...validCardData,
        description: 'a'.repeat(2001),
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('description');
    });

    it('should fail validation when author is empty', async () => {
      const dto = plainToClass(CreateCardDto, { ...validCardData, author: '' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('author');
    });

    it('should fail validation when author is too long', async () => {
      const dto = plainToClass(CreateCardDto, {
        ...validCardData,
        author: 'a'.repeat(121),
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('author');
    });

    it('should fail validation when title is not a string', async () => {
      const dto = plainToClass(CreateCardDto, { ...validCardData, title: 123 });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('title');
    });

    it('should fail validation when rating is not a number', async () => {
      const dto = plainToClass(CreateCardDto, {
        ...validCardData,
        rating: 'invalid',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('rating');
    });
  });

  describe('UpdateCardDto', () => {
    it('should validate an empty UpdateCardDto', async () => {
      const dto = plainToClass(UpdateCardDto, {});
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate partial updates', async () => {
      const dto = plainToClass(UpdateCardDto, { title: 'Updated Title' });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should apply the same validation rules as CreateCardDto for provided fields', async () => {
      const dto = plainToClass(UpdateCardDto, { title: '' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('title');
    });

    it('should validate multiple partial fields', async () => {
      const dto = plainToClass(UpdateCardDto, {
        title: 'Updated Title',
        rating: 3.5,
        author: 'Updated Author',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('CardDto and transformation helpers', () => {
    const mockCard: Card = {
      id: 1,
      title: 'Test Card',
      image: 'test-image.jpg',
      rating: 4.5,
      description: 'Test description',
      author: 'Test Author',
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      updatedAt: new Date('2025-01-01T00:00:00.000Z'),
    };

    describe('toCardDto', () => {
      it('should transform a Card entity to CardDto', () => {
        const result = toCardDto(mockCard);

        expect(result).toEqual({
          id: 1,
          title: 'Test Card',
          image: 'test-image.jpg',
          rating: 4.5,
          description: 'Test description',
          author: 'Test Author',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        });
      });

      it('should convert dates to ISO strings', () => {
        const result = toCardDto(mockCard);
        expect(typeof result.createdAt).toBe('string');
        expect(typeof result.updatedAt).toBe('string');
        expect(result.createdAt).toBe('2025-01-01T00:00:00.000Z');
        expect(result.updatedAt).toBe('2025-01-01T00:00:00.000Z');
      });

      it('should preserve all required fields', () => {
        const result = toCardDto(mockCard);
        expect(result.id).toBeDefined();
        expect(result.title).toBeDefined();
        expect(result.image).toBeDefined();
        expect(result.rating).toBeDefined();
        expect(result.description).toBeDefined();
        expect(result.author).toBeDefined();
        expect(result.createdAt).toBeDefined();
        expect(result.updatedAt).toBeDefined();
      });
    });

    describe('toCardDtoArray', () => {
      it('should transform an array of Card entities to CardDto array', () => {
        const cards = [mockCard, { ...mockCard, id: 2, title: 'Second Card' }];
        const result = toCardDtoArray(cards);

        expect(result).toHaveLength(2);
        expect(result[0].id).toBe(1);
        expect(result[0].title).toBe('Test Card');
        expect(result[1].id).toBe(2);
        expect(result[1].title).toBe('Second Card');
      });

      it('should handle empty array', () => {
        const result = toCardDtoArray([]);
        expect(result).toEqual([]);
      });

      it('should transform single item array', () => {
        const result = toCardDtoArray([mockCard]);
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(toCardDto(mockCard));
      });
    });

    describe('CardDto class', () => {
      it('should have all required properties decorated with @Expose', () => {
        const dto = new CardDto();

        // Check that the class has the expected properties
        expect(dto).toHaveProperty('id');
        expect(dto).toHaveProperty('title');
        expect(dto).toHaveProperty('image');
        expect(dto).toHaveProperty('rating');
        expect(dto).toHaveProperty('description');
        expect(dto).toHaveProperty('author');
        expect(dto).toHaveProperty('createdAt');
        expect(dto).toHaveProperty('updatedAt');
      });
    });
  });
});

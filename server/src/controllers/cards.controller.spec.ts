import { Test, TestingModule } from '@nestjs/testing';
import { CardsController } from './cards.controller';
import { CardsService } from '../services/cards.service';
import { CreateCardDto, UpdateCardDto } from '../models/card.dto';
import { Card } from '../models/card.entity';

describe('CardsController', () => {
  let controller: CardsController;

  const mockCard: Card = {
    id: 1,
    title: 'Test Card',
    image: 'test-image.jpg',
    rating: 4.5,
    description: 'Test description',
    author: 'Test Author',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockCardsService = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardsController],
      providers: [
        {
          provide: CardsService,
          useValue: mockCardsService,
        },
      ],
    }).compile();

    controller = module.get<CardsController>(CardsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllCards', () => {
    it('should return an array of cards', async () => {
      const cards = [mockCard];
      mockCardsService.findAll.mockResolvedValue(cards);

      const result = await controller.getAllCards();

      expect(mockCardsService.findAll).toHaveBeenCalled();
      expect(result).toEqual([
        {
          id: 1,
          title: 'Test Card',
          image: 'test-image.jpg',
          rating: 4.5,
          description: 'Test description',
          author: 'Test Author',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ]);
    });

    it('should return empty array when no cards exist', async () => {
      mockCardsService.findAll.mockResolvedValue([]);

      const result = await controller.getAllCards();

      expect(mockCardsService.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle service errors', async () => {
      mockCardsService.findAll.mockRejectedValue(new Error('Database error'));

      await expect(controller.getAllCards()).rejects.toThrow('Database error');
    });
  });

  describe('createCard', () => {
    const createCardDto: CreateCardDto = {
      title: 'New Card',
      image: 'new-image.jpg',
      rating: 3.0,
      description: 'New description',
      author: 'New Author',
    };

    it('should create a new card', async () => {
      mockCardsService.create.mockResolvedValue(mockCard);

      const result = await controller.createCard(createCardDto);

      expect(mockCardsService.create).toHaveBeenCalledWith(createCardDto);
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

    it('should handle validation errors', async () => {
      mockCardsService.create.mockRejectedValue(new Error('Validation failed'));

      await expect(controller.createCard(createCardDto)).rejects.toThrow(
        'Validation failed',
      );
    });
  });

  describe('updateCard', () => {
    const updateCardDto: UpdateCardDto = {
      title: 'Updated Card',
      rating: 5.0,
    };

    it('should update an existing card', async () => {
      const updatedCard = { ...mockCard, ...updateCardDto };
      mockCardsService.update.mockResolvedValue(updatedCard);

      const result = await controller.updateCard('1', updateCardDto);

      expect(mockCardsService.update).toHaveBeenCalledWith(1, updateCardDto);
      expect(result.title).toBe('Updated Card');
      expect(result.rating).toBe(5.0);
    });

    it('should handle invalid ID format', async () => {
      mockCardsService.update.mockRejectedValue(new Error('Invalid card ID'));

      await expect(
        controller.updateCard('invalid', updateCardDto),
      ).rejects.toThrow('Invalid card ID');
    });

    it('should handle non-existent card', async () => {
      mockCardsService.update.mockRejectedValue(new Error('Card not found'));

      await expect(controller.updateCard('999', updateCardDto)).rejects.toThrow(
        'Card not found',
      );
    });
  });

  describe('deleteCard', () => {
    it('should delete a card', async () => {
      mockCardsService.delete.mockResolvedValue(undefined);

      const result = await controller.deleteCard('1');

      expect(mockCardsService.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ success: true });
    });

    it('should handle non-existent card deletion', async () => {
      mockCardsService.delete.mockRejectedValue(new Error('Card not found'));

      await expect(controller.deleteCard('999')).rejects.toThrow(
        'Card not found',
      );
    });

    it('should handle invalid ID format', async () => {
      mockCardsService.delete.mockRejectedValue(new Error('Invalid card ID'));

      await expect(controller.deleteCard('invalid')).rejects.toThrow(
        'Invalid card ID',
      );
    });
  });
});

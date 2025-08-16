import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Param,
  Body,
} from '@nestjs/common';
import { CardsService } from '../services/cards.service';
import { toCardDto, toCardDtoArray } from '../models/card.dto';
import { CreateCardDto, UpdateCardDto } from '../models/card.dto';

@Controller('api/cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  async getAllCards() {
    const cards = await this.cardsService.findAll();
    return toCardDtoArray(cards);
  }

  @Get(':id')
  async getCard(@Param('id') id: string) {
    const card = await this.cardsService.findOne(Number(id));
    return toCardDto(card);
  }

  @Post()
  async createCard(@Body() body: CreateCardDto) {
    const created = await this.cardsService.create(body);
    return toCardDto(created);
  }

  @Put(':id')
  async updateCard(@Param('id') id: string, @Body() body: UpdateCardDto) {
    const updated = await this.cardsService.update(Number(id), body);
    return toCardDto(updated);
  }

  @Delete(':id')
  async deleteCard(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.cardsService.delete(Number(id));
    return { success: true };
  }
}

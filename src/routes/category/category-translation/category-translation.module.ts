import { Module } from '@nestjs/common';
import { CategoryTranslationController } from './category-translation.controller';
import { CategoryTranslationService } from './category-translation.service';

@Module({
  controllers: [CategoryTranslationController],
  providers: [CategoryTranslationService]
})
export class CategoryTranslationModule {}

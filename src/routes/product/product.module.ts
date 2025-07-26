import { Module } from '@nestjs/common'
import { ProductController } from './product.controller'
import { ProductService } from './product.service'
import { ManageProductController } from './manage-product.controller'
import { ManageProductService } from './manage-product.service'
import { ProductRepository } from './product.repo'

@Module({
  controllers: [ProductController, ManageProductController],
  providers: [ProductService, ProductRepository, ManageProductService],
})
export class ProductModule {}

import { Module } from '@nestjs/common'
import { ProductController } from './product.controller'
import { ProductService } from './product.service'
import { ManageProductController } from './manage-product.controller'
import { ManageProductService } from './manage-product.service'
import { ProductRepository } from './product.repo'
import { ProductGateway } from './product.gateway'

@Module({
  controllers: [ProductController, ManageProductController],
  providers: [ProductService, ProductRepository, ProductGateway, ManageProductService],
})
export class ProductModule {}

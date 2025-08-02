import { ForbiddenException, Injectable } from '@nestjs/common'
import { ProductRepository } from './product.repo'
import { CreateProductBodyType, GetManageProductsQueryType, UpdateProductBodyType } from './product.model'
import { I18nContext } from 'nestjs-i18n'
import { NotFoundRecordException } from 'src/shared/error'
import { isNotFoundPrismaError } from 'src/shared/helpers'
import { RoleName } from 'src/shared/constants/role.constant'
import { ProductGateway } from './product.gateway'

@Injectable()
export class ManageProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productGateway: ProductGateway,
  ) {}

  validatePrivilege({
    userIdRequest,
    roleNameRequest,
    createdById,
  }: {
    userIdRequest: number
    roleNameRequest: string
    createdById: number | undefined | null
  }) {
    if (userIdRequest !== createdById && roleNameRequest !== RoleName.ADMIN) {
      throw new ForbiddenException()
    }
    return true
  }

  async list({
    query,
    userIdRequest,
    roleNameRequest,
  }: {
    query: GetManageProductsQueryType
    userIdRequest: number
    roleNameRequest: string
  }) {
    this.validatePrivilege({
      userIdRequest: userIdRequest,
      roleNameRequest: roleNameRequest,
      createdById: query.createdById,
    })
    const data = await this.productRepository.list({
      query,
      isPublish: query.isPublic,
      languageId: I18nContext.current()?.lang as string,
    })
    return data
  }

  async getDetail({
    productId,
    userIdRequest,
    roleNameRequest,
  }: {
    productId: number
    userIdRequest: number
    roleNameRequest: string
  }) {
    const product = await this.productRepository.getDetail({
      productId,
      languageId: I18nContext.current()?.lang as string,
    })
    if (!product) {
      throw NotFoundRecordException
    }
    this.validatePrivilege({
      userIdRequest: userIdRequest,
      roleNameRequest: roleNameRequest,
      createdById: product.createdById,
    })
    return product
  }

  create({ data, createdById }: { data: CreateProductBodyType; createdById: number }) {
    return this.productRepository.create({
      createdById,
      data,
    })
  }

  async update({
    productId,
    data,
    updatedById,
    roleNameRequest,
  }: {
    productId: number
    data: UpdateProductBodyType
    updatedById: number
    roleNameRequest: string
  }) {
    const product = await this.productRepository.findById(productId)
    if (!product) {
      throw NotFoundRecordException
    }

    this.validatePrivilege({
      userIdRequest: updatedById,
      roleNameRequest,
      createdById: product.createdById,
    })

    try {
      const updatedProduct = await this.productRepository.update({
        productId,
        data,
        updatedById,
      })
      const fullUpdatedProduct = await this.productRepository.getDetail({
        productId: updatedProduct.id,
        languageId: 'all',
      })

      if (fullUpdatedProduct) {
        this.productGateway.handleProductUpdate(fullUpdatedProduct)
      }
      return updatedProduct
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async delete({
    productId,
    deletedById,
    roleNameRequest,
  }: {
    productId: number
    deletedById: number
    roleNameRequest: string
  }) {
    const product = await this.productRepository.findById(productId)
    if (!product) {
      throw NotFoundRecordException
    }

    this.validatePrivilege({
      userIdRequest: deletedById,
      roleNameRequest,
      createdById: product.createdById,
    })
    try {
      await this.productRepository.delete({ productId, deletedById })
      this.productGateway.handleProductDelete(productId)
      return {
        message: 'Message.DeleteProductSuccessFully',
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }

      throw error
    }
  }
}

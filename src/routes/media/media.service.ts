import { Injectable } from '@nestjs/common'
import { PresignedUploadFileBodyType } from './media.model'
import { S3Service } from 'src/shared/services/s3.service'
import { generateRandomFileName } from 'src/shared/helpers'

@Injectable()
export class MediaService {
  constructor(private readonly s3Service: S3Service) {}

  async getPresignedUrl(body: PresignedUploadFileBodyType) {
    const randomFilename = generateRandomFileName(body.filename)
    const presignedUrl = await this.s3Service.createPresignedUrlWithClient(randomFilename)
    const url = presignedUrl.split('?')[0]
    return {
      presignedUrl,
      url,
    }
  }
}

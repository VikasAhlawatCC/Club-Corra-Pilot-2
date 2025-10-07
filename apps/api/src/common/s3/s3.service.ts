import { Injectable } from '@nestjs/common'
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export interface GenerateSignedUrlParams {
  bucket: string
  key: string
  expiresInSeconds?: number
  contentType?: string
}

@Injectable()
export class S3Service {
  private readonly client: S3Client

  constructor() {
    this.client = new S3Client({
      region: process.env.S3_REGION || 'eu-north-1',
      credentials: process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY ? {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      } : undefined,
    })
  }

  async generateUploadUrl(params: GenerateSignedUrlParams): Promise<string> {
    const { bucket, key, expiresInSeconds = 300, contentType = 'application/octet-stream' } = params
    const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType })
    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds })
  }

  async generateDownloadUrl(params: GenerateSignedUrlParams): Promise<string> {
    const { bucket, key, expiresInSeconds = 300 } = params
    const command = new GetObjectCommand({ Bucket: bucket, Key: key })
    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds })
  }
}



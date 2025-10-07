import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { File, FileType } from './file.entity'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class FilesService {
  private s3Client: S3Client
  private bucketName: string

  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
  ) {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    })
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || 'club-corra-uploads'
  }

  async generatePresignedUploadUrl(
    fileName: string,
    mimeType: string,
    fileType: FileType = FileType.RECEIPT,
    userId?: string,
  ): Promise<{
    uploadUrl: string
    fileKey: string
    publicUrl: string
  }> {
    try {
      // Validate file type and size
      this.validateFileType(mimeType)
      
      // Generate unique file key
      const fileExtension = this.getFileExtension(fileName)
      const fileKey = `${fileType.toLowerCase()}/${uuidv4()}${fileExtension}`
      
      // Create presigned URL for upload
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        ContentType: mimeType,
        ACL: 'public-read', // Make file publicly readable
        Metadata: {
          originalName: fileName,
          uploadedBy: userId || 'anonymous',
          fileType: fileType,
        },
      })

      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 }) // 1 hour
      const publicUrl = `https://${this.bucketName}.s3.amazonaws.com/${fileKey}`

      return {
        uploadUrl,
        fileKey,
        publicUrl,
      }
    } catch (error) {
      throw new BadRequestException(`Failed to generate upload URL: ${error.message}`)
    }
  }

  async saveFileRecord(
    fileKey: string,
    fileName: string,
    originalName: string,
    mimeType: string,
    size: number,
    fileType: FileType,
    userId?: string,
    description?: string,
  ): Promise<File> {
    const publicUrl = `https://${this.bucketName}.s3.amazonaws.com/${fileKey}`
    
    const file = this.fileRepository.create({
      userId: userId || 'anonymous',
      fileName,
      originalName,
      mimeType,
      size,
      url: publicUrl,
      type: fileType,
      description,
    })

    return this.fileRepository.save(file)
  }

  async getFileById(id: string): Promise<File | null> {
    return this.fileRepository.findOne({ where: { id } })
  }

  async getUserFiles(userId: string, fileType?: FileType): Promise<File[]> {
    const queryBuilder = this.fileRepository
      .createQueryBuilder('file')
      .where('file.userId = :userId', { userId })
      .orderBy('file.createdAt', 'DESC')

    if (fileType) {
      queryBuilder.andWhere('file.type = :fileType', { fileType })
    }

    return queryBuilder.getMany()
  }

  private validateFileType(mimeType: string): void {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf',
    ]

    if (!allowedTypes.includes(mimeType)) {
      throw new BadRequestException(
        `File type ${mimeType} not allowed. Allowed types: ${allowedTypes.join(', ')}`
      )
    }
  }

  private getFileExtension(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.')
    if (lastDotIndex === -1) {
      return ''
    }
    return fileName.substring(lastDotIndex)
  }
}

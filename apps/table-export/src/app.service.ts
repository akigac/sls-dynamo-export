import { Injectable } from '@nestjs/common';
import { DynamoDB } from 'aws-sdk'

import { regions } from '../../lib/const'
import { DynamoService } from '../../lib/aws/DynamoService'

import { ServiceLogDecorator } from '../../lib/serviceLogDecorator'
import { S3Service } from 'lib/aws/S3Service';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  @ServiceLogDecorator()
  async getRgionList() {
    console.log(process.env.ACCOUNT_ID)
    return regions
  }

  @ServiceLogDecorator()
  async getTables(region: string) {
    const db = new DynamoDB({region: region})

    try {
      const tables = await db.listTables().promise();
      console.log(tables)
      return tables
    } catch (e) {
      console.log("dynamo error.")
      console.log(e)
    }
  
    return [];
  }

  @ServiceLogDecorator()
  async startExport(region: string, tableName: string) {

    // arn:aws:dynamodb:us-east-1:450871724179:table/analytics
    const tableArn = `arn:aws:dynamodb:${region}:${process.env.ACCOUNT_ID}:table/${tableName}`

    try {

      const dbService = new DynamoService(region)

      console.log("before check")
      if (!await dbService.checkExport(tableArn)) {

        // 過去データ削除
        const s3Service = new S3Service()
        console.log("before delete")
        await s3Service.deleteExportData(region, tableName)

        // 設定ON
        console.log("before on")
        await dbService.pointInTimeOn(tableName)

        // Export開始
        console.log("before exporet")
        await dbService.exportToBucket(region, process.env.DYNAMO_ANALYTICS_BUCKET, tableName, tableArn);

        // 設定OFF
        console.log("before off")
        await dbService.pointInTimeOff(tableName)

        return {status: "success"}
      } else {
        return {status: "fail", message: "export is progress."}
      }

    } catch (e) {
      console.error(e)
      return { status: "fail", message: e.message}
    }
  }

  @ServiceLogDecorator()
  async deleteExportTable(region:string, tableName:string) {// 過去データ削除
    const s3Service = new S3Service()
    await s3Service.deleteExportData(region, tableName)

    return {status: "success"}
  }

  @ServiceLogDecorator()
  async copyS3ObjectData(key:string) {
      const s3Service = new S3Service()
      return await s3Service.copyObject(key, process.env.DYNAMO_ANALYTICS_BUCKET)
  }

  @ServiceLogDecorator()
  async checkExport(region: string, tableName: string) {
    
    const tableArn = `arn:aws:dynamodb:${region}:${process.env.ACCOUNT_ID}:table/${tableName}`
    const dbService = new DynamoService()

    try {
      const result = await dbService.checkExport(tableArn)
      return {status: true, isExport: result}
    } catch (e) {
      console.log("dynamo error.")
      console.log(e)

      return {status: "error", message: e.message}
    }
  }
}

import { DynamoDB } from 'aws-sdk'

export class DynamoService {

  private db: DynamoDB;

  constructor(region='us-east-1') {
    this.db = new DynamoDB({region})
  }  

  // S3バケットにテーブルデータをExport
  async exportToBucket(region:string, bucketName:string, tableName:string, tableArn: string) {
    const params: DynamoDB.Types.ExportTableToPointInTimeInput = {
      TableArn: tableArn,
      S3Bucket: bucketName,
      S3Prefix: `exports/${region}/${tableName}/`
    }
    console.log(params);
    await this.db.exportTableToPointInTime(params).promise()
  }
  
  // ポイントインリカバリをONにする
  async pointInTimeOn(tableName: string) {
    const bakckupParams: DynamoDB.Types.UpdateContinuousBackupsInput = {
      TableName: tableName,
      PointInTimeRecoverySpecification: {
        PointInTimeRecoveryEnabled: true
      }
    }
    await this.db.updateContinuousBackups(bakckupParams).promise()
  }

  // ポイントインリカバリをOFFにする
  async pointInTimeOff(tableName: string) {
    const bakckupParams: DynamoDB.Types.UpdateContinuousBackupsInput = {
      TableName: tableName,
      PointInTimeRecoverySpecification: {
        PointInTimeRecoveryEnabled: false
      }
    }
    await this.db.updateContinuousBackups(bakckupParams).promise()
  }

  // ポイントインリカバリの実行確認
  //   処理中：true、　未処理: false
  async checkExport(TableArn:string) {
    const result = await this.db.listExports({ TableArn }).promise()
    console.log(result)
    console.log(TableArn)
    if (result.ExportSummaries) {

      for (const item of result.ExportSummaries) {
        if (item.ExportArn.match(TableArn) != null) {
          if (item.ExportStatus === "IN_PROGRESS") {
            return true
          }
        } 
      }
    }
    return false;
  }

  async query(region: string) {
    
    var params = {
        ExpressionAttributeValues: {
          ':s': {N: '2'},
          ':e' : {N: '09'},
          ':topic' : {S: 'PHRASE'}
        },
        KeyConditionExpression: 'Season = :s and Episode > :e',
        ProjectionExpression: 'Episode, Title, Subtitle',
        FilterExpression: 'contains (Subtitle, :topic)',
        TableName: 'EPISODES_TABLE'
      };

  }

}
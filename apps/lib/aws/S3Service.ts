import { S3 } from 'aws-sdk'

export class S3Service {

  private s3: S3;

  constructor(region='us-east-1') {
    this.s3 = new S3()
  }  

  // S3バケットにExportしたデータ削除
  async deleteExportData(region:string, tableName:string) {

    const params = [
       {
         Bucket: process.env.DYNAMO_ANALYTICS_BUCKET,
         Prefix: `exports/${region}/${tableName}/`
       },
       {
        Bucket: process.env.DYNAMO_ANALYTICS_BUCKET,
        Prefix: `athena/data/${region}/${tableName}/`
      },
    ]
    console.log("before params loop.")
    params.forEach(async param => {
      try {
        console.log("before deletePrefixAll.")
        await this.deletePrefixAll(param)

      } catch(e) {
        console.log("deletePrefixAll error.")
        console.log(e)
      }
    });
  } 

  private async deletePrefixAll(param: {Bucket:string, Prefix:string, ContinuationToken?:string}, keyList = []) {
    
    try {
      const list = await this.s3.listObjectsV2(param).promise()
    
      if (list.Contents) {
        list.Contents.forEach(item =>{
          keyList.push(item.Key)
        })
        
        // keyの残りあり
        if (list.IsTruncated) {
          param.ContinuationToken = list.NextContinuationToken;
          
          // 地震の呼び出し
          await this.deletePrefixAll(param, keyList);
        } else {
          // 取得完了
          keyList.forEach(async key => {
            const deleteParam = {
              Bucket: process.env.DYNAMO_ANALYTICS_BUCKET,
              Key: key
            }
            await this.s3.deleteObject(deleteParam).promise()
          })
        }

        // for (const item of list.Contents) {
        //   console.log("item:", item)
        // // list.Contents.forEach(async item => {
        //   try {
        //     const deleteParam = {
        //       Bucket: process.env.DYNAMO_ANALYTICS_BUCKET,
        //       Key: item.Key
        //     }
        //     console.log("deleteParam:", deleteParam)
        //     const result = await this.s3.deleteObject(deleteParam).promise()
        //     console.log(result)
        //   } catch (e) {
        //     console.log("delete error, key:", item.Key)
        //   }
        // }
      } 
    } catch(e) {
      console.log("listObjectsV2 error.")
      console.log(e)
    }
  }

  // export後にGlue参照フォルダにコピー
  async copyObject(fromKey:string, bucketName:string) {

    // exports/us-east-1/analytics/AWSDynamoDB/01630929810677-069c61c6/data/sf5hpzhzm42xpoycj7ovfci63u.json.gz
    // 1:region, 2:tableName, 2:tableName, 6:fileName
    const fromKeys = fromKey.split('/')
  
    const params: S3.Types.CopyObjectRequest = {
      Bucket: bucketName, // コピー先
      Key: `athena/data/${fromKeys[1]}/${fromKeys[2]}/${fromKeys[6]}`,　// コピー先
      CopySource: `${bucketName}/${fromKey}`,　// コピー元
    }
    console.log("copy params:", params)
    return await this.s3.copyObject(params).promise()
  }
}
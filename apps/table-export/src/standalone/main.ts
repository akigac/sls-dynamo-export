import { HttpStatus } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Callback, Context, Handler } from 'aws-lambda';
import { DateTime } from 'aws-sdk/clients/devicefarm';
import { AppModule } from '../app.module';
import { AppService } from '../app.service';

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const appService = appContext.get(AppService);

  return {
    body: appService.getHello(),
    statusCode: HttpStatus.OK,
  };
};

export declare interface S3Event {
    Records: Array<Record>
}
// https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/with-s3.html
export declare interface Record {
  eventVersion: string,
  eventSource: string,
  awsRegion: string,
  eventTime: DateTime,
  eventName: string,
  userIdentity: {
    principalId: string
  },
  requestParameters: {
    sourceIPAddress: string
  },
  responseElements: {
    'x-amz-request-id': string,
    'x-amz-id-2': string
  },
  s3: {
    s3SchemaVersion: string,
    configurationId: string,
    bucket: {
      name: string,
      ownerIdentity: {
        principalId: string
      },
      arn: string
    },
    object: {
      key: string,
      size: number,
      eTag: string,
      sequencer: string
    }
  }
}

export const dynamoExportHndler: Handler = async (
    event: S3Event,
    context: Context,
    callback: Callback,
  ) => {
    const appContext = await NestFactory.createApplicationContext(AppModule);
    const appService = appContext.get(AppService);

    console.log("event", event);

    if(event.Records[0]) {
      const key = event.Records[0].s3.object.key
      const result = await appService.copyS3ObjectData(key)
      console.log("result", result)
      return {
        statusCode: HttpStatus.OK,
      };
    } else {
      return {status: "fail", message: "event not fount s3 key."}
    }
  };
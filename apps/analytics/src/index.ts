import { NestFactory } from '@nestjs/core';
import serverlessExpress from '@vendia/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { json, urlencoded } from 'express';
import { AnalyticsModule } from './analytics.module';

let server: Handler;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AnalyticsModule);
  await app.init();

  // json parse時のlimit
  app.use(json({limit: '50mb'}))
  // encodeされたpaseのlimit
  app.use(urlencoded({limit: '50mb', extended:true}))

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};

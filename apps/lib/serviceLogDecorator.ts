import { Logger } from "@nestjs/common";

/**
 * @see https://qiita.com/Quramy/items/e3a43bb1734b8a7331e8
 *      https://mae.chab.in/archives/59845#post59845-1-4
 *      https://qiita.com/tktcorporation/items/65a8efeaee8cb7268744
 *
 * Method Decorator（メソッド・デコレータ）
 *   async function用のデコレータ
 *   functionの前後でログ出力
 */
export function ServiceLogDecorator(): MethodDecorator {

  return function (
      target: any,
      methodName: string,
      descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const originalMethodFunc = async () => {
        return originalMethod.apply(this, [...args]);
      };
      // このメソッド内に自由に記述していく。
      const asyncFunc = async () => {

        const logger = new Logger(methodName);
        logger.debug(args);
        // デコレータ を付与した関数本体
        const response = await originalMethodFunc();
        logger.debug("end");
        return response;
      };
      return asyncFunc();
    };
  };
}
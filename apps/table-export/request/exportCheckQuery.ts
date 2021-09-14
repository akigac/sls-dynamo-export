import * as v from 'class-validator';
import { regions } from 'lib/const';

export class ExportCheckQuery {
  @v.IsIn(regions)
  @v.IsNotEmpty()
  region: string

  @v.IsString()
  @v.IsNotEmpty()
  tableName: string
}
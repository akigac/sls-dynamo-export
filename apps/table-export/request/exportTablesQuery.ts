import * as v from 'class-validator';
import { regions } from 'lib/const';

export class ExportTablesQuery {

  @v.IsIn(regions)
  @v.IsNotEmpty()
  region: string
}
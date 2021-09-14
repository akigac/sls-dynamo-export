import * as v from 'class-validator';
import { regions } from 'lib/const';

export class ExportTableBody {
  @v.IsIn(regions)
  region: string
  
  @v.IsString()
  @v.IsNotEmpty()
  tableName: string
}
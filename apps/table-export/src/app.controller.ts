import { 
  Controller, Get, Post, Query, Put,
  ValidationPipe, UsePipes, ParseArrayPipe, Body, Delete
  } from '@nestjs/common';
import { AppService } from './app.service';

import { ExportTablesQuery } from '../request/exportTablesQuery'
import { ExportTableBody } from '../request/exportTableBody'
import { ExportCheckQuery } from '../request/exportCheckQuery'

@Controller('export')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('world')
  getWorld(): string {
    return "world!";
  }

  @Get('regions')
  async getRegions() {
    return await this.appService.getRgionList()
  }

  @Get('tables')
  @UsePipes(new ValidationPipe( { transform: true }))
  async getTables(@Query() query: ExportTablesQuery) {
    console.log("query", query)
    return await this.appService.getTables(query.region)
  }

  @Put('exportTable')
  // @UsePipes(new ValidationPipe( { transform: true }))
  async exportTable(@Body() body: ExportTableBody): Promise<any> {
    console.log("body", body)
    
    return await this.appService.startExport(body.region, body.tableName)
  }

  @Delete('delete')
  @UsePipes(new ValidationPipe( { transform: true }))
  async deleteExportTable(@Body() body: ExportTableBody): Promise<any> {
    console.log("body", body)
    
    return await this.appService.deleteExportTable(body.region, body.tableName)
  }

  @Get('check')
  @UsePipes(new ValidationPipe( { transform: true }))
  async checkExport(@Query() query: ExportCheckQuery) {
    console.log("query", query)
    return await this.appService.checkExport(query.region, query.tableName)
  }
}

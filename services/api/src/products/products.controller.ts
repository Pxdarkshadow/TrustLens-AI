import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { join } from 'node:path';
import { ProductsService, Product, SupplyChainEvent, ProductImage } from './products.service';
import { Roles, Public } from '../auth/decorators';
import { imageUploadOptions } from '../common/upload';
import { storagePath } from '../config/config';

@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  findAll(
    @Query('page') page: unknown,
    @Query('limit') limit: unknown,
    @Query('search') search: unknown,
    @Query('status') status: unknown,
    @Query('manufacturerId') manufacturerId: unknown,
    @Query('sortBy') sortBy: unknown,
    @Query('sortOrder') sortOrder: unknown
  ) {
    return this.products.findAll({ page, limit, search, status, manufacturerId, sortBy, sortOrder });
  }

  @Get('image/:filename')
  @Public()
  image(@Param('filename') filename: string, @Res() res: Response): void {
    res.sendFile(this.products.getImageByFilename(filename));
  }

  @Get(':serialNumber')
  findBySerial(@Param('serialNumber') serialNumber: string): Product {
    return this.products.findBySerial(serialNumber);
  }

  @Post()
  @Roles('manufacturer')
  @UseInterceptors(FileInterceptor('image', imageUploadOptions(join(process.cwd(), storagePath('images', 'products')))))
  create(
    @Body() body: { serialNumber: string; name: string; brand?: string; description?: string; manufacturerName?: string; manufacturerLocation?: string; manufactureDate?: string },
    @UploadedFile() file?: Express.Multer.File
  ): Product {
    const product = this.products.create(body);
    if (file) {
      this.products.addImage(product.serialNumber, file.filename);
      return this.products.findBySerial(product.serialNumber);
    }
    return product;
  }

  @Patch(':serialNumber')
  @Roles('manufacturer')
  @UseInterceptors(FileInterceptor('image', imageUploadOptions(join(process.cwd(), storagePath('images', 'products')))))
  update(
    @Param('serialNumber') serialNumber: string,
    @Body() body: { name?: string; brand?: string; description?: string },
    @UploadedFile() file?: Express.Multer.File
  ): Product {
    const product = this.products.update(serialNumber, body);
    if (file) this.products.addImage(product.serialNumber, file.filename);
    return this.products.findBySerial(serialNumber);
  }

  @Post(':serialNumber/history')
  @Roles('supplier', 'retailer')
  addHistory(
    @Param('serialNumber') serialNumber: string,
    @Body() body: { actor: string; role: string; location: string; timestamp: string; isSold: boolean }
  ): Product {
    return this.products.addHistory(serialNumber, body);
  }

  @Get(':serialNumber/history')
  history(@Param('serialNumber') serialNumber: string): SupplyChainEvent[] {
    return this.products.history(serialNumber);
  }

  @Post(':serialNumber/verify')
  @Public()
  verify(@Param('serialNumber') serialNumber: string) {
    return this.products.verify(serialNumber);
  }

  @Post(':serialNumber/qr')
  @Roles('manufacturer', 'admin')
  generateQR(@Param('serialNumber') serialNumber: string, @Req() req: Request) {
    return this.products.generateQR(serialNumber, origin(req));
  }

  @Get(':serialNumber/qr/download')
  @Roles('manufacturer', 'admin')
  downloadQR(@Param('serialNumber') serialNumber: string, @Res() res: Response): void {
    const p = this.products.qrImagePath(serialNumber);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${serialNumber}.png"`);
    res.sendFile(p);
  }

  @Post(':serialNumber/images')
  @Roles('manufacturer')
  @UseInterceptors(FileInterceptor('image', imageUploadOptions(join(process.cwd(), storagePath('images', 'products')))))
  uploadImage(@Param('serialNumber') serialNumber: string, @UploadedFile() file: Express.Multer.File): ProductImage {
    return this.products.addImage(serialNumber, file.filename);
  }

  @Delete(':serialNumber/images/:imageId')
  @Roles('manufacturer')
  removeImage(@Param('serialNumber') serialNumber: string, @Param('imageId') imageId: string): { success: boolean; message: string } {
    this.products.removeImage(serialNumber, imageId);
    return { success: true, message: 'Image removed' };
  }

  @Post(':serialNumber/revoke')
  @Roles('manufacturer')
  revoke(@Param('serialNumber') serialNumber: string): Product {
    return this.products.setStatus(serialNumber, 'revoked');
  }

  @Post(':serialNumber/activate')
  @Roles('manufacturer')
  activate(@Param('serialNumber') serialNumber: string): Product {
    return this.products.setStatus(serialNumber, 'active');
  }
}

function origin(req: Request): string {
  const raw = req.headers.origin || req.headers.referer || 'http://localhost:5173';
  const m = /^https?:\/\/[^/]+/i.exec(raw);
  return m ? m[0] : 'http://localhost:5173';
}
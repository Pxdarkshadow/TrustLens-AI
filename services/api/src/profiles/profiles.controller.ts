import { Controller, Get, Param, Patch, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { join } from 'node:path';
import { ProfilesService, Profile, PROFILE_IMG_DIR } from './profiles.service';
import { Roles, Public } from '../auth/decorators';
import { imageUploadOptions } from '../common/upload';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profiles: ProfilesService) {}

  @Get('me')
  me(@Req() req: Request): Profile {
    return this.profiles.findByUserId((req.user as { id: string }).id);
  }

  @Get()
  @Roles('admin')
  findAll(): Profile[] {
    return this.profiles.findAll();
  }

  @Post()
  @Roles('admin')
  create(@Body() body: { username: string; name?: string; description?: string; website?: string; location?: string; role: string }): {
    success: boolean;
    data: Profile;
    message: string;
  } {
    const data = this.profiles.create(body);
    return { success: true, data, message: 'Profile created' };
  }

  @Patch('me')
  @UseInterceptors(FileInterceptor('image', imageUploadOptions(PROFILE_IMG_DIR())))
  updateMe(
    @Req() req: Request,
    @Body() body: { name?: string; description?: string; website?: string; location?: string },
    @UploadedFile() file?: Express.Multer.File
  ): { success: boolean; data: Profile; message: string } {
    const userId = (req.user as { id: string }).id;
    if (file) this.profiles.setImage(userId, file.filename);
    const data = this.profiles.updateMe(userId, body);
    return { success: true, data, message: 'Profile updated' };
  }

  @Post('me/image')
  @UseInterceptors(FileInterceptor('image', imageUploadOptions(PROFILE_IMG_DIR())))
  uploadImage(@Req() req: Request, @UploadedFile() file: Express.Multer.File): { success: boolean; data: { imageUrl: string; filename: string } } {
    const p = this.profiles.setImage((req.user as { id: string }).id, file.filename);
    return { success: true, data: { imageUrl: p.imageUrl as string, filename: file.filename } };
  }

  @Get('image/:filename')
  @Public()
  image(@Param('filename') filename: string, @Res() res: Response): void {
    const p = this.profiles.imagePath(filename);
    res.sendFile(join(process.cwd(), p));
  }

  @Get(':username')
  findByUsername(@Param('username') username: string): Profile {
    return this.profiles.findByUsername(username);
  }
}
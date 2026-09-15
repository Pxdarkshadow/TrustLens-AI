import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UsersService, User } from './users.service';
import { Roles } from '../auth/decorators';

@Controller('users')
@Roles('admin')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  findAll(@Query('page') page: unknown, @Query('limit') limit: unknown, @Query('search') search: unknown) {
    return this.users.findAll(page, limit, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string): User {
    return this.users.findOne(id);
  }

  @Post()
  create(@Body() body: { username: string; password: string; role: string }): { success: boolean; data: User; message: string } {
    const data = this.users.create(body.username, body.password, body.role);
    return { success: true, data, message: 'User created' };
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: { username?: string; password?: string; role?: string }
  ): { success: boolean; data: User; message: string } {
    const data = this.users.update(id, body);
    return { success: true, data, message: 'User updated' };
  }

  @Delete(':id')
  remove(@Param('id') id: string): { success: boolean; message: string } {
    this.users.remove(id);
    return { success: true, message: 'User deleted' };
  }

  @Patch(':id/role')
  updateRole(@Param('id') id: string, @Body() body: { role: string }): { success: boolean; data: User; message: string } {
    const data = this.users.updateRole(id, body.role);
    return { success: true, data, message: 'Role updated' };
  }
}
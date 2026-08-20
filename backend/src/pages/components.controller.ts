import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.interface';
import { ComponentsService } from './components.service';
import { CreateComponentDto } from './dto/create-component.dto';
import { UpdateComponentDto } from './dto/update-component.dto';
import { ReorderComponentsDto } from './dto/reorder-components.dto';

@Controller('pages/:pageId/components')
export class ComponentsController {
  constructor(private readonly componentsService: ComponentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Param('pageId') pageId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() createComponentDto: CreateComponentDto,
  ) {
    return this.componentsService.createComponent(
      user.id,
      pageId,
      createComponentDto,
    );
  }

  // Registered before ':componentId' — Nest/Express matches routes in
  // declaration order, so a param route declared first would swallow
  // PUT /reorder requests (matching "reorder" as componentId).
  @Put('reorder')
  @UseGuards(JwtAuthGuard)
  async reorder(
    @Param('pageId') pageId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() reorderDto: ReorderComponentsDto,
  ) {
    return this.componentsService.reorderComponents(
      user.id,
      pageId,
      reorderDto,
    );
  }

  @Put(':componentId')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('pageId') pageId: string,
    @Param('componentId') componentId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateComponentDto: UpdateComponentDto,
  ) {
    return this.componentsService.updateComponent(
      user.id,
      pageId,
      componentId,
      updateComponentDto,
    );
  }

  @Delete(':componentId')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('pageId') pageId: string,
    @Param('componentId') componentId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.componentsService.deleteComponent(user.id, pageId, componentId);
  }
}

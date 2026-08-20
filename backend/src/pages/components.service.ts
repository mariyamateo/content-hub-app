import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PageComponent } from './schemas/page-component.schema';
import { Page } from './schemas/page.schema';
import { CreateComponentDto } from './dto/create-component.dto';
import { UpdateComponentDto } from './dto/update-component.dto';
import { ReorderComponentsDto } from './dto/reorder-components.dto';

@Injectable()
export class ComponentsService {
  constructor(
    @InjectModel('PageComponent')
    private readonly componentModel: Model<PageComponent>,
    @InjectModel('Page') private readonly pageModel: Model<Page>,
  ) {}

  // Add component to page
  async createComponent(
    userId: string,
    pageId: string,
    createComponentDto: CreateComponentDto,
  ) {
    // Verify page exists and user owns it
    const page = await this.pageModel.findById(pageId);
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    if (page.userId.toString() !== userId) {
      throw new ForbiddenException('Unauthorized');
    }

    // Get max order
    const lastComponent = await this.componentModel
      .findOne({ pageId })
      .sort({ order: -1 });
    const nextOrder = lastComponent ? lastComponent.order + 1 : 0;

    // Create component
    const component = await this.componentModel.create({
      pageId: new Types.ObjectId(pageId),
      type: createComponentDto.type,
      order: nextOrder,
      properties: createComponentDto.properties,
    });

    // Add to page's components array
    await this.pageModel.findByIdAndUpdate(
      pageId,
      { $push: { components: component._id } },
      { new: true },
    );

    return {
      id: component._id,
      type: component.type,
      order: component.order,
      properties: component.properties,
      createdAt: component.createdAt,
    };
  }

  // Update component
  async updateComponent(
    userId: string,
    pageId: string,
    componentId: string,
    updateComponentDto: UpdateComponentDto,
  ) {
    // Verify ownership
    const page = await this.pageModel.findById(pageId);
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    if (page.userId.toString() !== userId) {
      throw new ForbiddenException('Unauthorized');
    }

    const component = await this.componentModel.findById(componentId);
    if (!component) {
      throw new NotFoundException('Component not found');
    }
    if (component.pageId.toString() !== pageId) {
      throw new NotFoundException('Component not found');
    }

    if (updateComponentDto.properties) {
      component.properties = updateComponentDto.properties;
    }
    if (updateComponentDto.order !== undefined) {
      component.order = updateComponentDto.order;
    }

    await component.save();

    return {
      id: component._id,
      type: component.type,
      order: component.order,
      properties: component.properties,
      updatedAt: component.updatedAt,
    };
  }

  // Delete component
  async deleteComponent(userId: string, pageId: string, componentId: string) {
    // Verify ownership
    const page = await this.pageModel.findById(pageId);
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    if (page.userId.toString() !== userId) {
      throw new ForbiddenException('Unauthorized');
    }

    const component = await this.componentModel.findById(componentId);
    if (!component) {
      throw new NotFoundException('Component not found');
    }
    if (component.pageId.toString() !== pageId) {
      throw new NotFoundException('Component not found');
    }

    // Remove from page's components array
    await this.pageModel.findByIdAndUpdate(
      pageId,
      { $pull: { components: componentId } },
      { new: true },
    );

    await this.componentModel.findByIdAndDelete(componentId);

    return { success: true };
  }

  // Reorder components
  async reorderComponents(
    userId: string,
    pageId: string,
    reorderDto: ReorderComponentsDto,
  ) {
    // Verify ownership
    const page = await this.pageModel.findById(pageId);
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    if (page.userId.toString() !== userId) {
      throw new ForbiddenException('Unauthorized');
    }

    // Update order for each component
    for (let i = 0; i < reorderDto.order.length; i++) {
      await this.componentModel.findByIdAndUpdate(reorderDto.order[i], {
        order: i,
      });
    }

    return { success: true };
  }
}

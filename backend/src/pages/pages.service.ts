import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Page } from './schemas/page.schema';
import { PageComponent } from './schemas/page-component.schema';
import { Analytics } from './schemas/analytics.schema';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PagesService {
  constructor(
    @InjectModel('Page') private readonly pageModel: Model<Page>,
    @InjectModel('PageComponent')
    private readonly componentModel: Model<PageComponent>,
    @InjectModel('Analytics') private readonly analyticsModel: Model<Analytics>,
  ) {}

  // Create page
  async createPage(userId: string, createPageDto: CreatePageDto) {
    // Generate unique slug from title
    let slug = createPageDto.title.toLowerCase().replace(/\s+/g, '-');
    const existingPage = await this.pageModel.findOne({ slug });
    if (existingPage) {
      slug = `${slug}-${Date.now()}`;
    }

    const page = await this.pageModel.create({
      userId: new Types.ObjectId(userId),
      title: createPageDto.title,
      slug,
      status: 'draft',
      components: [],
    });

    return {
      id: page._id,
      title: page.title,
      slug: page.slug,
      status: page.status,
      createdAt: page.createdAt,
    };
  }

  // Get all pages for user
  async getPages(userId: string) {
    const pages = await this.pageModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('components')
      .sort({ createdAt: -1 });

    return pages.map((page) => ({
      id: page._id,
      title: page.title,
      slug: page.slug,
      status: page.status,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      componentCount: page.components.length,
    }));
  }

  // Get page by ID
  async getPageById(userId: string, pageId: string) {
    const page = await this.pageModel
      .findById(pageId)
      .populate<{ components: PageComponent[] }>('components');

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    if (page.userId.toString() !== userId) {
      throw new ForbiddenException('Unauthorized');
    }

    return {
      id: page._id,
      userId: page.userId,
      title: page.title,
      slug: page.slug,
      status: page.status,
      publishedAt: page.publishedAt,
      // `page.components` (the ObjectId[] field) preserves insertion order,
      // not the components' own `order` field — populate() returns them in
      // that array's order regardless of what reorderComponents() set, so
      // sort explicitly or a persisted reorder silently reverts on refetch.
      components: page.components
        .map(formatComponent)
        .sort((a, b) => a.order - b.order),
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
    };
  }

  // Update page
  async updatePage(
    userId: string,
    pageId: string,
    updatePageDto: UpdatePageDto,
  ) {
    const page = await this.pageModel.findById(pageId);

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    if (page.userId.toString() !== userId) {
      throw new ForbiddenException('Unauthorized');
    }

    if (updatePageDto.title) {
      page.title = updatePageDto.title;
    }

    if (updatePageDto.status) {
      page.status = updatePageDto.status;
      if (updatePageDto.status === 'published') {
        page.publishedAt = new Date();
      }
    }

    await page.save();

    return {
      id: page._id,
      title: page.title,
      slug: page.slug,
      status: page.status,
      publishedAt: page.publishedAt,
      updatedAt: page.updatedAt,
    };
  }

  // Delete page
  async deletePage(userId: string, pageId: string) {
    const page = await this.pageModel.findById(pageId);

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    if (page.userId.toString() !== userId) {
      throw new ForbiddenException('Unauthorized');
    }

    // Delete components and analytics
    await this.componentModel.deleteMany({ pageId });
    await this.analyticsModel.deleteMany({ pageId });
    await this.pageModel.findByIdAndDelete(pageId);

    return { success: true };
  }

  // Get published page (public, no auth)
  async getPublishedPage(slug: string) {
    const page = await this.pageModel
      .findOne({ slug, status: 'published' })
      .populate<{ components: PageComponent[] }>('components');

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    return {
      id: page._id,
      title: page.title,
      slug: page.slug,
      components: page.components
        .map(formatComponent)
        .sort((a, b) => a.order - b.order),
      publishedAt: page.publishedAt,
    };
  }
}

// getPageById/getPublishedPage populate the full PageComponent documents,
// which serialize with `_id` — reshape to the `{ id, ... }` contract the
// rest of the API (create/update/delete component) already returns, so the
// frontend can reliably key/select components by `.id`.
function formatComponent(component: PageComponent) {
  return {
    id: component._id,
    type: component.type,
    order: component.order,
    properties: component.properties,
    createdAt: component.createdAt,
    updatedAt: component.updatedAt,
  };
}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class PageComponent extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Page', required: true })
  pageId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['hero', 'text', 'image', 'button', 'gallery', 'cta'],
  })
  type: string;

  @Prop({ required: true })
  order: number;

  @Prop({ type: Object, default: {} })
  properties: Record<string, any>;

  @Prop({ default: () => new Date() })
  createdAt: Date;

  @Prop({ default: () => new Date() })
  updatedAt: Date;
}

export const PageComponentSchema = SchemaFactory.createForClass(PageComponent);

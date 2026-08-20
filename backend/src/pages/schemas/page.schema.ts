import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Page extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ enum: ['draft', 'published'], default: 'draft' })
  status: string;

  @Prop()
  publishedAt?: Date;

  @Prop({ type: [Types.ObjectId], ref: 'PageComponent', default: [] })
  components: Types.ObjectId[];

  @Prop({ default: () => new Date() })
  createdAt: Date;

  @Prop({ default: () => new Date() })
  updatedAt: Date;
}

export const PageSchema = SchemaFactory.createForClass(Page);

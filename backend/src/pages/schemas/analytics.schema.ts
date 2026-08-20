import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema()
export class Analytics extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Page', required: true })
  pageId: Types.ObjectId;

  @Prop({ required: true, enum: ['view', 'click'] })
  eventType: string;

  @Prop()
  componentId?: string;

  @Prop()
  componentType?: string;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;

  @Prop({ default: () => new Date() })
  timestamp: Date;
}

export const AnalyticsSchema = SchemaFactory.createForClass(Analytics);

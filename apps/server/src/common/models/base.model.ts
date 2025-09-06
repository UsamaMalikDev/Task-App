import { Prop } from '@nestjs/mongoose';

export class BaseModel {
  @Prop({ required: false, type: Boolean, default: false })
  deleted: boolean;
}

import * as mongoosePaginate from 'mongoose-paginate';
import { Schema } from 'mongoose';

const MoodSchema = new Schema({
  userId: {
    type: String,
    unique: true,
    required: true,
  },
  themes: [{ type: Schema.Types.ObjectId, ref: 'Theme' }],
});

MoodSchema.index({ userId: 1 });
MoodSchema.plugin(mongoosePaginate);
export { MoodSchema };

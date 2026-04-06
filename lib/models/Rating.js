import mongoose from 'mongoose';

const RatingSchema = new mongoose.Schema({
  fromId: { type: mongoose.Schema.Types.ObjectId, required: true },
  toId: { type: mongoose.Schema.Types.ObjectId, required: true },
  fromRole: { type: String, enum: ['farmer', 'buyer'], required: true },
  stars: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, default: '' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
}, { timestamps: true });

export default mongoose.models.Rating || mongoose.model('Rating', RatingSchema);

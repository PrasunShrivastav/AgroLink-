import mongoose from 'mongoose';

const BidSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Buyer', required: true },
  buyerName: { type: String, required: true },
  offeredPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  message: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'accepted', 'countered', 'rejected'], default: 'pending' },
  counterPrice: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

const ListingSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  farmerName: { type: String, required: true },
  farmerDistrict: { type: String, required: true },
  farmerState: { type: String, required: true },
  crop: { type: String, required: true },
  variety: { type: String, default: '' },
  quantity: { type: Number, required: true },
  unit: { type: String, enum: ['kg', 'quintal'], default: 'quintal' },
  price: { type: Number, required: true },
  grade: { type: String, enum: ['A', 'B', 'C'], default: 'A' },
  harvestDate: { type: Date, required: true },
  description: { type: String, default: '' },
  photos: [{ type: String }],
  status: { type: String, enum: ['active', 'bid_received', 'sold', 'expired'], default: 'active' },
  bids: [BidSchema],
}, { timestamps: true });

export default mongoose.models.Listing || mongoose.model('Listing', ListingSchema);

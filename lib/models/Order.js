import mongoose from 'mongoose';

const SupplyChainStepSchema = new mongoose.Schema({
  label: { type: String, required: true },
  status: { type: String, enum: ['complete', 'active', 'pending'], default: 'pending' },
  timestamp: { type: Date },
});

const OrderSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Buyer', required: true },
  farmerName: { type: String, required: true },
  buyerName: { type: String, required: true },
  crop: { type: String, required: true },
  quantity: { type: Number, required: true },
  agreedPrice: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  supplyChainSteps: [SupplyChainStepSchema],
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  batchId: { type: String },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);

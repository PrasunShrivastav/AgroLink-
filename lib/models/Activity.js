import mongoose from 'mongoose'

const ActivitySchema = new mongoose.Schema({
  userId:    { type: String, required: true, index: true },
  role:      { type: String, enum: ['farmer', 'buyer'], required: true },
  type:      { type: String, required: true },
  message:   { type: String, required: true },
  meta:      { type: mongoose.Schema.Types.Mixed, default: {} },
  read:      { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

ActivitySchema.index({ userId: 1, createdAt: -1 })

export default mongoose.models.Activity || mongoose.model('Activity', ActivitySchema)

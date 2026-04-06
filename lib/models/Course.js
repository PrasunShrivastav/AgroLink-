import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  duration: { type: String, required: true },
  stipend: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, enum: ['course', 'job'], default: 'course' },
  company: { type: String, default: '' },
  role: { type: String, default: '' },
  salary: { type: String, default: '' },
  enrollments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Farmer' }],
}, { timestamps: true });

export default mongoose.models.Course || mongoose.model('Course', CourseSchema);

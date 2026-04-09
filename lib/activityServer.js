import dbConnect from '@/lib/mongodb';
import Activity from '@/lib/models/Activity';

export async function addActivity(event) {
  try {
    await dbConnect();
    await Activity.create(event);
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

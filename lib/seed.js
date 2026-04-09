import dbConnect from './mongodb.js';
import Farmer from './models/Farmer.js';
import Buyer from './models/Buyer.js';
import Listing from './models/Listing.js';
import Order from './models/Order.js';
import Course from './models/Course.js';

export async function seedDatabase() {
  await dbConnect();
  // Seeding disabled — app runs on real data only
  return true;
}

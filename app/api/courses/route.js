import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Course from '@/lib/models/Course';
import { addActivity } from '@/lib/activityServer';

export async function GET() {
  try {
    await dbConnect();
    const courses = await Course.find({}).sort({ type: 1, createdAt: -1 });
    return NextResponse.json(courses);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const { courseId, farmerId } = await request.json();
    const course = await Course.findById(courseId);
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

    if (course.enrollments.includes(farmerId)) {
      return NextResponse.json({ error: 'Already enrolled' }, { status: 400 });
    }

    course.enrollments.push(farmerId);
    await course.save();

    await addActivity({
      userId:  farmerId,
      role:    'farmer',
      type:    'course_enrolled',
      message: `You enrolled in ${course.title}. Our team will contact you within 2 working days`,
      meta:    { courseId, courseName: course.title }
    });

    return NextResponse.json(course);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

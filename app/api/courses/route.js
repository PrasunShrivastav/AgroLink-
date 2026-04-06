import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Course from '@/lib/models/Course';

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
    return NextResponse.json(course);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

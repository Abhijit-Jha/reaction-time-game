import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, LeaderboardEntry } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection<LeaderboardEntry>('scores');
    
    const scores = await collection
      .find({})
      .sort({ reactionTime: 1 })
      .limit(20)
      .toArray();

    return NextResponse.json({ scores }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, reactionTime } = body;

    // Validate reaction time (must be realistic: >100ms and <2000ms)
    if (typeof reactionTime !== 'number' || reactionTime < 100 || reactionTime > 2000) {
      return NextResponse.json(
        { error: 'Invalid reaction time. Must be between 100ms and 2000ms.' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const collection = db.collection<LeaderboardEntry>('scores');

    const entry: LeaderboardEntry = {
      name: typeof name === 'string' && name.trim() ? name.trim().slice(0, 20) : 'Anonymous',
      reactionTime: Math.round(reactionTime),
      timestamp: new Date(),
    };

    const result = await collection.insertOne(entry);

    // Get the rank of the newly inserted score
    const rank = await collection.countDocuments({
      reactionTime: { $lt: entry.reactionTime }
    }) + 1;

    return NextResponse.json(
      { 
        success: true, 
        id: result.insertedId.toString(),
        rank,
        entry 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to submit score:', error);
    return NextResponse.json(
      { error: 'Failed to submit score' },
      { status: 500 }
    );
  }
}

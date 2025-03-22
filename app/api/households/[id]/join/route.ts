import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await request.json();

    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const joinRequest = await prisma.joinRequest.findFirst({
      where: {
        userId: user.id,
        householdId: params.id,
        status: 'pending'
      }
    });

    if (!joinRequest) {
      return NextResponse.json({ error: 'Join request not found' }, { status: 404 });
    }

    if (action === 'accept') {
      // Create household member
      await prisma.householdMember.create({
        data: {
          userId: user.id,
          householdId: params.id,
          isAdmin: false
        }
      });
    }

    // Update join request status
    await prisma.joinRequest.update({
      where: { id: joinRequest.id },
      data: { status: action === 'accept' ? 'approved' : 'declined' }
    });

    return NextResponse.json({ message: `Join request ${action}ed successfully` });
  } catch (error) {
    console.error('Error handling join request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
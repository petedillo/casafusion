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

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const household = await prisma.household.findUnique({
      where: { id: params.id },
      include: {
        members: true
      }
    });

    if (!household) {
      return NextResponse.json({ error: 'Household not found' }, { status: 404 });
    }

    // Check if user is an admin of the household
    const isAdmin = household.members.some(
      member => member.userId === session.user.id && member.isAdmin
    );

    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is already a member
    const invitedUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!invitedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isAlreadyMember = household.members.some(
      member => member.userId === invitedUser.id
    );

    if (isAlreadyMember) {
      return NextResponse.json({ error: 'User is already a member' }, { status: 400 });
    }

    // Create join request
    const joinRequest = await prisma.joinRequest.create({
      data: {
        userId: invitedUser.id,
        householdId: household.id,
        status: 'pending'
      }
    });

    return NextResponse.json(joinRequest);
  } catch (error) {
    console.error('Error creating invitation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
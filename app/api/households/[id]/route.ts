import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const household = await prisma.household.findUnique({
      where: { id: params.id },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });

    if (!household) {
      return NextResponse.json({ error: 'Household not found' }, { status: 404 });
    }

    // Check if user is a member of the household
    const isMember = household.members.some(
      member => member.user.email === session.user.email
    );

    if (!isMember) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(household);
  } catch (error) {
    console.error('Error fetching household:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description } = await request.json();

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

    const updatedHousehold = await prisma.household.update({
      where: { id: params.id },
      data: {
        name,
        description
      }
    });

    return NextResponse.json(updatedHousehold);
  } catch (error) {
    console.error('Error updating household:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    await prisma.household.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Household deleted successfully' });
  } catch (error) {
    console.error('Error deleting household:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
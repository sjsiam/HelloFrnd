import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { cookies } from 'next/headers';
import { getUserInfo } from '@lib/oauth2';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;
  if (!authToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userInfo = await getUserInfo(authToken);
    const userId = userInfo.id.toString();
    const { type, name, participantIds } = await req.json();

    const conversation = await prisma.conversation.create({
      data: {
        type,
        name,
        members: {
          connect: [
            { id: userId },
            ...participantIds.map((id: string) => ({ id })),
          ],
        },
      },
    });

    return NextResponse.json({ conversationId: conversation.id });
  } catch (error) {
    console.error('Create conversation error:', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;
  if (!authToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userInfo = await getUserInfo(authToken);
    const userId = userInfo.id.toString();

    const conversations = await prisma.conversation.findMany({
      where: {
        members: {
          some: { id: userId },
        },
      },
      select: {
        id: true,
        type: true,
        name: true,
      },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}
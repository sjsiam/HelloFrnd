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
    const { conversationId, content } = await req.json();

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content,
      },
    });

    return NextResponse.json({ messageId: message.id });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
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
    const { searchParams } = new URL(req.url);
    const conversationId = parseInt(searchParams.get('conversationId') || '0');

    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      select: {
        id: true,
        conversationId: true,
        senderId: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        isRead: true,
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
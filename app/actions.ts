'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import prisma from '@/lib/prisma'
import type { Chat } from '@/lib/types'
import { getSession } from '@auth0/nextjs-auth0'

export async function getChats(userId?: string | null) {
  const session = await getSession()

  if (!session) {
    return []
  }

  if (!userId || userId !== session?.user?.sub) {
    return {
      error: 'Unauthorized'
    }
  }

  try {
    const results = await prisma.chat.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      omit: {
        oid: true
      }
    })

    return results as Chat[]
  } catch (error) {
    return []
  }
}

export async function getChat(id: string, userId: string) {
  const session = await getSession()

  if (userId !== session?.user?.sub) {
    return {
      error: 'Unauthorized'
    }
  }

  const chat = await prisma.chat.findUnique({
    where: {
      id
    },
    omit: {
      oid: true
    }
  })

  if (!chat || (userId && chat.userId !== userId)) {
    return null
  }

  return chat as Chat
}

export async function removeChat({ id, path }: { id: string; path: string }) {
  const session = await getSession()

  if (!session) {
    return {
      error: 'Unauthorized'
    }
  }

  // Convert uid to string for consistent comparison with session.user.id
  const chat = await prisma.chat.findUnique({
    where: {
      id
    },
    select: {
      userId: true
    }
  })

  if (chat?.userId !== session?.user?.sub) {
    return {
      error: 'Unauthorized'
    }
  }

  await prisma.chat.delete({
    where: {
      id
    }
  })

  revalidatePath('/')
  return revalidatePath(path)
}

export async function clearChats() {
  const session = await getSession()

  if (!session?.user?.sub) {
    return {
      error: 'Unauthorized'
    }
  }

  await prisma.chat.deleteMany({
    where: {
      userId: session.user.sub
    }
  })

  revalidatePath('/')
  return redirect('/')
}

export async function getSharedChat(id: string) {
  const chat = await prisma.chat.findUnique({
    where: {
      id
    },
    omit: {
      oid: true
    }
  })

  if (!chat || !chat.sharePath) {
    return null
  }

  return chat as Chat
}

export async function shareChat(id: string) {
  const session = await getSession()

  if (!session?.user?.sub) {
    return {
      error: 'Unauthorized'
    }
  }

  const chat = await prisma.chat.findUnique({
    where: {
      id
    },
    omit: {
      oid: true
    }
  })

  if (!chat || chat.userId !== session.user.sub) {
    return {
      error: 'Something went wrong'
    }
  }

  await prisma.chat.update({
    where: {
      id: chat.id
    },
    data: {
      sharePath: `/share/${chat.id}`
    }
  })

  return {...chat, sharePath: `/share/${chat.id}`} as Chat
}

export async function saveChat(chat: Chat) {
  const session = await getSession()

  if (session && session.user) {
    await prisma.chat.upsert({
      where: {
        id: chat.id
      },
      update: chat as any,
      create: chat as any
    })
    revalidatePath(chat.path)
    revalidatePath('/')
  } else {
    return
  }
}

export async function refreshHistory(path: string) {
  redirect(path)
}

export async function getMissingKeys() {
  const keysRequired = ['GOOGLE_GENERATIVE_AI_API_KEY']
  return keysRequired
    .map(key => (process.env[key] ? '' : key))
    .filter(key => key !== '')
}

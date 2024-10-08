import { Separator } from '@/components/ui/separator'
import { UIState } from '@/lib/chat/actions'
import Link from 'next/link'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import type { UserProfile } from '@auth0/nextjs-auth0/client'

export interface ChatList {
  messages: UIState
  user?: UserProfile
  isShared: boolean
}

export function ChatList({ messages, user, isShared }: ChatList) {
  if (!messages.length) {
    return null
  }

  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {!isShared && !user ? (
        <>
          <div className="group relative mb-4 flex items-start md:-ml-12">
            <div className="bg-background flex size-[24px] shrink-0 select-none items-center justify-center rounded-md border shadow-sm">
              <ExclamationTriangleIcon />
            </div>
            <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
              <p className="text-muted-foreground leading-normal">
                Please{' '}
                <Link href="/api/auth/login" className="underline">
                  log in
                </Link>{' '}
                to save and revisit your chat history!
              </p>
            </div>
          </div>
          <Separator className="my-4" />
        </>
      ) : null}

      {messages.map((message, index) => (
        <div key={message.id}>
          {message.display}
          {index < messages.length - 1 && <Separator className="my-4" />}
        </div>
      ))}
    </div>
  )
}

import { Sidebar } from '@/components/sidebar'

import { ChatHistory } from '@/components/chat-history'
import { getSession } from '@auth0/nextjs-auth0'

export async function SidebarDesktop() {
  const session = await getSession()
  if (!session) {
    return null
  }

  return (
    <Sidebar className="peer absolute inset-y-0 z-30 hidden -translate-x-full border-r bg-muted duration-300 ease-in-out data-[state=open]:translate-x-0 lg:flex lg:w-[250px] xl:w-[300px]">
      {/* @ts-ignore */}
      <ChatHistory userId={session.user.sub!} />
    </Sidebar>
  )
}

import * as C from '@/constants'
import * as React from 'react'
import Normal from '.'
import type * as T from '@/constants/types'
import {FocusProvider, ScrollProvider} from './context'
import {OrangeLineContext} from '../orange-line-context'

// Orange line logic:
// When we load a conversation with a non scrolling scrollDirection we'll load the orange line through the rpc.
// While the meta has readMsgID and maxMsgID those values do not update correctly in time to use.
// On mobile when we background we'll clear the orange line and we'll get it when we foreground (as a side effect of being stale).
// On desktop when you become inactive we'll watch for a new message and in that case we'll load the orange line once.
// If we call mark as unread we'll just manually set the value if the rpc succeeds, as calling the rpc does not update immediately.

const useOrangeLine = () => {
  // this hook only deals with the active changes, otherwise the rest of the logic is in the store
  const loadOrangeLine = C.useChatContext(s => s.dispatch.loadOrangeLine)
  const maxVisibleMsgID = C.useChatContext(s => s.meta.maxVisibleMsgID)
  const lastVisibleMsgIDRef = React.useRef(maxVisibleMsgID)
  const newMessageVisible = maxVisibleMsgID !== lastVisibleMsgIDRef.current
  lastVisibleMsgIDRef.current = maxVisibleMsgID
  const active = C.useActiveState(s => s.active)
  const gotMessageWhileInactive = React.useRef(false)
  if (active) {
    gotMessageWhileInactive.current = false
  }
  if (!gotMessageWhileInactive.current && !active && newMessageVisible) {
    gotMessageWhileInactive.current = true
    loadOrangeLine()
  }

  const orangeLine = C.useChatContext(s => s.orangeAboveOrdinal)
  return orangeLine
}

const WithOrange = React.memo(function WithOrange(p: {orangeLine: T.Chat.Ordinal}) {
  return (
    <OrangeLineContext.Provider value={p.orangeLine}>
      <FocusProvider>
        <ScrollProvider>
          <Normal />
        </ScrollProvider>
      </FocusProvider>
    </OrangeLineContext.Provider>
  )
})

const NormalWrapper = React.memo(function NormalWrapper() {
  const orangeLine = useOrangeLine()
  return <WithOrange orangeLine={orangeLine} />
})
export default NormalWrapper

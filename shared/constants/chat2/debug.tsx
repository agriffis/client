// Debug utilities for chat
import * as React from 'react'
import * as C from '@/constants'
import type * as T from '@/constants/types'
import logger from '@/logger'

export const chatDebugEnabled = true as boolean

if (chatDebugEnabled) {
  for (let i = 0; i < 10; ++i) {
    console.log('Debug chat enabled!')
  }
}

const dumpMap = new Map<string, () => string>()

const chatDebugDump = chatDebugEnabled
  ? (conversationIDKey: T.Chat.ConversationIDKey) => {
      const cs = C.getConvoState(conversationIDKey)
      logger.error('[CHATDEBUG] os: ', cs.messageOrdinals)
      const m = cs.meta
      logger.error('[CHATDEBUG] meta: ', {
        inboxLocalVersion: m.inboxLocalVersion,
        inboxVersion: m.inboxVersion,
        maxMsgID: m.maxMsgID,
        maxVisibleMsgID: m.maxVisibleMsgID,
        offline: m.offline,
        readMsgID: m.readMsgID,
        status: m.status,
        timestamp: m.timestamp,
      })
      logger.error('[CHATDEBUG] pen: ', cs.pendingOutboxToOrdinal)
      logger.error(
        '[CHATDEBUG] mm: ',
        [...cs.messageMap.entries()].map(([k, v]) => {
          const {id, ordinal, submitState, outboxID, type} = v
          return {
            key: k,
            length: type === 'text' ? v.text.stringValue().length : -1,
            mid: id,
            ordinal,
            outboxID,
            submitState,
            type,
          }
        })
      )
      const lines = [...dumpMap.values()]
        .reduce((strs, cb) => {
          strs.push(cb())
          return strs
        }, new Array<string>())
        .join('\n')
      logger.error('[CHATDEBUG]: ', lines)
    }
  : undefined

export const DebugChatDumpContext = React.createContext({chatDebugDump})

export const useChatDebugDump = chatDebugEnabled
  ? (key: string, dumpCB: () => string) => {
      React.useEffect(() => {
        dumpMap.set(key, dumpCB)
        return () => {
          dumpMap.delete(key)
        }
      }, [key, dumpCB])
    }
  : (_key: string, _dumpCB: () => string) => {}

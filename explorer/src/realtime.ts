import http from 'http'
import { fromString, saveJobRunTree } from './entity/JobRun'
import WebSocket from 'ws'
import { Connection } from 'typeorm'
import { getDb } from './database'
import { Session, authenticate } from './sessions'

const handleMessage = async (
  message: string,
  chainlinkNodeId: number,
  db: Connection
) => {
  try {
    const jobRun = fromString(message)
    jobRun.chainlinkNodeId = chainlinkNodeId

    await saveJobRunTree(db, jobRun)
    return { status: 201 }
  } catch (e) {
    console.error(e)
    return { status: 422 }
  }
}

export const bootstrapRealtime = async (server: http.Server) => {
  const db = await getDb()
  let clnodeCount = 0
  const sessions = new Map<http.IncomingMessage, Session>()

  // NOTE: This relies on the subtle detail that info.req is the same request
  // as passed in to wss.on to key a session
  const wss = new WebSocket.Server({
    server,
    perMessageDeflate: false,
    verifyClient: (
      info: { origin: string; secure: boolean; req: http.IncomingMessage },
      callback: (
        res: boolean,
        code?: number,
        message?: string,
        headers?: http.OutgoingHttpHeaders
      ) => void
    ) => {
      /* eslint-disable standard/no-callback-literal */
      const accessKey = info.req.headers['x-explore-chainlink-accesskey']
      const secret = info.req.headers['x-explore-chainlink-secret']

      if (typeof accessKey !== 'string' || typeof secret !== 'string') {
        return
      }

      authenticate(db, accessKey, secret).then((session: Session | null) => {
        if (session === null) {
          callback(false, 401)
          return
        }

        sessions.set(info.req, session)
        callback(true, 200)
      })
      /* eslint-enable standard/no-callback-literal */
    }
  })

  wss.on('connection', (ws: WebSocket, request: http.IncomingMessage) => {
    clnodeCount = clnodeCount + 1
    console.log(
      `websocket connected, total chainlink nodes connected: ${clnodeCount}`
    )

    ws.on('message', async (message: WebSocket.Data) => {
      const session = sessions.get(request)
      if (session == null) {
        ws.close()
        return
      }

      let result = await handleMessage(
        message as string,
        session.chainlinkNodeId,
        db
      )
      ws.send(JSON.stringify(result))
    })

    ws.on('close', () => {
      clnodeCount = clnodeCount - 1
      console.log(
        `websocket disconnected, total chainlink nodes connected: ${clnodeCount}`
      )
    })
  })
}

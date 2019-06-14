import { parse as parseCookie } from 'cookie'
import { set } from '../../../utils/storage'
import { BadRequestError } from '../../../api/errors'

export interface IState {
  errors: string[]
  successes: string[]
  currentUrl?: string
}

export type Action =
  | { type: 'MATCH_ROUTE'; cookie?: string; match: any }
  | { type: 'RECEIVE_SIGNIN_FAIL'; cookie?: string }
  | { type: 'NOTIFY_SUCCESS'; cookie?: string; component: any; props: any }
  | { type: 'NOTIFY_ERROR'; cookie?: string; component: any; error: any }
  | { type: string; cookie?: string }

const initialState = {
  errors: [],
  successes: [],
  currentUrl: null
}

const SIGN_IN_FAIL_MSG = 'Your email or password is incorrect. Please try again'

export default (state: IState = initialState, action: Action) => {
  const before = beforeCookieState(state, action)
  const after = afterCookieState(before, action)

  return after
}

const beforeCookieState = (state: IState, action) => {
  switch (action.type) {
    case 'MATCH_ROUTE': {
      if (action.match && state.currentUrl !== action.match.url) {
        return Object.assign({}, state, {
          errors: [],
          successes: [],
          currentUrl: action.match.url
        })
      }

      return state
    }
    case 'RECEIVE_SIGNIN_FAIL': {
      return Object.assign({}, state, {
        successes: [],
        errors: [{ props: { msg: SIGN_IN_FAIL_MSG } }]
      })
    }
    case 'NOTIFY_SUCCESS': {
      const success = {
        component: action.component,
        props: action.props
      }
      if (success.props.data && success.props.data.type === 'specs')
        set('persistSpec', {})
      else if (typeof success.props.url === 'string') set('persistBridge', {})
      return Object.assign({}, state, {
        successes: [success],
        errors: []
      })
    }
    case 'NOTIFY_ERROR': {
      const { component, error } = action
      let errorNotifications

      if (error.errors) {
        errorNotifications = error.errors.map(e => ({
          component: component,
          props: { msg: e.detail }
        }))
      } else if (error.message) {
        errorNotifications = [
          {
            component: component,
            props: { msg: error.message }
          }
        ]
      } else {
        errorNotifications = [error]
      }
      if (error instanceof BadRequestError) set('persistBridge', {})

      return Object.assign({}, state, {
        successes: [],
        errors: errorNotifications
      })
    }
    default:
      return state
  }
}

const EXPLORER_STATUS_ERROR = 'error'

const hasExplorerStatus = (errors, msg) => {
  return errors.find(({ props }) => props && props.msg === msg)
}

const afterCookieState = (state: IState, action: Action) => {
  const cookies = parseCookie(
    action.cookie || (global.document ? global.document.cookie : '')
  )
  let notification

  if (cookies.explorer) {
    try {
      const json = JSON.parse(cookies.explorer)

      if (json.status === EXPLORER_STATUS_ERROR) {
        let msg = `Can't connect to explorer: ${json.url}`
        if (!json.url.match(/^wss?:.+/)) {
          msg = `${msg}. You must use a websocket.`
        }
        if (!hasExplorerStatus(state.errors, msg)) {
          notification = { props: { msg } }
        }
      }
    } catch (e) {
      notification = { props: { msg: 'Invalid explorer status' } }
    }
  }

  return Object.assign({}, state, {
    errors: [...state.errors, notification].filter(n => !!n)
  })
}

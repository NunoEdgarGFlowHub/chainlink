import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { receiveSignoutSuccess } from '../actions'
import Flash from '../components/Flash'
import Unhandled from '../components/Notifications/UnhandledError'

const Error = ({ notifications }) => {
  return (
    <Flash error>
      {notifications.map(({ component, props }, i) => {
        if (component) {
          return <p key={i}>{component(props)}</p>
        } else if (props && props.msg) {
          return <p key={i}>{props.msg}</p>
        }

        return (
          <p key={i}>
            <Unhandled />
          </p>
        )
      })}
    </Flash>
  )
}

const Success = ({ notifications }) => {
  return (
    <Flash success>
      {notifications.map(({ component, props }, i) => (
        <p key={i}>{component(props)}</p>
      ))}
    </Flash>
  )
}

interface IProps {
  errors: any[]
  successes: any[]
}

export const Notifications = ({ errors, successes }: IProps) => {
  return (
    <div>
      {errors.length > 0 && <Error notifications={errors} />}
      {successes.length > 0 && <Success notifications={successes} />}
    </div>
  )
}

const mapStateToProps = state => ({
  errors: state.notifications.errors,
  successes: state.notifications.successes
})

const mapDispatchToProps = dispatch =>
  bindActionCreators({ receiveSignoutSuccess }, dispatch)

export const ConnectedNotifications = connect(
  mapStateToProps,
  mapDispatchToProps
)(Notifications)

export default ConnectedNotifications

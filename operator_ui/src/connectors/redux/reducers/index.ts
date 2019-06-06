import { combineReducers } from 'redux'
import accountBalances from './accountBalances'
import authentication from './authentication'
import bridges from './bridges'
import configuration from './configuration'
import create from './create'
import dashboardIndex from './dashboardIndex'
import fetching from './fetching'
import jobRuns from './jobRuns'
import jobs from './jobs'
import jobsShow from './jobsShow'
import notifications from './notifications'
import redirect from './redirect'
import transactions from './transactions'
import transactionsIndex from './transactionsIndex'

const reducer = combineReducers({
  accountBalances,
  authentication,
  bridges,
  configuration,
  create,
  dashboardIndex,
  fetching,
  jobRuns,
  jobs,
  jobsShow,
  notifications,
  redirect,
  transactions,
  transactionsIndex
})

export default reducer

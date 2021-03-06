export interface IState {
  items?: IJobRun[]
}

export interface IMeta {
  count: number
}

export interface INormalizedEndpoint {
  data: any[]
  meta: IMeta
}

export interface INormalizedMeta {
  jobRuns: INormalizedEndpoint
}

export interface INormalizedData {
  jobRuns: any
  meta: INormalizedMeta
}

export type JobRunsAction =
  | { type: 'UPSERT_JOB_RUNS'; data: INormalizedData }
  | { type: 'UPSERT_JOB_RUN'; data: INormalizedData }
  | { type: '@@redux/INIT' }
  | { type: '@@INIT' }

const INITIAL_STATE = { items: undefined }

export default (state: IState = INITIAL_STATE, action: JobRunsAction) => {
  switch (action.type) {
    case '@@redux/INIT':
    case '@@INIT':
      return INITIAL_STATE
    case 'UPSERT_JOB_RUNS':
      return { items: action.data.jobRuns }
    case 'UPSERT_JOB_RUN':
      return { items: action.data.jobRuns }
    default:
      return state
  }
}

import createReducerBuilder from './createReducerBuilder'
import { createAction } from 'typesafe-actions'

interface TestState {
  meta: {
    author: string
  }
  body: string
}

const initialState: TestState = {
  meta: { author: '' },
  body: '',
}

const authorAction = createAction('meta/AUTHOR_CHANGE')<string>()
const bodyAction = createAction('meta/BODY_CHANGE')<string>()

test('should create a reducer altering the author and the body', () => {
  const currentState: TestState = { ...initialState, meta: { ...initialState.meta }}
  const reducer = createReducerBuilder(currentState)
    .handle(authorAction).reducer((state = currentState, action) => { state.meta.author = action.payload; return state })
    .handle(bodyAction).reducer((state = currentState, action) => { state.body = action.payload; return state })
    .build()
  
  const newAuthor = 'Test author'
  const newBody = 'Test body'

  // edit the author
  let nextState = reducer(currentState, authorAction(newAuthor))
  expect(nextState.meta.author).toBe(newAuthor)

  // edit the body
  nextState = reducer(nextState, bodyAction(newBody))
  expect(nextState.meta.author).toBe(newAuthor) // author should be preserved
  expect(nextState.body).toBe(newBody)
})

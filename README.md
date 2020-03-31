# Typesafe actions reducer builder

This library provides the function `createReducerBuilder`: it's a 100% type-hinted builder which creates a redux reducer for a particular state
allowing the developer to define reducers per-action basis. It uses the `typesafe-actions` library to interact with the actions.

## Features

- Builder for redux reducers
- 100% type-hinted (no way to go "off the trails")
- returns an `Immutable<TState>` using `immer`, always providing immutable states to redux

## Usage

```typescript
// myReducer.ts

import createReducerBuilder from 'typesafe-actions-reducer-builder'

// Those are all typesafe-actions action builders
import {
  metaAuthorChangeAction,      // ActionCreatorBuilder<string, string, undefined>
  metaTitleChangeAction,       // ActionCreatorBuilder<string, string, undefined>
  metaDescriptionChangeAction, // ActionCreatorBuilder<string, string, undefined>
  metaTagsAddAction,           // ActionCreatorBuilder<string, string, undefined>
  metaTagsRemoveAction,        // ActionCreatorBuilder<string, string, undefined>
  bodyChangeAction,            // ActionCreatorBuilder<string, string, undefined>
} from './actions.ts'

interface DocumentState {
  meta: {
    author: string
    title: string
    description: string
    tags: string[]
  }
  body: string
}

const initialState: DocumentState {
  meta: {
    author: '',
    title: '',
    description: '',
    tags: [],
  },
  body: ''
}


const reducer = createReducerBuilder(initialState)
  // reducer's type: Reducer<DocumentState, PayloadAction<string, string>>
  .handle(metaAuthorChangeAction).reducer((state = initialState, action) => {
    state.meta.author = action.payload
    return state
  })
  .handle(metaTitleChangeAction).reducer((state = initialState, action) => {
    state.meta.title = action.payload
    return state
  })
  .handle(metaDescriptionChangeAction).reducer((state = initialState, action) => {
    state.meta.description = action.payload
    return state
  })
  .handle(metaTagsAddAction).reducer((state = initialState, action) => {
    if (!state.meta.tags.includes(action.payload)) {
      state.meta.tags.push(action.payload)
    }
    return state
  })
  .handle(metaTagsRemoveAction).reducer((state = initialState, action) => {
    if (!state.meta.tags.includes(action.payload)) {
      return
    }
    state.meta.tags.splice(state.meta.tags.indexOf(action.payload), 1)
    return state
  })
  .handle(bodyChangeAction).reducer((state = initialState, action) => {
    state.body = action.payload
    return state
  })
  .build()

export default reducer

```

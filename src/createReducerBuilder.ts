import produce from 'immer'
import {
  ActionCreatorBuilder,
  EmptyAction,
  PayloadAction,
  PayloadMetaAction,
  TypeConstant,
} from 'typesafe-actions'
import { Reducer, AnyAction } from 'redux'

// //////////////////////////////////////////////////////////////////////
// Example usage:
//
// const rootReducer = createReducerBuilder<State>()
//  .handle(actionCreator1).reducer((state, action) => state)
//  .handle(actionCreator2).reducer((state, action) => state)
//  .build()
// //////////////////////////////////////////////////////////////////////

// Various typesafe-actions action types
// This complex type returns the following:
// TPayload == undefined, TMeta == undefined => EmptyAction<TypeConstant>
// TPayload == undefined, TMeta != undefined => PayloadMetaAction<TypeConstant, undefined, TMeta>
// TPayload != undefined, TMeta == undefined => PayloadAction<TypeConstant, TPayload>
// TPayload != undefined, TMeta != undefined => PayloadMetaAction<TypeConstant, TPayload, TMeta>
type ActionT<TPayload extends any = undefined, TMeta extends any = undefined> =
  [TMeta] extends [undefined]
    ? [TPayload] extends [undefined]
      ? EmptyAction<TypeConstant>
      : PayloadAction<TypeConstant, TPayload>
    : [TPayload] extends [undefined]
      ? PayloadMetaAction<TypeConstant, undefined, TMeta>
      : PayloadMetaAction<TypeConstant, TPayload, TMeta>

// This complex type returns the following:
// TPayload == undefined, TMeta == undefined => ActionCreatorBuilder<TypeConstant>
// TPayload == undefined, TMeta != undefined => ActionCreatorBuilder<TypeConstant, undefined, TMeta>
// TPayload != undefined, TMeta == undefined => ActionCreatorBuilder<TypeConstant, TPayload>
// TPayload != undefined, TMeta != undefined => ActionCreatorBuilder<TypeConstant, TPayload, TMeta>
type ActionCreatorBuilderT<TPayload extends any = undefined, TMeta extends any = undefined> =
  [TMeta] extends [undefined]
    ? [TPayload] extends [undefined]
      ? ActionCreatorBuilder<TypeConstant>
      : ActionCreatorBuilder<TypeConstant, TPayload>
    : [TPayload] extends [undefined]
      ? ActionCreatorBuilder<TypeConstant, undefined, TMeta>
      : ActionCreatorBuilder<TypeConstant, TPayload, TMeta>


interface ReducerBuilderHandler<TState, TPayload, TMeta> {
  reducer(
    reducer: Reducer<TState, ActionT<TPayload, TMeta>>
  ): ReducerBuilderHandler<TState, TPayload, TMeta>
  handle: ReducerBuilderHandlerBuilder<TState>
  build(): Reducer<TState, AnyAction>
}

type ReducerBuilderHandlerBuilder<TState> = <TPayload = undefined, TMeta = undefined>(
  actionCreatorBuilder: ActionCreatorBuilderT<TPayload, TMeta>
) => ReducerBuilderHandler<TState, TPayload, TMeta>

interface ReducerBuilder<TState> {
  build(): Reducer<TState, AnyAction>
  handle: ReducerBuilderHandlerBuilder<TState>
}

// Implementation

/**
 * Create a reducer builder, starting from its state.
 * It supports multiple actions (from typesafe-actions) with multiple reducers.
 * When the reducers are all set, just call build() to create the root reducer.
 * 
 * It uses immer, which will produce an Immutable<TState> object as the result
 * of the reducer. The developer should edit the state in the reducer, instead
 * of creating a new one: immer will take care of creating a new object.
 * 
 * The builder will provide type hints along all the build structure, lowering
 * the possibility of creating bugs.
 * 
 * @param initialState the reducer's initial state
 */
function createReducerBuilder<TState>(initialState: TState): ReducerBuilder<TState> {
  const reducersMap: { [key: string]: Reducer<TState, AnyAction>[] } = {}

  const rootReducer = (state: TState = initialState, action: AnyAction): TState => {
    const reducers = reducersMap[action.type] || []
    reducers.forEach((reducer) => {
      state = reducer(state, action)
    })

    return state
  }
  const build = () => produce(rootReducer) as Reducer<TState, AnyAction>

  const reducerBuilder: ReducerBuilder<TState> = {} as ReducerBuilder<TState>

  const handlerBuilder: ReducerBuilderHandlerBuilder<TState> = <TPayload, TMeta>(
    actionCreatorBuilder: ActionCreatorBuilderT<TPayload, TMeta>,
  ) => {
    const handler: ReducerBuilderHandler<TState, TPayload, TMeta> = {
    } as ReducerBuilderHandler<TState, TPayload, TMeta>
    // Get the action's type
    const { type } = actionCreatorBuilder(null as any, null as any)

    const addReducer = (
      reducer: Reducer<TState, ActionT<TPayload, TMeta>>,
    ): ReducerBuilderHandler<TState, TPayload, TMeta> => {
      if (!(type in reducersMap)) {
        reducersMap[type] = []
      }
      reducersMap[type].push(reducer as Reducer<TState, AnyAction>)

      return handler
    }

    handler.reducer = addReducer
    handler.handle = handlerBuilder
    handler.build = build

    return handler
  }

  reducerBuilder.build = build
  reducerBuilder.handle = handlerBuilder

  return reducerBuilder
}

export default createReducerBuilder

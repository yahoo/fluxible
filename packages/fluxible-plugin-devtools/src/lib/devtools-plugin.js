/**
 * Copyright 2016, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
import { ACTION, DISPATCH } from './CONSTANTS';

/**
 * Creates a new devtools plugin instance
 * @returns {DevToolsPlugin}
 */
export default function devToolsPlugin() {
    /**
     * @class DevToolsPlugin
     */
    return {
        /**
         * @property {String} name Name of the plugin
         */
        name: 'DevToolsPlugin',
        /**
         * Called to plug the FluxContext
         * @method plugContext
         * @param {Object} contextOptions options passed to the createContext method
         * @param {Object} contextOptions.debug if true, will enable debug mode and allow fluxible to collect metadata for debugging
         * @returns {Object}
         */
        plugContext: function plugContext(contextOptions, context) {
            let enableDebug =
                typeof contextOptions.debug !== 'undefined'
                    ? contextOptions.debug
                    : false;
            let actionHistory = [];
            /**
             * extends the input object with a `devtools` namespace which has
             * debugging methods available to it.
             * @method provideDevTools
             * @param {Object} obj arbitrary input object
             * @return {void}
             */
            function provideDevTools(obj) {
                obj.devtools = {
                    /**
                     * Action history is preserved in a tree structure which maintains parent->child relationships.
                     * Top level actions are actions that kick off the app (i.e. navigateAction) or actions executed by components.
                     * All other actions will be under the `actionCalls` property of other actions.
                     * This action history tree allows us to trace and even visualize actions for debugging.
                     * @method getActionHistory
                     * @return {Object} Array of top level actions.
                     */
                    getActionHistory: function getActionHistory() {
                        return actionHistory;
                    },
                };
            }
            provideDevTools(context);
            /**
             * If the debug flag was set to true, this funcion will override some functions
             * within fluxible and collect metadata that is useful for debugging.
             * @method overridectx
             * @return {void}
             */
            function overrideCtx() {
                if (!enableDebug) {
                    return;
                }
                /**
                 * Override the _createSubActionContext method so we can track "parent" actions
                 * for each executed action. We can later use this to graph our the dependencies.
                 */
                const createSubActionContext =
                    context._createSubActionContext.bind(context);
                context._createSubActionContext =
                    function createDevSubActionContext(
                        parentActionContext,
                        action,
                    ) {
                        let subActionContext = createSubActionContext(
                            parentActionContext,
                            action,
                        );
                        let actionReference = {
                            rootId: subActionContext.rootId,
                            name: subActionContext.displayName,
                            type: ACTION,
                        };
                        if (!parentActionContext.__actionReference) {
                            // new top level action
                            actionReference.context =
                                typeof window === 'undefined'
                                    ? 'server'
                                    : 'client';
                            actionHistory.push(actionReference);
                        } else {
                            // append child action
                            const parentActionReference =
                                parentActionContext.__actionReference;
                            parentActionReference.actionCalls =
                                parentActionReference.actionCalls || [];
                            parentActionReference.actionCalls.push(
                                actionReference,
                            );
                            // TODO: perhaps also push to an parentActionReference.actions reference array.
                            // This way we can still correctly detect leaf nodes. Actually are leaf nodes even useful?
                            // If not, just color code the bars based on action vs dispatch calls.
                            // Later, service calls.
                            // Even later, arbitrary custom children.
                            // No paths for dispatches? Or just show/hide dispatches
                        }
                        // for extablishing parent->child relationships
                        // and updating start/end times of the actionReference
                        subActionContext.__actionReference = actionReference;
                        return subActionContext;
                    };
            }
            overrideCtx();

            return {
                /**
                 * Modyfy and return new arguments to `callAction` in FluxibleContext
                 * @method plugExecuteAction
                 * @param {Object} actionContext the current action context
                 * @param {Function} action action An action creator function that receives actionContext, payload,
                 *  and done as parameters
                 * @param {Object} payload The action payload
                 * @param {Function} done Method to be called once action execution has completed
                 */
                plugExecuteAction: function plugExecuteAction(options) {
                    if (!enableDebug) {
                        // unchanged
                        return options;
                    }

                    const action = options.action;
                    const actionContext = options.actionContext;
                    const actionReference = actionContext.__actionReference;
                    const done = options.done;

                    function timedAction(ctx, payload, cb) {
                        actionReference.startTime = Date.now();
                        actionReference.payload = JSON.stringify(payload);
                        const dispatch = ctx.dispatch;
                        ctx.dispatch = (actionName, payload) => {
                            const dispatchRef = {
                                name: actionName,
                                payload: JSON.stringify(payload),
                                type: DISPATCH,
                            };
                            actionReference.dispatchCalls =
                                actionReference.dispatchCalls || [];
                            actionReference.dispatchCalls.push(dispatchRef);
                            const startTime = Date.now();
                            dispatchRef.startTime = startTime;
                            dispatch(actionName, payload);
                            const endTime = Date.now();
                            const dur = endTime - startTime;
                            dispatchRef.endTime = endTime;
                            dispatchRef.duration = dur;
                        };
                        return action(ctx, payload, cb);
                    }

                    function timedActionNoCallback(ctx, payload) {
                        return timedAction(ctx, payload);
                    }

                    function timedCallback(err, data) {
                        const endTime = Date.now();
                        const dur = endTime - actionReference.startTime;
                        actionReference.endTime = endTime;
                        actionReference.duration = dur;
                        actionReference.failed = !!err;
                        done && done(err, data);
                    }

                    return {
                        actionContext: actionContext,
                        action:
                            action.length < 3
                                ? timedActionNoCallback
                                : timedAction,
                        payload: options.payload,
                        done: timedCallback,
                    };
                },
                /**
                 * Adds devtools methods to the component context
                 * @method @plugComponentContext
                 * @param componentContext
                 */
                plugComponentContext: function plugComponentContext(
                    componentContext,
                ) {
                    provideDevTools(componentContext);
                },
                /**
                 * Called to dehydrate plugin options
                 * @method dehydrate
                 * @returns {Object}
                 */
                dehydrate: function dehydrate() {
                    return {
                        actionHistory: actionHistory,
                        enableDebug: enableDebug,
                    };
                },
                /**
                 * Called to rehydrate plugin options
                 * @method rehydrate
                 * @returns {Object}
                 */
                rehydrate: function rehydrate(state) {
                    actionHistory = state.actionHistory;
                    enableDebug = state.enableDebug;
                    overrideCtx();
                },
            };
        },
    };
}

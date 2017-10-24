/*
 * Copyright 2017 Uncharted Software Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const _sourceFunctionKey = Symbol('SourceFunctionKey');
const _sourceOwnerKey = Symbol('SourceOwnerKey');

/**
 * Base interface class for objects that wish to emit events.
 *
 * @class IBindable
 */
export class IBindable {
    /**
     * @constructor IBindable
     */
    constructor() {
        this.mHandlers = {};
        this.mOmniHandlers = [];
        this.mBoundForwardEvent = this._forwardEvent.bind(this);
    }

    /**
     * Unbinds all events bound to this IBindable instance.
     *
     * @method destroy
     */
    destroy() {
        Object.keys(this.mHandlers).forEach(key => {
            delete this.mHandlers[key];
        });
        this.mOmniHandlers.length = 0;

        delete this.mHandlers;
        delete this.mOmniHandlers;
        delete this.mBoundForwardEvent;
    }

    /**
     * Binds a list of events to the specified callback.
     *
     * @method on
     * @param {String|Array|null} events - A space-separated list or an Array of events to listen for. If null is passed, the callback will be invoked for all events.
     * @param {Function} callback - The callback to invoke when the event is triggered. If this callback returns true, event bubbling stops.
     */
    on(events, callback) {
        if (events === null) {
            if (this.mOmniHandlers.indexOf(callback) < 0) {
                this.mOmniHandlers.push(callback);
            }
        } else {
            const eventArray = events instanceof Array ? events : events.split(' ');
            eventArray.forEach(event => {
                let handlers = this.mHandlers[event];
                if (!handlers) {
                    handlers = [];
                    this.mHandlers[event] = handlers;
                }
                if (handlers.indexOf(callback) < 0) {
                    handlers.push(callback);
                }
            });
        }
    }

    /**
     * Unbinds the specified callback from the specified event. If no callback is specified, all callbacks for the specified event are removed.
     *
     * @method off
     * @param {String|Array|null=} events - A space-separated list or an Array of events to listen for. If null is passed the callback will be removed from the all-event handler list.
     * @param {Function=} callback - The callback to remove from the event or nothing to completely clear the event callbacks.
     * @param {*} owner - The owner of the callback, needed when unregistering callbacks created with `safeBind`.
     */
    off(events = null, callback = null, owner = null) {
        if (events === null) {
            if (!callback) {
                this.mOmniHandlers.length = 0;
            } else {
                const index = this.mOmniHandlers.indexOf(callback);
                if (index >= 0) {
                    this.mOmniHandlers.splice(index, 1);
                }
            }
        } else {
            const eventArray = events instanceof Array ? events : events.split(' ');
            eventArray.forEach(event => {
                const handlers = this.mHandlers[event];
                if (handlers) {
                    if (!callback) {
                        delete this.mHandlers[event];
                    } else {
                        for (let i = 0, n = handlers.length; i < n; ++i) {
                            if (callback === handlers[i] || (callback === handlers[i][_sourceFunctionKey] && owner === handlers[i][_sourceOwnerKey])) {
                                handlers.splice(i, 1);
                                break;
                            }
                        }
                    }
                }
            });
        }
    }

    /**
     * Emits the specified event and forwards all passed parameters.
     *
     * @method emit
     * @param {String} event - The name of the event to emit.
     * @param {...*} varArgs - Arguments to forward to the event listener callbacks.
     */
    emit(event, ...varArgs) {
        let i;
        let n;

        if (this.mHandlers[event]) {
            for (i = 0, n = this.mHandlers[event].length; i < n; ++i) {
                if (this.mHandlers[event][i](...varArgs) === true) {
                    break;
                }
            }
        }

        if (this.mOmniHandlers.length > 0) {
            for (i = 0, n = this.mOmniHandlers.length; i < n; ++i) {
                if (this.mOmniHandlers[i](...arguments) === true) {
                    break;
                }
            }
        }
    }

    /**
     * Forwards the specified events triggered by the given `bindable` as if this object was emitting them. If no events
     * are passed, all events are forwarded.
     *
     * @method forward
     * @param {IBindable} bindable - The `IBindable` instance for which all events will be forwarded through this instance.
     * @param {String|Array|null=} events - A space-separated list of events to forward or null to forward all the events.
     */
    forward(bindable, events = null) {
        if (events === null) {
            bindable.on(null, this.mBoundForwardEvent);
        } else {
            const eventArray = events instanceof Array ? events : events.split(' ');
            eventArray.forEach(event => {
                bindable.on(event, this.safeBind(this._forwardEvent, this, event));
            });
        }
    }

    /**
     * Stops forwarding the events of the specified `bindable`
     *
     * @method unforward
     * @param {IBindable} bindable - The `IBindable` instance to stop forwarding.
     * @param {String|Array|null=} events - A space-separated list of events to stop forwarding or null to stop forwarding all the events.
     */
    unforward(bindable, events = null) {
        if (events === null) {
            bindable.off(null, this.mBoundForwardEvent);
        } else {
            const eventArray = events instanceof Array ? events : events.split(' ');
            eventArray.forEach(event => {
                bindable.off(event, this._forwardEvent, this);
            });
        }
    }

    /**
     * Binds a function so it is safe to unregister it using the `off` method with only the original function as the second argument.
     *
     * @method safeBind
     * @param {Function} func - The function to bind.
     * @param {*} owner - The owner of this function.
     * @param {...*} varArgs - The arguments used to bind this function.
     * @returns {Function}
     */
    safeBind(func, owner, ...varArgs) {
        const boundFunction = func.bind(owner, ...varArgs);
        boundFunction[_sourceFunctionKey] = func;
        boundFunction[_sourceOwnerKey] = owner;
        return boundFunction;
    }

    /**
     * Internal method used to forward the events from other `IBindable` instances.
     *
     * @method _forwardEvent
     * @param {String} event - The name of the event to emit.
     * @param {...*} varArgs - Arguments to forward to the event listener callbacks.
     * @private
     */
    _forwardEvent(/* event */ /* varArgs */) {
        this.emit.apply(this, arguments);
    }
}

export default IBindable;

/**
 * @author Rostyslav Bohomaz
 * @copyright 2022 Rostyslav Bohomaz. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

interface EventListener {
  handleEvent(event: Event): any;
}

type Listener = ((ev: Event) => any) | EventListener;
type Listeners = Map<Listener, boolean | AddEventListenerOptions | undefined>;
type TypeListeners = Map<string, Listeners>;

/**
 * Extend existing object with `EventTarget` interface.
 * 
 * @param obj 
 * @returns obj
 */
export default function(obj: object): object {
  if (!Object.isExtensible(obj))
    throw new TypeError(`Object '${obj.toString()}' is not extensible.`);
  
  const types: TypeListeners = new Map();
  const prototype = Object.getPrototypeOf(obj);

  prototype.addEventListener = function(
    type: string,
    listener: Listener,
    options?: boolean | AddEventListenerOptions,
  ): void {
    if (arguments.length < 2) {
      throw new TypeError(
        "Failed to execute 'addEventListener' on 'EventTarget': 2 arguments required, but only ${arguments.length} present."
      );
    }

    if (typeof listener !== "object") {
      throw new TypeError(
        "TypeError: Failed to execute 'addEventListener' on 'EventTarget': parameter 2 is not of type 'Object'."
      );
    }

    const _type = type.toString();
    
    const listeners = types.get(_type);

    if (listeners) listeners.set(listener, options);
    else types.set(_type, new Map([[listener, options]]));
  }

  prototype.removeEventListener = function(
    type: string,
    listener: Listener,
    _options?: boolean | EventListenerOptions,
  ): void {
    if (arguments.length < 2) {
      throw new TypeError(
        `Failed to execute 'addEventListener' on 'EventTarget': 2 arguments required, but only ${arguments.length} present.`
      );
    }

    if (typeof listener !== "object") {
      throw new TypeError(
        "Failed to execute 'removeEventListener' on 'EventTarget': parameter 2 is not of type 'Object'."
      )
    }

    const _type = type.toString();

    const listeners = types.get(_type);
    if (listeners) listeners.delete(listener);
  }

  prototype.dispatchEvent = function(event: Event): boolean {
    if (!(event instanceof Event)) {
      throw new TypeError(
        "Failed to execute 'dispatchEvent' on 'EventTarget': parameter 1 is not of type 'Event'."
      );
    }

    const type = event.type;

    const listeners = types.get(type);

    if (listeners) {
      let stopped: boolean = false;

      // @ts-ignore
      const _event = Object.freeze({
        bubbles: false,
        cancelable: false,
        composed: false,
        currentTarget: obj as EventTarget,
        defaultPrevented: false,
        eventPhase: Event.AT_TARGET,
        isTrusted: event.isTrusted,
        target: obj as EventTarget,
        timeStamp: event.timeStamp,
        type,

        composedPath() { return [] },
        preventDefault() {},
        stopImmediatePropagation() { stopped = true },
        stopPropagation() {},

        // @ts-ignore
        [Symbol.toStringTag]: event[Symbol.toStringTag],
      } as Event) as Event;

      const onetimeListeners: Array<Listener> = [];

      for (const [ listener, options ] of listeners.entries()) {
        if (stopped) break;

        try {
          if (typeof listener === "function") {
            listener.call(obj, _event);
          } else if (listener && typeof listener.handleEvent === "function") {
            listener.handleEvent(_event);
          }
        } catch (error) {
          setTimeout(() => { throw error });
        }

        if (options && (options as AddEventListenerOptions).once) {
          onetimeListeners.push(listener);
        }
      }

      for (const onetimeListener of onetimeListeners) {
        listeners.delete(onetimeListener);
      }
    }

    return true;
  }

  return obj;
}

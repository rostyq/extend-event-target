import { formatDiagnosticsWithColorAndContext } from "typescript";
import extendEventTarget from "../src/extend-event-target";

let obj: EventTarget;

beforeEach(() => {
  obj = extendEventTarget({} as EventTarget);
})

describe("extendEventTarget", () => {
  test("dispatch event returns true", () => {
    expect(obj.dispatchEvent(new Event("test"))).toBe(true);
  })

  test("dispatch nothing fails", () => {
    // @ts-ignore
    expect(() => obj.dispatchEvent()).toThrow(TypeError);
  })

  test("dispatch some object fails", () => {
    // @ts-ignore
    expect(() => obj.dispatchEvent({})).toThrow(TypeError);
  })

  test("dispatch primitives fails", () => {
    // @ts-ignore
    expect(() => obj.dispatchEvent(1)).toThrow(TypeError);
    // @ts-ignore
    expect(() => obj.dispatchEvent("test")).toThrow(TypeError);
    // @ts-ignore
    expect(() => obj.dispatchEvent(true)).toThrow(TypeError);
    // @ts-ignore
    expect(() => obj.dispatchEvent(null)).toThrow(TypeError);
  })

  test("dispatch Event", done => {
    const _e = new Event("test");

    obj.addEventListener("test", (e: Event) => {
      expect(e.bubbles).toBe(false);
      expect(e.cancelable).toBe(false);
      expect(e.composed).toBe(false);
      expect(e.currentTarget).toBe(obj);
      expect(e.defaultPrevented).toBe(false);
      expect(e.eventPhase).toBe(Event.AT_TARGET);
      expect(e.isTrusted).toBe(_e.isTrusted);
      expect(e.target).toBe(obj);
      expect(e.timeStamp).toBe(_e.timeStamp);
      expect(e.type).toBe(_e.type);
      expect(e.composedPath).toBeInstanceOf(Function);
      expect(e.composedPath()).toBeInstanceOf(Array);
      expect(e.composedPath().length).toBe(0);
      expect(e.preventDefault).toBeInstanceOf(Function);
      expect(e.stopImmediatePropagation).toBeInstanceOf(Function);
      expect(e.stopPropagation).toBeInstanceOf(Function);
      expect((e as any)[Symbol.toStringTag]).toBe((e as any)[Symbol.toStringTag]);
      done();
    });

    obj.dispatchEvent(_e);
  }, 100)

  test("dispatch CustomEvent", done => {
    const detail = { data: "foo" };
    const _e = new CustomEvent("test", { detail });

    // @ts-ignore
    obj.addEventListener("test", (e: CustomEvent) => {
      expect(e.detail).toBe(detail);
      done();
    });

    obj.dispatchEvent(_e);
  }, 100)

  test("listen with anonymous function once", done => {
    let counter = 0;

    obj.addEventListener("test", e => {
      ++counter;
    }, { once: true });

    obj.dispatchEvent(new Event("test"));
    obj.dispatchEvent(new Event("test"));

    setTimeout(() => {
      if (counter == 1) done();
    }, 200)
  }, 250)

  test("add listener as object", done => {
    const listener = {
      handleEvent(_event: Event) {
        done();
      }
    }

    obj.addEventListener("test", listener);

    obj.dispatchEvent(new Event("test"));

  }, 300)

  test("add listener and remove it after one event", done => {
    const type = "test";
    let counter = 0;
    let count = 3;

    const listener = {
      handleEvent(event: Event) {
        expect(event.type).toBe(type);
        ++counter;
      }
    }

    obj.addEventListener(type, listener);

    for (let i = 0; i < count; i++) {
      obj.dispatchEvent(new Event(type));
    }

    obj.removeEventListener(type, listener);

    obj.dispatchEvent(new Event(type));

    setTimeout(() => {
      if (count == counter) done();
    }, 200)
  }, 300)
})
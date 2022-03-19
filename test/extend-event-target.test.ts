import extendEventTarget from "../src/extend-event-target";

let obj: EventTarget;
let mock: jest.Mock;

describe("extendEventTarget", () => {
  describe("dispatchEvent", () => {
    beforeAll(() => {
      obj = extendEventTarget({} as EventTarget);
    })

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
  })

  describe("[add|remove]EventListener", () => {
    beforeEach(() => {
      obj = extendEventTarget({} as EventTarget);
      mock = jest.fn();
    })

    test("dispatch Event", () => {
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
        mock();
      });

      obj.dispatchEvent(_e);
      expect(mock).toBeCalled();
    })

    test("dispatch CustomEvent", () => {
      const detail = { data: "foo" };
      const _e = new CustomEvent("test", { detail });

      // @ts-ignore
      obj.addEventListener("test", (e: CustomEvent) => {
        expect(e.detail).toBe(detail);
        mock();
      });

      obj.dispatchEvent(_e);
      expect(mock).toBeCalled();
    }, 50)

    test("listen with anonymous function once", () => {
      const mock = jest.fn();

      obj.addEventListener("test", () => mock(), { once: true });

      obj.dispatchEvent(new Event("test"));
      obj.dispatchEvent(new Event("test"));

      expect(mock).toBeCalledTimes(1);
    })

    test("add and remove listener as object", () => {
      const listener = { handleEvent(_event: Event) { mock(); } }

      obj.addEventListener("test", listener);

      obj.dispatchEvent(new Event("test"));

      obj.removeEventListener("test", listener);

      obj.dispatchEvent(new Event("test"));

      expect(mock).toBeCalledTimes(1);
    }, 300)

    test("add and remove listener as arrow function", () => {
      const listener = () => mock();

      obj.addEventListener("test", listener);

      obj.dispatchEvent(new Event("test"));

      obj.removeEventListener("test", listener);

      obj.dispatchEvent(new Event("test"));

      expect(mock).toBeCalledTimes(1);
    })

    test("add and remove listener as function", () => {
      function listener() { mock() };

      obj.addEventListener("test", listener);

      obj.dispatchEvent(new Event("test"));

      obj.removeEventListener("test", listener);

      obj.dispatchEvent(new Event("test"));

      expect(mock).toBeCalledTimes(1);
    })
  })
})
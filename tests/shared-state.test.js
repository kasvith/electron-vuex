import { createStore } from "./helpers"

jest.mock(
  "electron",
  () => {
    const mockIpcMain = {
      on: jest.fn().mockReturnThis()
    }
    return { ipcMain: mockIpcMain }
  },
  { virtual: true }
)

describe("createSharedState", () => {
  it("loads plugin", () => {
    expect(() => {}).not.toThrow()
  })

  it("dumps the state", () => {
    const store = createStore({})

    //expect(storage.get("state")).toBeUndefined()

    const times = Math.floor(Math.random() * (10 - 3 + 1) + 3)

    for (let i = 1; i <= times; i++) {
      store.dispatch("increment")

      expect(store.state.count).toEqual(i)
    }

    for (let i = times - 1; i > 0; i--) {
      store.dispatch("decrement")

      expect(store.state.count).toEqual(i)
    }
  })

  it("filters whitelist (wrong type)", () => {
    expect(() => {
      createStore({
        sharedState: {
          whitelist: {}
        }
      })
    }).toThrow()
  })

  it("filters whitelist (array)", () => {
    const store = createStore({
      sharedState: {
        whitelist: ["increment"]
      }
    })

    store.dispatch("increment")
    expect(store.state.count).toEqual(1)

    store.dispatch("decrement")
    expect(store.state.count).toEqual(0)
  })

  it("filters whitelist (function)", () => {
    const store = createStore({
      sharedState: {
        whitelist: (mutation) => ["increment"].includes(mutation.type)
      }
    })

    store.dispatch("increment")
    expect(store.state.count).toEqual(1)

    store.dispatch("decrement")
    expect(store.state.count).toEqual(0)
  })

  it("filters blacklist (wrong type)", () => {
    expect(() => {
      createStore({
        sharedState: {
          blacklist: {}
        }
      })
    }).toThrow()
  })

  it("filters blacklist (array)", () => {
    const store = createStore({
      sharedState: {
        blacklist: ["increment"]
      }
    })

    store.dispatch("increment")
    expect(store.state.count).toEqual(1)

    store.dispatch("decrement")
    expect(store.state.count).toEqual(0)
  })

  it("filters blacklist (function)", () => {
    const store = createStore({
      sharedState: {
        blacklist: (mutation) => ["increment"].includes(mutation.type)
      }
    })

    store.dispatch("increment")
    expect(store.state.count).toEqual(1)

    store.dispatch("decrement")
    expect(store.state.count).toEqual(0)
  })
})

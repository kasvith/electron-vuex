jest.mock(
  "electron",
  () => {
    const mockIpc = {
      on: jest.fn().mockReturnThis()
    }
    return { ipcMain: mockIpc, ipcRenderer: mockIpc }
  },
  { virtual: true }
)

import { createSharedState, createSharedMutations } from "../src"

describe("createSharedState", () => {
  it("function", () => {
    expect(createSharedState).toBeInstanceOf(Function)
  })

  it("returns function", () => {
    expect(createSharedState()).toBeInstanceOf(Function)
  })
})

describe("createSharedMutations", () => {
  it("function", () => {
    expect(createSharedMutations).toBeInstanceOf(Function)
  })

  it("returns function", () => {
    expect(createSharedMutations()).toBeInstanceOf(Function)
  })
})

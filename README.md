# Electron Vuex

A fork of [vuex-electron](https://github.com/vue-electron/vuex-electron).
We replaced the JSON store with a memory store which allows high rate of mutations without creating temp files

The easiest way to share your Vuex Store between all processes (including main).

### Features

:star: Persisted state  
:star: Shared mutations

### Requirements

- [Vue](https://github.com/vuejs/vue) v2.0+
- [Vuex](https://github.com/vuejs/vuex) v2.0+
- [Electron](https://github.com/electron/electron) v2.0+

### Installation

Installation of the Vuex Electron easy as 1-2-3.

1. Install package with using of [yarn](https://github.com/yarnpkg/yarn) or [npm](https://github.com/npm/cli):

    ```
    yarn install electron-vuex
    ```

    or

    ```
    npm install electron-vuex
    ```

2. Include plugins in your Vuex store::

    ```javascript
    import Vue from "vue"
    import Vuex from "vuex"

    import { createPersistedState, createSharedMutations } from "electron-vuex"

    Vue.use(Vuex)

    export default new Vuex.Store({
      // ...
      plugins: [
        createPersistedState(),
        createSharedMutations()
      ],
      // ...
    })
    ```

3. In case if you enabled `createSharedMutations()` plugin you need to create an instance of store in the main process. To do it just add this line into your main process (for example `src/main.js`):

    ```javascript
    import './path/to/your/store'
    ```

4. Well done you did it! The last step is to add the star to this repo :smile:

**Usage example: [Vuex Electron Example](https://github.com/vue-electron/vuex-electron-example)**

## IMPORTANT

In renderer process to call actions you need to use `dispatch` or `mapActions`. Don't use `commit` because actions fired via `commit` will not be shared between processes.

### Options

Available options for `createPersistedState()`

```javascript
createPersistedState({
  whitelist: ["whitelistedMutation", "anotherWhitelistedMutation"],

  // or

  whitelist: (mutation) => {
    return true
  },

  // or

  blacklist: ["ignoredMutation", "anotherIgnoredMutation"],

  // or

  blacklist: (mutation) => {
    return true
  }
})
```
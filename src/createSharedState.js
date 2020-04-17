import { ipcMain, ipcRenderer, remote } from "electron"
import merge from "deepmerge"

const PROCESS_RENDERER = "renderer"
const PROCESS_MAIN = "main"

class SharedState {
    constructor (options, store) {
        this.options = options
        this.store = store
    }

    loadOptions() {
        this.whitelist = this.loadFilter(this.options.whitelist, "whitelist")
        this.blacklist = this.loadFilter(this.options.blacklist, "blacklist")
        this.processType = process.type === PROCESS_RENDERER ? PROCESS_RENDERER : PROCESS_MAIN
    }

    getState() {
        switch (this.processType) {
            case PROCESS_RENDERER:
                return remote.getGlobal('vuexState')
            case PROCESS_MAIN:
                return global.vuexState
            default:
                throw new Error('Invalid process type')
        }
    }

    setState(state) {
        switch (this.processType) {
            case PROCESS_MAIN:
                global.vuexState = state
                break;

            case PROCESS_RENDERER:
                // JSON.stringify and JSON.parse are faster than you think
                ipcRenderer.send("vuex-state", JSON.stringify(state))
                break;

            default:
                throw new Error('Invalid process type')
        }
    }

    loadFilter(filter, name) {
        if (!filter) {
            return null
        } else if (filter instanceof Array) {
            return this.filterInArray(filter)
        } else if (typeof filter === "function") {
            return filter
        } else {
            throw new Error(`[Vuex Electron] Filter "${name}" should be Array or Function. Please, read the docs.`)
        }
    }

    filterInArray(list) {
        return (mutation) => {
            return list.includes(mutation.type)
        }
    }

    combineMerge(target, source, options) {
        const emptyTarget = (value) => (Array.isArray(value) ? [] : {})
        const clone = (value, options) => merge(emptyTarget(value), value, options)
        const destination = target.slice()

        source.forEach(function (e, i) {
            if (typeof destination[i] === "undefined") {
                const cloneRequested = options.clone !== false
                const shouldClone = cloneRequested && options.isMergeableObject(e)
                destination[i] = shouldClone ? clone(e, options) : e
            } else if (options.isMergeableObject(e)) {
                destination[i] = merge(target[i], e, options)
            } else if (target.indexOf(e) === -1) {
                destination.push(e)
            }
        })

        return destination
    }

    initializeStorage() {
        switch (this.processType) {
            case PROCESS_MAIN:
                if (global.vuexState === undefined) {
                    global.vuexState = merge(this.store.state, {}, { arrayMerge: this.combineMerge })
                }

                const self = this
                ipcMain.on("vuex-state", (event, payload) => {
                    self.setState(JSON.parse(payload))
                })
                break
        }
    }


    loadInitialState() {
        const state = this.getState()

        if (state) {
            const mergedState = merge(this.store.state, state, { arrayMerge: this.combineMerge })
            this.store.replaceState(mergedState)
        }
    }

    subscribeOnChanges() {
        this.store.subscribe((mutation, state) => {
            if (this.blacklist && this.blacklist(mutation)) return
            if (this.whitelist && !this.whitelist(mutation)) return

            this.setState(state)
        })
    }
}

export default (options = {}) => (store) => {
    const sharedState = new SharedState(options, store)

    sharedState.loadOptions()
    sharedState.initializeStorage()
    sharedState.loadInitialState()
    sharedState.subscribeOnChanges()
}
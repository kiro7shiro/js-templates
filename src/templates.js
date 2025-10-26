/**
 * @module templates
 * @description Utilities for working with EJS templates.
 */

const templates = {}
export const compileOptions = { client: true, async: true }
const isSelector = /^[#.]/

/**
 * Build a HTML element from an EJS template.
 * @param {string} path - path to the EJS template
 * @param {Object} [locals] - locals to pass to the template
 * @param {String|HTMLElement} [container] - container for the control
 * @returns {Promise<HTMLElement>}
 */
export async function build(path, locals = {}, container = 'div') {
    if (typeof path !== 'string' || !path) throw new Error('Invalid template path.')
    if (typeof container !== 'string' && !(container instanceof HTMLElement)) throw new Error('Container must be a string or an HTMLElement.')
    try {
        if (isSelector.test(container)) {
            container = document.querySelector(container)
        } else if (typeof container === 'string') {
            container = document.createElement(container)
        }
        const html = await render(path, locals)
        container.insertAdjacentHTML('afterbegin', html)
        return container
    } catch (error) {
        throw new Error(`Failed to build ${path}: ${error.message}.`)
    }
}

/**
 * Sync build version. Build a HTML element from an EJS template.
 * @param {string} path - path to the EJS template
 * @param {Object} [locals={}] - locals to pass to the template
 * @param {String|HTMLElement} [container] - container for the control
 * @returns {HTMLElement}
 */
export function buildSync(path, locals = {}, container = 'div') {
    if (typeof path !== 'string' || !path) throw new Error(`Invalid template path: ${path}.`)
    if (typeof container !== 'string' && !(container instanceof HTMLElement)) throw new Error('Container must be a string or an HTMLElement.')
    const renderer = templates[path]
    if (!renderer) throw new Error(`Can't build sync. Preload first.`)
    try {
        if (isSelector.test(container)) {
            container = document.querySelector(container)
        } else if (typeof container === 'string') {
            container = document.createElement(container)
        }
        const html = renderSync(path, locals)
        container.insertAdjacentHTML('afterbegin', html)
        return container
    } catch (error) {
        throw new Error(`Failed to build ${path}: ${error.message}.`)
    }
}

/**
 * Preloads and compiles EJS templates from a specified path.
 *
 * @param {Object} [options] - Options for preloading templates.
 * @param {string} [options.path='views'] - The base path to start preloading.
 * @returns {Promise<string>}
 */
export async function preload({ path = 'views' } = {}) {
    try {
        const url = new URL(path, window.location.origin)
        const resp = await fetch(url)
        if (!resp.ok) {
            const errorText = await resp.text()
            throw new Error(`Failed to fetch ${url.pathname}: ${resp.statusText} - ${errorText}.`)
        }
        const json = await resp.json()
        for (let jCnt = 0; jCnt < json.length; jCnt++) {
            const file = json[jCnt]
            const fileUrl = new URL(file, window.location.origin)
            const fileReq = await fetch(fileUrl.pathname)
            const fileHTML = await fileReq.text()
            const renderer = ejs.compile(fileHTML, compileOptions)
            if (typeof renderer !== 'function') {
                throw new Error(`Failed to preload ${fileUrl.pathname}: Renderer is not a function.`)
            }
            templates[fileUrl.pathname] = renderer
        }
    } catch (error) {
        throw error
    }
}

/**
 * Compile and render a template.
 *
 * If the template has been preloaded, use the preloaded renderer.
 * Otherwise, fetch the template from the specified path, compile it,
 * and store the renderer in the `templates` objects.
 *
 * @param {string} path - Path to the template.
 * @param {Object} [locals={}] - Locals to pass to the template.
 * @returns {Promise<string>} - The rendered HTML content.
 */
export async function render(path, locals = {}) {
    if (typeof path !== 'string' || !path) throw new Error('Invalid template path.')
    let renderer = templates[path]
    if (!renderer) {
        const url = new URL(path, window.location.origin)
        const resp = await fetch(url)
        if (!resp.ok) {
            const errorText = await resp.text()
            throw new Error(`Failed to fetch ${url.pathname}: ${resp.statusText} - ${errorText}.`)
        }
        const text = await resp.text()
        renderer = ejs.compile(text, compileOptions)
        templates[path] = renderer
    }
    if (typeof renderer !== 'function') throw new Error(`Failed to load ${path}: Renderer is not a function.`)
    try {
        const html = await renderer(locals, null, async function (p, l) {
            return await render(p, l)
        })
        return html
    } catch (error) {
        throw new Error(`Error rendering template: ${error.message}.`)
    }
}

/**
 * Sync render version. Only renders a template. Does not compile ejs.
 *
 * @param {string} path - Path to the template.
 * @param {Object} [locals={}] - Locals to pass to the template.
 * @returns {String} - The rendered HTML content.
 */
export function renderSync(path, locals = {}) {
    if (typeof path !== 'string' || !path) throw new Error('Invalid template path.')
    const renderer = templates[path]
    if (!renderer) throw new Error(`Can't render sync. Preload first.`)
    if (typeof renderer !== 'function') throw new Error('Renderer is not a function.')
    try {
        const html = renderer(locals, null, function (p, l) {
            return renderSync(p, l)
        })
        return html
    } catch (error) {
        throw new Error(`Error rendering template: ${error.message}.`)
    }
}

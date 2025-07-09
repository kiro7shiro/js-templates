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
 * @param {Object} [locals={}] - locals to pass to the template
 * @param {String|HTMLElement} - container for the control
 * @returns {Promise<HTMLElement>}
 */
export async function build(path, locals = {}, container = 'div') {
    if (typeof path !== 'string' || !path) throw new Error('Invalid template path')
    if (typeof container !== 'string' && !(container instanceof HTMLElement)) throw new Error('Container must be a string or an HTMLElement')
    try {
        if (isSelector.test(container)) {
            container = document.querySelector(container)
        } else {
            container = document.createElement(container)
        }
        const html = await render(path, locals)
        container.insertAdjacentHTML('afterbegin', html)
        return container
    } catch (error) {
        throw new Error(`Failed to build ${path}: ${error.message}`)
    }
}

/**
 * Sync build version. Build a HTML element from an EJS template.
 * @param {string} path - path to the EJS template
 * @param {Object} [locals={}] - locals to pass to the template
 * @param {String|HTMLElement} - container for the control
 * @returns {HTMLElement}
 */
export function buildSync(path, locals = {}, container = 'div') {
    if (typeof path !== 'string' || !path) throw new Error(`Invalid template path: ${path}`)
    if (typeof container !== 'string' && !(container instanceof HTMLElement)) throw new Error('Container must be a string or an HTMLElement')
    const renderer = templates[path]
    if (!renderer) throw new Error(`Can't build sync. Preload first.`)
    try {
        if (isSelector.test(container)) {
            container = document.querySelector(container)
        } else {
            container = document.createElement(container)
        }
        const html = renderSync(path, locals)
        container.insertAdjacentHTML('afterbegin', html)
        return container
    } catch (error) {
        throw new Error(`Failed to build ${path}: ${error.message}`)
    }
}

/**
 * Recursively preloads and compiles EJS templates from a specified path.
 *
 * Fetches the content of the specified directory, parses it to identify
 * EJS files and directories. Compiles the EJS files and stores the renderers
 * in the `templates` objects. Recursively processes subdirectories.
 *
 * @param {Object} [options] - Options for preloading templates.
 * @param {string} [options.path='views'] - The base path to start preloading.
 * @returns {Promise<string>}
 */
export async function preload({ path = 'views' } = {}) {
    try {
        const url = new URL(`${path}`, window.location.origin)
        const resp = await fetch(`${url.pathname}`)
        if (!resp.ok) {
            throw new Error(`Failed to fetch ${url.pathname}: ${resp.statusText}`)
        }
        const text = await resp.text()
        const html = document.createElement('div')
        html.insertAdjacentHTML('afterbegin', text)
        const icons = Array.from(html.querySelectorAll('.icon'))
        if (icons.length === 0) return text
        const files = icons.filter(function (icon) {
            return icon.classList.contains('icon-ejs') && icon.title !== '..'
        })
        for (const file of files) {
            const fileHtml = await preload({ path: file.href })
            const renderer = ejs.compile(fileHtml, compileOptions)
            if (typeof renderer !== 'function') {
                throw new Error(`Failed to preload ${file.pathname}: Renderer is not a function`)
            }
            templates[file.pathname] = renderer
        }
        const directories = icons.filter(function (icon) {
            return icon.classList.contains('icon-directory') && icon.title !== '..'
        })
        for (const directory of directories) {
            await preload({ path: directory.href })
        }
    } catch (error) {
        console.error(error)
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
    if (typeof path !== 'string' || !path) throw new Error('Invalid template path')
    let renderer = templates[path]
    if (!renderer) {
        const url = new URL(path, window.location.origin)
        const resp = await fetch(url.pathname)
        if (!resp.ok) {
            const errorText = await resp.text()
            throw new Error(`Failed to fetch template: ${errorText}`)
        }
        const text = await resp.text()
        renderer = ejs.compile(text, compileOptions)
        templates[path] = renderer
    }
    if (typeof renderer !== 'function') throw new Error('Renderer is not a function')
    try {
        const html = await renderer(locals, null, async function (p, l) {
            return await render(p, l)
        })
        return html
    } catch (error) {
        throw new Error(`Error rendering template: ${error.message}`)
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
    if (typeof path !== 'string' || !path) throw new Error('Invalid template path')
    const renderer = templates[path]
    if (!renderer) throw new Error(`Can't render sync. Preload first.`)
    if (typeof renderer !== 'function') throw new Error('Renderer is not a function')
    try {
        const html = renderer(locals, null, function (p, l) {
            return renderSync(p, l)
        })
        return html
    } catch (error) {
        throw new Error(`Error rendering template: ${error.message}`)
    }
}

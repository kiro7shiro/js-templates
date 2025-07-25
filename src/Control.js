import { build, buildSync, render, renderSync } from './templates.js'

export class Control {
    static async build(template, data, container, events = ['click']) {
        const element = await build(template, data, container)
        return new Control(element, template, events)
    }
    static buildSync(template, data, container, events = ['click']) {
        const element = buildSync(template, data, container, events)
        return new Control(element, template, events)
    }
    constructor(container, template, events = ['click']) {
        this.container = container
        this.template = template
        const events2 = new Set([
            ...Array.from(container.querySelectorAll('[data-event][data-action]')).map(function (node) {
                return node.dataset.event
            }),
            ...events
        ])
        for (const event of events2) {
            this.container.addEventListener(event, function (event) {
                const { target } = event
                if (target.hasAttribute('data-event') && target.hasAttribute('data-action')) {
                    const eventType = target.getAttribute('data-event')
                    if (eventType !== event.type) return
                    const action = target.getAttribute('data-action')
                    this.dispatchEvent(new CustomEvent(action, { detail: target }))
                }
            })
        }
    }
    on(event, handler) {
        this.container.addEventListener(event, handler)
    }
    off(event, handler) {
        this.container.removeEventListener(event, handler)
    }
    async render(data) {
        const html = await render(this.template, data)
        //this.element.outerHTML = html
        this.container.innerHTML = html
        return html
    }
    renderSync(data) {
        const html = renderSync(this.template, data)
        //this.element.outerHTML = html
        this.container.innerHTML = html
        return html
    }
}

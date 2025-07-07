import { render } from './templates.js'
import { Control } from './Control.js'

export class List {
    static async build(items, { template = '/views/List.ejs', container = 'div' } = {}) {
        const control = await Control.build(template, { items }, container)
        return new List(control)
    }
    constructor(control) {
        this.control = control
        this.container = control.container
        this.list = control.container.querySelector('#items')
    }
    async add(item) {
        const itemHtml = await render('/views/ListElement.ejs', { name: item })
        this.list.insertAdjacentHTML('beforeend', itemHtml)
    }
    del(index) {
        this.list.children[index].remove()
    }
    on(event, handler) {
        this.control.on(event, handler)
    }
    off(event, handler) {
        this.control.off(event, handler)
    }
}

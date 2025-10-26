import { renderSync } from '../src/templates.js'
import { Control } from '../src/Control.js'

export class List {
    static async build(items, { template = '/views/List.ejs', container = 'div' } = {}) {
        const control = await Control.build(template, { items }, container)
        return new List(control)
    }
    static buildSync(items, { template = '/views/List.ejs', container = 'div' }) {
        const control = Control.buildSync(template, { items }, container)
        return new List(control)
    }
    constructor(control) {
        this.control = control
        this.container = control.container
        this.ul = control.container.querySelector('#items')
    }
    add(item) {
        const itemHtml = renderSync('/views/ListElement.ejs', { name: item })
        this.ul.insertAdjacentHTML('beforeend', itemHtml)
    }
    del(index) {
        this.ul.children[index].remove()
    }
    on(event, handler) {
        this.control.on(event, handler)
    }
    off(event, handler) {
        this.control.off(event, handler)
    }
}

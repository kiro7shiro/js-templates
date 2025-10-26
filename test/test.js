import { compileOptions, preload } from '../src/templates.js'
import { Control } from '../src/Control.js'
import { List } from '../controls/List.js'

async function test() {
    const control = await Control.build('/views/Control.ejs', { header: 'test1', list: [1, 2, 3] }, '#testContainer', ['click', 'change'])
    console.log(control)
    setTimeout(async function () {
        await control.render({ header: 'test2', list: [4, 5, 6] })
    }, 1500)
    control.on('clickAction', function (event) {
        console.log(event)
    })
    control.on('changeAction', function (event) {
        console.log(event)
    })
    control.on('listItemsAdd', function (event) {
        console.log(event)
    })
    control.on('listItemsDel', function (event) {
        console.log(event)
    })
    control.on('listItemClick', function (event) {
        console.log(event)
    })
}

async function testSync() {
    compileOptions.async = false
    await preload()
    const control = Control.buildSync('/views/Control.ejs', { header: 'test3', list: [1, 2, 3] }, '#testContainer', ['click', 'change'])
    document.body.insertAdjacentElement('afterbegin', control.container)
    setTimeout(function () {
        control.renderSync({ header: 'test4', list: [4, 5, 6] })
    }, 1500)
    control.on('clickAction', function (event) {
        console.log(event)
    })
    control.on('changeAction', function (event) {
        console.log(event)
    })
    control.on('listItemsAdd', function (event) {
        console.log(event)
    })
    control.on('listItemsDel', function (event) {
        console.log(event)
    })
    control.on('listItemClick', function (event) {
        console.log(event)
    })
}

async function testList() {
    compileOptions.async = false
    await preload()
    const list = List.buildSync([1, 2, 3], { container: '#testList' })
    console.log(list)
    list.on('listItemClick', function (event) {
        console.log(event)
    })
    list.on('addListItem', function (event) {
        console.log(event)
        list.add(list.ul.childElementCount)
    })
    list.on('delListItem', function (event) {
        console.log(event)
        list.del(0)
    })
}

//test()
//testSync()
testList()
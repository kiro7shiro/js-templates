import { compileOptions, preload, render, Control, List } from './index.js'

async function test() {
    const control = await Control.build('/views/Control.ejs', { header: 'test', list: [1, 2, 3] }, '#testContainer')
    setTimeout(async function () {
        await control.render({ header: 'test2', list: [4, 5, 6] })
    }, 1500)
    control.on('clickAction', function (event) {
        console.log(event)
    })
    control.on('changeAction', function (event) {
        console.log(event)
    })
    control.on('listItemClick', function (event) {
        console.log(event)
    })
}

async function testList() {
    const list = await List.build([1, 2, 3], { container: '#testList' })
    console.log(list)
    list.on('listItemClick', function (event) {
        console.log(event)
    })
    list.on('addListItem', async function (event) {
        console.log(event)
        await list.add(4)
    })
    list.on('delListItem', function (event) {
        console.log(event)
        list.del(0)
    })
}

async function testSync() {
    compileOptions.async = false
    await preload({ path: '/views/sync' })
    const control = Control.buildSync('/views/sync/Control.ejs', { header: 'test3', list: [1, 2, 3] }, '#testContainer')
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
    control.on('listItemClick', function (event) {
        console.log(event)
    })
}

//test()
testList()
//testSync()

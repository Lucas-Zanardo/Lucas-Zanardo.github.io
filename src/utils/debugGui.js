

export function addVector2(gui, object, propertyName, customName = '') {
    const folder = gui.addFolder(customName || propertyName);
    folder.add(object[propertyName], 'x').listen();
    folder.add(object[propertyName], 'y').listen();
    return folder;
}

export function addVector3(gui, object, propertyName, customName = '') {
    const folder = gui.addFolder(customName || propertyName);
    folder.add(object[propertyName], 'x').listen();
    folder.add(object[propertyName], 'y').listen();
    folder.add(object[propertyName], 'z').listen();
    return folder;
}
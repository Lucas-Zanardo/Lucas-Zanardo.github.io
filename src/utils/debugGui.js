
export function addVector3(gui, object, propertyName) {
    const folder = gui.addFolder(propertyName);
    folder.add(object[propertyName], 'x').listen();
    folder.add(object[propertyName], 'y').listen();
    folder.add(object[propertyName], 'z').listen();
    return folder;
}
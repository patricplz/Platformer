export function attachCamera(attachedObj, offsetX, fixedY) {
    onUpdate(() => {
        camPos(attachedObj.pos.x + offsetX, fixedY)
    })
}

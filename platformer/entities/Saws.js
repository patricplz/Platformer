export class Saws {
    constructor(positions, ranges) {
        this.positions = positions
        this.ranges = ranges
        this.saws = []
        for (const position of this.positions) {
            this.saws.push(
                add([
                    sprite("saw"),
                    area(),
                    anchor("center"),
                    pos(position),
                    scale(4),
                    rotate(),
                    state("rotate-left", ["rotate-left", "rotate-right"]),
                    offscreen(),
                    "saws"
                ])
            )
        }
    }

    async moveAndRotate(saw, moveBy) {
        if (!saw.isOffScreen()) play("saw", { volume: 0.6, seek: 10 })
            await Promise.all([
                tween(
                    saw.pos.x,
                    saw.pos.x + moveBy,
                    1,
                    (posX) => (saw.pos.x = posX),
                    easings.linear
                ), tween(
                    saw.angle,
                    360,
                    2,
                    (currAngle) => (saw.angle = currAngle),
                    easings.linear
                )
            ])
    }

    setMovementPattern() {
        for (const [index, saw] of this.saws.entries()) {
            const rotateLeft = saw.onStateEnter("rotate-left", async () => {
                await this.moveAndRotate(saw, -this.ranges[index])

                saw.angle = 0
                saw.enterState("rotate-right")
            })
            const rotateRight = saw.onStateEnter("rotate-right", async () => {
                await this.moveAndRotate(saw, this.ranges[index])

                saw.angle = 0
                saw.enterState("rotate-left")
            })

            onSceneLeave(() => {
                rotateRight.cancel()
                rotateLeft.cancel()
            })
        }
    }
}
export class Axes {
    constructor(positions, swingDurations) {
        this.swingDurations = swingDurations
        this.axes = []
        for (const position of positions) {
            this.axes.push(
                add([
                    sprite("axe"),
                    area({
                    shape: new Rect(vec2(0, 40), 30, 10),
                    collisionIgnore: ["spiders", "flame"],
                    }),
                    pos(position),
                    scale(4),
                    anchor(vec2(0, -0.75)),
                    state("swing-left", ["swing-left", "swing-right"]),
                    rotate(),
                    offscreen(),
                    "axes",
                ])
            )
        }
    }

    async swing(axe, targetAngle, swingDuration) {
        if (!axe.isOffScreen()) play("swinging-axe")

        await tween(
            axe.angle,
            targetAngle,
            swingDuration,
            (val) => axe.angle = val,
            easings.easeInOutSine
        )
    }

    setMovementPattern() {
        for (const [index, axe] of this.axes.entries()) {
            const swingLeft = axe.onStateEnter("swing-left", async () => {
                await this.swing(axe, 90, this.swingDurations[index])
                axe.enterState("swing-right")
            })
            const swingRight = axe.onStateEnter("swing-right", async () => {
                await this.swing(axe, -90, this.swingDurations[index])
                axe.enterState("swing-left")
            })
            onSceneLeave(() => {
                swingLeft.cancel()
                swingRight.cancel()
            })
        }
    }
}
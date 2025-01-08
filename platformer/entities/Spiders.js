export class Spiders {

    constructor(positions, ranges, durations, type) {
        this.ranges = ranges
        this.durations = durations
        this.spiders = []
        for (const position of positions) {
            this.spiders.push(
                add([
                    sprite(`spider-${type}`, { anim: "crawl" }),
                    pos(position),
                    area({
                        shape: new Rect(vec2(0, 4.5), 20, 6),
                        collisionIgnore: ["spiders"]
                    }),
                    anchor("center"),
                    body(),
                    scale(4),
                    state("idle", ["idle", "crawl-left", "crawl-right"]),
                    offscreen(),
                    "spiders"
                ])
            )
        }
    }

    async crawl(spider, moveBy, duration) {
        if (spider.curAnim() !== "crawl") spider.play("crawl")
    
        await tween(
          spider.pos.x,
          spider.pos.x + moveBy,
          duration,
          (posX) => (spider.pos.x = posX),
          easings.easeOutSine
        )
      }

    setMovementPattern() {
        for (const [index, spider] of this.spiders.entries()) {
            const idle = spider.onStateEnter("idle", async(previousState) => {
                if (spider.curAnim() !== "idle") spider.play("idle")

                await new Promise((resolve) => {
                    setTimeout(() => resolve(), 1000)
                })

                if(previousState === "crawl-left") {
                    spider.enterState("crawl-right")  
                    return
                } 
                
                spider.jump()
                if (!spider.isOffScreen()){
                    play("spider-attack", { volume: 0.6 })
                }

                spider.enterState("crawl-left")
            })

            const crawlLeft = spider.onStateEnter("crawl-left", async() => {
                spider.flipX = false
                await this.crawl(
                    spider,
                    -this.ranges[index],
                    this.durations[index]
                )
                spider.enterState("idle", "crawl-left") //lo pongo en idle y previousState = crawl-left para la logica anterior
            })

            const crawlRight = spider.onStateEnter("crawl-right", async() => {
                spider.flipX = true
                await this.crawl(
                    spider,
                    this.ranges[index],
                    this.durations[index]
                )
                spider.enterState("idle")
            })

            onSceneLeave(() => { //cancelar todo despues de que acabe el nivel
                idle.cancel()
                crawlLeft.cancel()
                crawlRight.cancel()
            })
        }
    }

    enablePassthrough() {
        for (const spider of this.spiders) {
          spider.onBeforePhysicsResolve((collision) => {
            if (collision.target.is("passthrough") && spider.isJumping()) {
              collision.preventResolution()
            }
          })
        }
    }
} 

import Header from "@/components/Header"

const About = () => {
  return (
    <main
        className={`font-sans flex min-h-screen flex-col p-4`}
      >
      <Header withSync={false} />
      <div className="max-w-md">
        <p className="mb-2">
          <a href="https://x.com/caaatisgood/status/1703198801903640839?s=20" className="underline" target="_blank">90s demo vid</a>
        </p>
        <p className="mb-2">
          punches is a progress tracker with generative art visualization that helps you make consistent progress on what you are working on.
        </p>
        <p className="mb-2">
          Committing to something once could be easy. But to do it <i>constantly</i> could be super hard sometimes. Maybe it’s not as simple as you think, it’s not fun as you expect, you don’t know if it’s gonna be useful or not, new focus comes in, whatever.
        </p>
        <p className="mb-2">
          Those things sometimes doesn’t have a clear result or ending even. They are “work-in-progress”. They are things that could potentially get you to a different place. And consistency is the key in order to pull that off. You can only get the most out of your “wip” by constantly getting back to it, work on it, and work through it.
        </p>
        <p className="mb-2">
          punches helps you setup your wip. Everytime you come back to it, you make a “punch” - a check-in on your wip as a proof that you did something about it. Every punch will create a new iteration of the generated visual.
        </p>
        <p className="mb-2">
          It’s more about what you did, not what you completed. Same mindset applies to how the visual intended to appeal. It keeps track of the process, not the end result.
        </p>
        <p className="mb-2">
          Whatever you’re wip is, punches is here to motivate you and help you keep up the momentum.
        </p>
        <p className="mb-2">
          Happy punching!
        </p>
      </div>
    </main>
  )
}

export default About

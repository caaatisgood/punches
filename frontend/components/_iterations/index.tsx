import Head from 'next/head'

export default function Home() {
  return (
    <main
      className={`font-sans flex min-h-screen flex-col items-center justify-center`}
    >
      <Head>
        <title>punches | make consistent progress toward your goal.</title>
      </Head>
      <h1>
        punches / make consistent progress toward your goal / coming soon
      </h1>
      <br />
      <p>
        follow <a className="underline" href="https://twitter.com/caaatisgood" target="_blank">@caaatisgood</a> for updates
      </p>
    </main>
  )
}

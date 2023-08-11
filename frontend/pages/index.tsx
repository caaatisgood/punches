import Head from 'next/head'

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center`}
    >
      <Head>
        <title>punches | make consistent progress toward your goal.</title>
      </Head>
      <h1>
        <code className="text-xs">punches / make consistent progress toward your goal / coming soon</code>
      </h1>
      <br />
      <p>
        <code className="text-xs">follow <a className="underline" href="https://twitter.com/caaatisgood" target="_blank">@caaatisgood</a> for updates</code>
      </p>
    </main>
  )
}

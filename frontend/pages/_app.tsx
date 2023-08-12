import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Nova_Slim, Nova_Mono } from 'next/font/google'

const novaSlim = Nova_Slim({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-nova-slim'
})

const novaMono = Nova_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-nova-mono'
})


export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${novaSlim.className} ${novaMono.className}`}>
      <Component {...pageProps} />
    </main>
  )
}

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
    <div className={`${novaSlim.variable} ${novaMono.variable}`}>
      <Component {...pageProps} />
    </div>
  )
}

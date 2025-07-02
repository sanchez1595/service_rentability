import Head from 'next/head'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { BabyStoreCalculatorWithSupabase } from '../components/calculadora/BabyStoreCalculatorWithSupabase'

export default function Home() {
  return (
    <>
      <Head>
        <title>Rentability - Sistema de Gestión Empresarial</title>
        <meta name="description" content="Sistema de gestión completo para tiendas de productos para bebés" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ProtectedRoute>
        <BabyStoreCalculatorWithSupabase />
      </ProtectedRoute>
    </>
  )
}
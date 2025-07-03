import Head from 'next/head'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { ServicesProvider } from '../contexts/ServicesContext'
import { SistemaServicios } from '../components/servicios/SistemaServicios'

export default function Home() {
  return (
    <>
      <Head>
        <title>Rentability Pro - Sistema de Gestión de Servicios</title>
        <meta name="description" content="Sistema completo de gestión de servicios, cotizaciones y proyectos" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ProtectedRoute>
        <ServicesProvider>
          <SistemaServicios />
        </ServicesProvider>
      </ProtectedRoute>
    </>
  )
}
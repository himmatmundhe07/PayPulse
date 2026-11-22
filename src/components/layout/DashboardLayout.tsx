import React, { ReactNode } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

type DashboardLayoutProps = {
    children: ReactNode,
    title: string
}

const DashboardLayout = ({children, title}: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Header title={title} />

        <main className="flex-1 p-6">
            {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout

import React from 'react'
import { SiderbarAdmin } from './SiderbarAdmin'
import { Outlet } from 'react-router-dom'

export const LayoutAdmin = () => {
  return (
    <div>
        <div className="flex h-screen overflow-hidden">
            <SiderbarAdmin/>
            <div className="flex-1 overflow-auto">
                <main className="min-h-screen bg-gray-50">
                    <Outlet/> {/* THAY {children} BẰNG Outlet */}
                </main>
            </div>
        </div>
    </div>
  )
}

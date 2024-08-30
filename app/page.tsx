import RehearsalRoomBooking from './RehearsalRoomBooking'
import './globals.css'  // {{ edit_1 }}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 sm:p-8 md:p-16 lg:p-24">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8">Music Reserver APP</h1>
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <RehearsalRoomBooking />
      </div>
    </main>
  )
}
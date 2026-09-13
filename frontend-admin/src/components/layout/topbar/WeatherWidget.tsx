'use client'

import { useEffect, useState } from 'react'

interface WeatherData {
  temp: number
  code: number
  description: string
}

function getWeatherDescription(code: number): string {
  if (code === 0) return 'Trời quang'
  if (code === 1) return 'Ít mây'
  if (code === 2) return 'Mây rải rác'
  if (code === 3) return 'Nhiều mây'
  if (code === 45 || code === 48) return 'Có sương mù'
  if (code >= 51 && code <= 57) return 'Mưa phun'
  if (code >= 61 && code <= 67) return 'Mưa vừa'
  if (code >= 71 && code <= 77) return 'Có tuyết'
  if (code >= 80 && code <= 82) return 'Mưa rào'
  if (code >= 95) return 'Mưa dông'
  return 'Nhiều mây'
}

function ColorfulWeatherIcon({ code }: { code: number }) {
  // Trời quang (0)
  if (code === 0) {
    return (
      <svg viewBox="0 0 24 24" className="w-6 h-6 drop-shadow-xs">
        <circle cx="12" cy="12" r="5" fill="#f59e0b" />
        <path
          d="M12 2v2.5m0 15V22M4.93 4.93l1.77 1.77m10.6 10.6l1.77 1.77M2 12h2.5m15 0H22M4.93 19.07l1.77-1.77m10.6-10.6l1.77-1.77"
          stroke="#f59e0b"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  // Ít mây / Mây rải rác (1, 2)
  if (code === 1 || code === 2) {
    return (
      <svg viewBox="0 0 24 24" className="w-6 h-6 drop-shadow-xs">
        {/* Sun in background */}
        <circle cx="15.5" cy="8.5" r="3.5" fill="#f59e0b" />
        <path
          d="M15.5 3v1.5m0 8v1.5m-5.5-5.5h1.5m8 0H21m-6.8-4.3l1.1 1.1m6 6l1.1 1.1"
          stroke="#f59e0b"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* Soft Blue Cloud in foreground */}
        <path
          d="M6.5 18a4.5 4.5 0 01-.4-8.98A5.5 5.5 0 0116.3 10.3a3.5 3.5 0 01.2 7.7H6.5z"
          fill="#60a5fa"
          fillOpacity="0.4"
          stroke="#2563eb"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  // Nhiều mây (3)
  if (code === 3) {
    return (
      <svg viewBox="0 0 24 24" className="w-6 h-6 drop-shadow-xs">
        <path
          d="M5.5 17a4.5 4.5 0 01-.4-8.98A5.5 5.5 0 0115.3 9.3a3.5 3.5 0 01.2 7.7H5.5z"
          fill="#94a3b8"
          fillOpacity="0.45"
          stroke="#475569"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  // Mưa phun / Mưa vừa / Mưa rào (51-82)
  if (code >= 51 && code <= 82) {
    return (
      <svg viewBox="0 0 24 24" className="w-6 h-6 drop-shadow-xs">
        <path
          d="M5.5 13.5a4.5 4.5 0 01-.4-8.98A5.5 5.5 0 0115.3 5.8a3.5 3.5 0 01.2 7.7H5.5z"
          fill="#60a5fa"
          fillOpacity="0.4"
          stroke="#2563eb"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M8 17v2.5M12 17v2.5M16 17v2.5"
          stroke="#1d4ed8"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  // Mưa dông (95-99)
  if (code >= 95) {
    return (
      <svg viewBox="0 0 24 24" className="w-6 h-6 drop-shadow-xs">
        <path
          d="M5.5 12.5a4.5 4.5 0 01-.4-8.98A5.5 5.5 0 0115.3 4.8a3.5 3.5 0 01.2 7.7H5.5z"
          fill="#64748b"
          fillOpacity="0.5"
          stroke="#334155"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M13 13.5l-2.5 3.5h3.5l-2.5 4"
          stroke="#eab308"
          fill="#eab308"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  // Sương mù / Khác
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 drop-shadow-xs">
      <path
        d="M5.5 14a4.5 4.5 0 01-.4-8.98A5.5 5.5 0 0115.3 6.3a3.5 3.5 0 01.2 7.7H5.5z"
        fill="#cbd5e1"
        fillOpacity="0.4"
        stroke="#64748b"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M5 18h14M7 20.5h10" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData>({
    temp: 26,
    code: 2,
    description: 'Mây rải rác'
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchWeather(lat: number, lon: number) {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`
        )
        const data = await res.json()
        if (data?.current) {
          const code = data.current.weather_code ?? 2
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            code,
            description: getWeatherDescription(code)
          })
        }
      } catch (err) {
        console.error('Failed to fetch weather:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchWeather(pos.coords.latitude, pos.coords.longitude)
        },
        () => {
          // Default Ho Chi Minh City coords
          fetchWeather(10.8231, 106.6297)
        },
        { timeout: 5000 }
      )
    } else {
      fetchWeather(10.8231, 106.6297)
    }
  }, [])

  return (
    <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white border border-gray-400 rounded-xl select-none">
      <div className="shrink-0 flex items-center justify-center">
        <ColorfulWeatherIcon code={weather.code} />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-bold text-slate-800 tracking-tight">
          {isLoading ? '--' : `${weather.temp}°C`}
        </span>
        <span className="text-[11px] text-slate-500 font-medium">{weather.description}</span>
      </div>
    </div>
  )
}

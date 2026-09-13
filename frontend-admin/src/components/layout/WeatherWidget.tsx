'use client'

import { useState, useEffect } from 'react'
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  Snowflake,
  CloudFog,
  Loader2
} from 'lucide-react'

interface WeatherData {
  temperature: number
  weatherCode: number
  description: string
  icon: React.ElementType
  iconColor: string
  locationName: string
}

function getWeatherInfo(code: number): {
  description: string
  icon: React.ElementType
  color: string
} {
  switch (code) {
    case 0:
      return { description: 'Trời quang', icon: Sun, color: 'text-amber-500' }
    case 1:
      return { description: 'Nắng nhẹ', icon: Sun, color: 'text-amber-500' }
    case 2:
      return { description: 'Mây rải rác', icon: CloudSun, color: 'text-amber-400' }
    case 3:
      return { description: 'Nhiều mây', icon: Cloud, color: 'text-slate-400' }
    case 45:
    case 48:
      return { description: 'Sương mù', icon: CloudFog, color: 'text-slate-400' }
    case 51:
    case 53:
    case 55:
      return { description: 'Mưa phun nhẹ', icon: CloudDrizzle, color: 'text-blue-400' }
    case 61:
    case 63:
    case 65:
      return { description: 'Mưa rào', icon: CloudRain, color: 'text-blue-500' }
    case 71:
    case 73:
    case 75:
      return { description: 'Có tuyết rơi', icon: Snowflake, color: 'text-sky-300' }
    case 80:
    case 81:
    case 82:
      return { description: 'Mưa rào nặng hạt', icon: CloudRain, color: 'text-blue-600' }
    case 95:
    case 96:
    case 99:
      return { description: 'Có dông bão', icon: CloudLightning, color: 'text-purple-500' }
    default:
      return { description: 'Thời tiết ôn hòa', icon: CloudSun, color: 'text-amber-400' }
  }
}

// Default fallback coordinates: Ho Chi Minh City
const DEFAULT_LAT = 10.8231
const DEFAULT_LON = 106.6297

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true

    const fetchWeather = async (lat: number, lon: number, locationName: string) => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
        )
        if (!response.ok) throw new Error('Weather API request failed')

        const data = await response.json()
        const currentTemp = Math.round(data.current?.temperature_2m ?? 30)
        const code = data.current?.weather_code ?? 1
        const info = getWeatherInfo(code)

        if (isMounted) {
          setWeather({
            temperature: currentTemp,
            weatherCode: code,
            description: info.description,
            icon: info.icon,
            iconColor: info.color,
            locationName
          })
        }
      } catch (err) {
        console.error('Failed to fetch weather data:', err)
        if (isMounted) {
          const fallbackInfo = getWeatherInfo(1)
          setWeather({
            temperature: 30,
            weatherCode: 1,
            description: fallbackInfo.description,
            icon: fallbackInfo.icon,
            iconColor: fallbackInfo.color,
            locationName: 'TP. Hồ Chí Minh'
          })
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchWeather(pos.coords.latitude, pos.coords.longitude, 'Vị trí hiện tại')
        },
        () => {
          // Geolocation rejected or failed -> fallback to HCM City
          fetchWeather(DEFAULT_LAT, DEFAULT_LON, 'TP. Hồ Chí Minh')
        },
        { timeout: 5000 }
      )
    } else {
      fetchWeather(DEFAULT_LAT, DEFAULT_LON, 'TP. Hồ Chí Minh')
    }

    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2.5 bg-white/45 backdrop-blur-md rounded-2xl px-3 py-1.5 shadow-2xs">
        <Loader2 size={18} className="animate-spin text-slate-400 shrink-0" />
        <div className="flex flex-col leading-none gap-1">
          <span className="h-3 w-8 bg-slate-300/80 rounded animate-pulse" />
          <span className="h-2.5 w-16 bg-slate-300/60 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (!weather) return null

  const IconComponent = weather.icon

  return (
    <div
      className="flex items-center gap-2.5 bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl px-3 py-1.5 shadow-2xs transition-all cursor-default"
      title={`Thời tiết realtime - ${weather.locationName}`}
    >
      <IconComponent size={18} className={`${weather.iconColor} shrink-0`} />
      <div className="flex flex-col leading-none">
        <span className="text-xs font-extrabold text-slate-900">{weather.temperature}°C</span>
        <span className="text-[10px] font-bold text-slate-600 mt-0.5">{weather.description}</span>
      </div>
    </div>
  )
}

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
  Loader2,
  MapPin
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
    case 1:
      return { description: 'Trời quang', icon: Sun, color: 'text-amber-500 drop-shadow-xs' }
    case 2:
      return { description: 'Mây rải rác', icon: CloudSun, color: 'text-amber-500 drop-shadow-xs' }
    case 3:
      return { description: 'Nhiều mây', icon: Cloud, color: 'text-sky-600 drop-shadow-xs' }
    case 45:
    case 48:
      return { description: 'Sương mù', icon: CloudFog, color: 'text-slate-500' }
    case 51:
    case 53:
    case 55:
      return { description: 'Mưa phun nhẹ', icon: CloudDrizzle, color: 'text-cyan-600' }
    case 61:
    case 63:
    case 65:
      return { description: 'Mưa rào', icon: CloudRain, color: 'text-blue-600' }
    case 71:
    case 73:
    case 75:
      return { description: 'Tuyết rơi', icon: Snowflake, color: 'text-sky-400' }
    case 80:
    case 81:
    case 82:
      return { description: 'Mưa rào lớn', icon: CloudRain, color: 'text-blue-700' }
    case 95:
    case 96:
    case 99:
      return { description: 'Có dông bão', icon: CloudLightning, color: 'text-purple-600' }
    default:
      return { description: 'Thời tiết tốt', icon: CloudSun, color: 'text-amber-500' }
  }
}

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
        const currentTemp = Math.round(data.current?.temperature_2m ?? 32)
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
            temperature: 32,
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
      <div className="flex items-center gap-2.5 bg-white/80 backdrop-blur-xl border border-white/90 rounded-2xl px-3.5 py-2 shadow-sm shadow-[#1261A6]/5">
        <Loader2 size={18} className="animate-spin text-[#1261A6] shrink-0" />
        <div className="flex flex-col leading-none gap-1">
          <span className="h-3 w-10 bg-slate-200 rounded animate-pulse" />
          <span className="h-2.5 w-16 bg-slate-200/80 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (!weather) return null

  const IconComponent = weather.icon

  return (
    <div
      className="flex items-center gap-3 bg-white/85 backdrop-blur-xl border border-white/90 rounded-2xl px-3.5 py-2 shadow-md shadow-[#1261A6]/8 hover:shadow-lg hover:border-[#2A95BF]/40 hover:bg-white/95 transition-all duration-300 cursor-default group"
      title={`Thời tiết realtime - ${weather.locationName}`}
    >
      <div className="p-1.5 rounded-xl bg-[#1261A6]/10 border border-[#1261A6]/15 group-hover:scale-105 transition-transform duration-200">
        <IconComponent size={20} className={`${weather.iconColor} shrink-0`} />
      </div>
      <div className="flex flex-col leading-tight">
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-black text-slate-900 tracking-tight">{weather.temperature}°C</span>
          <span className="text-[11px] font-extrabold text-[#1261A6] truncate">{weather.description}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 mt-0.5">
          <MapPin size={10} className="text-[#2A95BF] shrink-0" />
          <span className="truncate max-w-[100px]">{weather.locationName}</span>
        </div>
      </div>
    </div>
  )
}

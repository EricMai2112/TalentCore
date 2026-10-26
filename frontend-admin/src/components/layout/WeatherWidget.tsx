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
      return { description: 'Trời quang', icon: Sun, color: 'text-[#F59E0B] drop-shadow-xs' }
    case 2:
      return { description: 'Mây rải rác', icon: CloudSun, color: 'text-[#F59E0B] drop-shadow-xs' }
    case 3:
      return { description: 'Nhiều mây', icon: Cloud, color: 'text-[#3B82F6] drop-shadow-xs' }
    case 45:
    case 48:
      return { description: 'Sương mù', icon: CloudFog, color: 'text-[#64748B]' }
    case 51:
    case 53:
    case 55:
      return { description: 'Mưa phùn nhẹ', icon: CloudDrizzle, color: 'text-[#06B6D4]' }
    case 61:
    case 63:
    case 65:
      return { description: 'Mưa rào', icon: CloudRain, color: 'text-[#3B82F6]' }
    case 71:
    case 73:
    case 75:
      return { description: 'Tuyết rơi', icon: Snowflake, color: 'text-[#06B6D4]' }
    case 80:
    case 81:
    case 82:
      return { description: 'Mưa rào lớn', icon: CloudRain, color: 'text-[#1D4ED8]' }
    case 95:
    case 96:
    case 99:
      return { description: 'Có dông bão', icon: CloudLightning, color: 'text-[#8B5CF6]' }
    default:
      return { description: 'Thời tiết tốt', icon: CloudSun, color: 'text-[#F59E0B]' }
  }
}

const DEFAULT_LAT = 10.8231
const DEFAULT_LON = 106.6297

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true

    const CACHE_KEY = 'talentcore_weather_cache'
    const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

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

        const weatherData: WeatherData = {
          temperature: currentTemp,
          weatherCode: code,
          description: info.description,
          icon: info.icon,
          iconColor: info.color,
          locationName
        }

        if (isMounted) {
          setWeather(weatherData)
          // Cache result to avoid re-fetching on every page navigation
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: { ...weatherData, icon: undefined }, code, timestamp: Date.now(), locationName }))
          } catch {
            // sessionStorage may be unavailable in some environments — ignore
          }
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

    // Check cache first — skip API call if data is fresh
    try {
      const cached = sessionStorage.getItem(CACHE_KEY)
      if (cached) {
        const { code, timestamp, locationName } = JSON.parse(cached)
        if (Date.now() - timestamp < CACHE_TTL && code !== undefined) {
          const info = getWeatherInfo(code)
          const { data } = JSON.parse(cached)
          if (isMounted) {
            setWeather({ ...data, icon: info.icon, iconColor: info.color, locationName })
            setLoading(false)
            return
          }
        }
      }
    } catch {
      // Invalid cache — fall through to API fetch
    }

    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchWeather(pos.coords.latitude, pos.coords.longitude, 'Vị trí hiện tại')
        },
        () => {
          fetchWeather(DEFAULT_LAT, DEFAULT_LON, 'TP. Hồ Chí Minh')
        },
        { timeout: 2000 }  // Reduced from 5000ms — fallback to default city faster
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
      <div className="flex items-center gap-2.5 bg-white/55 backdrop-blur-xl border border-white/65 rounded-2xl px-3.5 py-2 shadow-2xs">
        <Loader2 size={18} className="animate-spin text-[#3B82F6] shrink-0" />
        <div className="flex flex-col leading-none gap-1">
          <span className="h-3 w-10 bg-slate-200/80 rounded animate-pulse" />
          <span className="h-2.5 w-16 bg-slate-200/60 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (!weather) return null

  const IconComponent = weather.icon

  return (
    <div
      className="flex items-center gap-3 bg-white/55 backdrop-blur-xl border border-white/65 rounded-2xl px-3.5 py-2 shadow-2xs hover:shadow-sm hover:border-white/85 hover:bg-white/75 transition-all duration-300 cursor-default group"
      title={`Thời tiết realtime - ${weather.locationName}`}
    >
      <div className="p-1.5 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 group-hover:scale-105 transition-transform duration-200">
        <IconComponent size={19} className={`${weather.iconColor} shrink-0`} />
      </div>
      <div className="flex flex-col leading-tight">
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-black text-[#0F172A] tracking-tight">
            {weather.temperature}°C
          </span>
          <span className="text-[11px] font-extrabold text-[#3B82F6] truncate">
            {weather.description}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-semibold text-[#64748B] mt-0.5">
          <MapPin size={10} className="text-[#06B6D4] shrink-0" />
          <span className="truncate max-w-[100px]">{weather.locationName}</span>
        </div>
      </div>
    </div>
  )
}

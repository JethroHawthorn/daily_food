export interface WeatherData {
  temp_c: number;
  condition: {
    text: string;
    code: number;
  };
  humidity: number;
  is_day: number;
}

export async function getWeather(lat: number = 21.0285, lon: number = 105.8542): Promise<WeatherData | null> {
  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) {
    console.warn("WEATHER_API_KEY is not set.");
    return null;
  }

  try {
    const res = await fetch(
      `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}&aqi=no`
    );

    if (!res.ok) {
      throw new Error(`Weather API Error: ${res.statusText}`);
    }

    const data = await res.json();
    return {
      temp_c: data.current.temp_c,
      condition: data.current.condition,
      humidity: data.current.humidity,
      is_day: data.current.is_day,
    };
  } catch (error) {
    console.error("Failed to fetch weather:", error);
    return null;
  }
}

export function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1; // 1-12
  // Northern Vietnam Seasons (approx)
  if (month >= 3 && month <= 5) return "Spring (Xuân)";
  if (month >= 6 && month <= 8) return "Summer (Hè)";
  if (month >= 9 && month <= 11) return "Autumn (Thu)";
  return "Winter (Đông)";
}

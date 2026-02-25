import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, CloudRain, AlertTriangle, Wind, Info } from 'lucide-react';

interface WeatherData {
    data?: {
        metars?: Record<string, any[]>;
        tafors?: Record<string, any[]>;
        atis?: Record<string, any[]>;
        area_warnings?: Record<string, any>;
    };
}

export default function WeatherTab() {
    const { t } = useTranslation();
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    const fetchWeather = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const url = `${window.location.origin}/api/weather`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network error');
            const data = await response.json();
            setWeatherData(data);
            setLastUpdate(new Date());
        } catch (err) {
            console.error("Failed to fetch weather data:", err);
            setError(t('navPlanner.weather.error'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWeather();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const metars: string[] = [];
    if (weatherData?.data?.metars) {
        Object.values(weatherData.data.metars).forEach(arr => {
            arr.forEach(item => {
                if (item.content) metars.push(item.content);
            });
        });
    }

    const tafors: string[][] = [];
    if (weatherData?.data?.tafors) {
        Object.values(weatherData.data.tafors).forEach(arr => {
            arr.forEach(item => {
                if (item.lines) {
                    tafors.push(item.lines.map((l: any) => l.content));
                }
            });
        });
    }

    const atis: string[] = [];
    if (weatherData?.data?.atis) {
        Object.values(weatherData.data.atis).forEach(arr => {
            arr.forEach(item => {
                if (item.content) atis.push(item.content);
            });
        });
    }

    const warnings: string[][] = [];
    if (weatherData?.data?.area_warnings) {
        Object.values(weatherData.data.area_warnings).forEach(item => {
            if (item.lines) {
                warnings.push(item.lines.map((l: any) => l.content));
            }
        });
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-aviation-blue px-4 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <CloudRain className="h-6 w-6 text-white" />
                        <h3 className="text-xl font-bold text-white">{t('navPlanner.weather.title')}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-white">
                        {lastUpdate && (
                            <span className="text-sm opacity-90 font-mono hidden sm:inline-block">
                                {t('navPlanner.weather.lastUpdate')} {lastUpdate.toLocaleTimeString('he-IL')}
                            </span>
                        )}
                        <button
                            onClick={fetchWeather}
                            disabled={isLoading}
                            className={`p-1.5 text-white hover:text-blue-200 rounded-lg hover:bg-white/10 transition ${isLoading ? "opacity-50" : ""}`}
                            title={t('navPlanner.weather.refresh')}
                        >
                            <RefreshCw className={`h-[18px] w-[18px] ${isLoading ? 'animate-spin' : ''}`} strokeWidth={2} />
                        </button>
                    </div>
                </div>

                <div className="p-4 sm:p-6 space-y-8">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-md flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {!error && !weatherData && isLoading && (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-aviation-blue border-t-transparent"></div>
                        </div>
                    )}

                    {!error && weatherData && (
                        <>
                            {/* Warnings Section */}
                            {warnings.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="flex items-center gap-2 text-lg font-bold text-red-600 dark:text-red-400">
                                        <AlertTriangle className="h-5 w-5" />
                                        {t('navPlanner.weather.warnings')}
                                    </h4>
                                    <div className="grid gap-3">
                                        {warnings.map((lines, i) => (
                                            <div key={i} className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 p-3 rounded-md font-mono text-sm text-red-800 dark:text-red-300">
                                                {lines.map((line, j) => (
                                                    <div key={j}>{line}</div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ATIS Section */}
                            {atis.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-200">
                                        <Info className="h-5 w-5 text-green-500" />
                                        {t('navPlanner.weather.atis')}
                                    </h4>
                                    <div className="grid gap-2">
                                        {atis.map((a, i) => (
                                            <div key={i} className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 p-3 rounded-md font-mono text-sm text-green-800 dark:text-green-300">
                                                {a}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* METAR Section */}
                            {metars.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-200">
                                        <Info className="h-5 w-5 text-blue-500" />
                                        {t('navPlanner.weather.metar')}
                                    </h4>
                                    <div className="grid gap-2 lg:grid-cols-2">
                                        {metars.map((metar, i) => (
                                            <div key={i} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3 rounded-md font-mono text-sm text-gray-800 dark:text-gray-300">
                                                {metar}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* TAF Section */}
                            {tafors.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-200">
                                        <Wind className="h-5 w-5 text-blue-500" />
                                        {t('navPlanner.weather.taf')}
                                    </h4>
                                    <div className="grid gap-3 lg:grid-cols-2">
                                        {tafors.map((lines, i) => (
                                            <div key={i} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3 rounded-md font-mono text-sm text-gray-800 dark:text-gray-300 flex flex-col gap-1">
                                                {lines.map((line, j) => (
                                                    <div key={j} className={j > 0 ? "pl-4 text-gray-600 dark:text-gray-400" : "font-bold"}>{line}</div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {metars.length === 0 && tafors.length === 0 && atis.length === 0 && warnings.length === 0 && (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    {t('navPlanner.weather.noData')}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

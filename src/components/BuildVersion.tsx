import { useState } from 'react';
import buildInfo from '../build-info.json';

export default function BuildVersion() {
    const [showTooltip, setShowTooltip] = useState(false);

    const version = '1.0.0';
    const displayVersion = `v${version}-${buildInfo.shortHash}`;

    return (
        <div
            className="fixed bottom-20 md:bottom-2 left-2 z-40 select-none"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <div className="relative">
                <span className="text-[10px] text-gray-400 dark:text-gray-600 font-mono opacity-50 hover:opacity-100 transition-opacity cursor-default">
                    {displayVersion}
                </span>

                {showTooltip && (
                    <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap border border-gray-700">
                        <div className="space-y-1">
                            <div>
                                <span className="text-gray-400">Version:</span> <span className="font-semibold">{version}</span>
                            </div>
                            <div>
                                <span className="text-gray-400">Commit:</span> <span className="font-mono text-blue-300">{buildInfo.shortHash}</span>
                            </div>
                            <div>
                                <span className="text-gray-400">Branch:</span> <span className="font-mono">{buildInfo.branch}</span>
                            </div>
                            <div>
                                <span className="text-gray-400">Date:</span> <span className="font-mono text-xs">{new Date(buildInfo.commitDate).toLocaleString()}</span>
                            </div>
                        </div>
                        {/* Tooltip arrow */}
                        <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                    </div>
                )}
            </div>
        </div>
    );
}

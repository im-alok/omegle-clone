import React from 'react'

const Background = () => {
    return (
        <div>
            <div className="absolute inset-0 -z-10">
                {/* Dark gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-gray-900 to-neutral-950 backdrop-blur-sm"></div>

                {/* Floating blurred blobs for visual interest */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -left-10 w-72 h-72 bg-gray-700/30 rounded-full filter blur-3xl animate-float"></div>
                    <div
                        className="absolute top-1/3 -right-20 w-80 h-80 bg-gray-600/25 rounded-full filter blur-3xl animate-float"
                        style={{ animationDelay: '2s' }}
                    ></div>
                    <div
                        className="absolute bottom-20 left-1/4 w-60 h-60 bg-gray-800/20 rounded-full filter blur-3xl animate-float"
                        style={{ animationDelay: '4s' }}
                    ></div>
                </div>
            </div>
        </div>
    )
}

export default Background

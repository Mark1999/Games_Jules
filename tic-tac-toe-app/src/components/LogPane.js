import React from 'react';

const LogPane = ({ logs }) => {
  return (
    <div className="p-0 border border-slate-300 rounded-lg w-full h-72 md:h-[calc(24rem+theme(spacing.12))] overflow-y-auto bg-slate-50 shadow-inner">
      <h3 className="text-lg sm:text-xl font-semibold mb-3 text-center text-slate-700 sticky top-0 bg-slate-200/80 backdrop-blur-sm py-2.5 z-10 border-b border-slate-300">
        Game Log
      </h3>
      {logs.length === 0 ? (
        <p className="text-sm text-slate-500 text-center pt-6">No game events yet. Start playing!</p>
      ) : (
        <div className="space-y-2 p-3">
          {logs.map((log, index) => (
            <div
              key={log.timestamp + '-' + index + '-' + log.event} // More unique key
              className={`p-2.5 rounded-md text-xs shadow-sm ${index % 2 === 0 ? 'bg-white' : 'bg-sky-50'}`}
            >
              <p className="font-medium text-slate-800 mb-0.5">
                <span className="text-purple-600 font-semibold">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 2 })}</span> -
                <span className={`font-bold ml-1 ${
                  log.event.includes('WIN') ? 'text-green-600' :
                  log.event.includes('DRAW') ? 'text-orange-500' :
                  log.event.includes('INVALID') ? 'text-red-500' :
                  log.event.includes('START') || log.event.includes('RESET') ? 'text-indigo-600' :
                  'text-blue-600' // Default for PLAYER_MOVE, TURN_SWITCH, etc.
                }`}>
                  {log.event}
                </span>
              </p>
              {log.details && Object.keys(log.details).length > 0 && (
                <pre className="mt-1 text-slate-600 bg-slate-100 p-1.5 rounded text-xs whitespace-pre-wrap break-all overflow-x-auto custom-scrollbar-details">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LogPane;

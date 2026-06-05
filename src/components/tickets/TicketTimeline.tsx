import React from 'react';
import { Clock, User } from 'lucide-react';

interface TimelineProps {
    history: any[];
}

export default function TicketTimeline({ history }: TimelineProps) {
    if (!history || history.length === 0) {
        return (
            <div className="py-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Clock className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p>No status history recorded yet.</p>
            </div>
        );
    }

    return (
        <div className="relative pl-4 space-y-6">
            <div className="absolute top-0 bottom-0 left-[23px] w-0.5 bg-slate-200"></div>
            
            {history.map((event, idx) => (
                <div key={event.id || idx} className="relative z-10 flex gap-4">
                    <div className="w-3 h-3 mt-1.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 shadow-sm shrink-0"></div>
                    <div className="flex-1 min-w-0 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-1">
                            <span className="font-semibold text-slate-900 text-sm break-words break-all sm:break-normal flex-1 min-w-0">
                                {event.to_status.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-md shrink-0 w-fit whitespace-nowrap">
                                {new Date(event.occurred_at).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2 truncate">
                            <User className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Changed by: <span className="font-medium text-slate-700">{event.changed_by_role}</span></span>
                        </div>
                        {event.notes && (
                            <div className="mt-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 break-words whitespace-pre-wrap overflow-hidden">
                                {event.notes}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

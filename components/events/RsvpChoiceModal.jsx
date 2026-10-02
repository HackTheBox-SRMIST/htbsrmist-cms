import React from "react";
import Link from "next/link";
import { Mail, ExternalLink, Ticket, ArrowRight, X, Sparkles, ShieldCheck } from "lucide-react";

const RsvpChoiceModal = ({ event, onClose, onOpenOldRsvp }) => {
    if (!event) return null;

    const newRsvpAdminUrl = "https://rsvp.htbchennai.in/admin";
    const newRsvpPublicUrl = "https://rsvp.htbchennai.in/";

    return (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-light-background-light dark:bg-dark-background-light shadow-2xl rounded-2xl w-full max-w-xl overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-light-background-dark/20 dark:bg-dark-background-dark/20">
                    <div>
                        <h2 className="text-xl font-bold dark:text-dark-accent text-light-color">
                            Select RSVP System
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {event?.event_name || "Event"} &bull; Choose between the new event pass generator or legacy mailer
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {/* OPTION 1: New RSVP (Event Pass Generator) */}
                    <div className="relative p-5 rounded-xl border-2 border-dark-accent/70 bg-dark-accent/[0.04] dark:bg-dark-accent/[0.06] transition-all hover:border-dark-accent">
                        <div className="absolute top-3.5 right-3.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-dark-accent text-black">
                                <Sparkles className="w-3 h-3" />
                                <span>Recommended</span>
                            </span>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-dark-accent/20 flex items-center justify-center text-dark-accent shrink-0">
                                <Ticket className="w-5 h-5" />
                            </div>
                            <div className="flex-1 pr-16">
                                <h3 className="text-base font-bold text-light-color dark:text-dark-color flex items-center gap-1.5">
                                    <span>New RSVP & Event Pass Generator</span>
                                </h3>
                                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                    Dynamic event pass generation with personalized QR codes, automated verification, and integrated attendance check-in.
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700/60 flex flex-wrap gap-2.5">
                            <a
                                href={newRsvpAdminUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-dark-accent text-black font-semibold text-xs rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                            >
                                <span>Open Admin Portal</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <a
                                href={newRsvpPublicUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:border-dark-accent text-light-color dark:text-dark-color text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <span>Public Pass Page</span>
                                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                            </a>
                        </div>
                    </div>

                    {/* OPTION 2: Old RSVP (Legacy Mailer) */}
                    <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-light-background-dark/10 dark:bg-dark-background-dark/20 transition-all hover:border-gray-400 dark:hover:border-gray-500">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 shrink-0">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-base font-bold text-light-color dark:text-dark-color">
                                    Old RSVP (Built-in Mailer)
                                </h3>
                                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                    Legacy built-in system to dispatch direct RSVP confirmation emails to registered participants stored in the database.
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700/60 flex items-center justify-end">
                            {onOpenOldRsvp ? (
                                <button
                                    type="button"
                                    onClick={onOpenOldRsvp}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400 text-light-color dark:text-dark-color text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <span>Launch Old RSVP Mailer</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            ) : (
                                <Link
                                    href={`/events/${event.slug}`}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400 text-light-color dark:text-dark-color text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <span>Open Event & Launch Mailer</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 p-4 bg-light-background-dark/20 dark:bg-dark-background-dark/20">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 text-xs sm:text-sm font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RsvpChoiceModal;

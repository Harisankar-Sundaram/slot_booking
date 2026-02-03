import { useState, useEffect, createContext, useContext } from "react";

// Toast context
const ToastContext = createContext();

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = "info", duration = 4000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    };

    const toast = {
        success: (msg) => showToast(msg, "success"),
        error: (msg) => showToast(msg, "error"),
        info: (msg) => showToast(msg, "info"),
        warning: (msg) => showToast(msg, "warning"),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} />
        </ToastContext.Provider>
    );
}

function ToastContainer({ toasts }) {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map(t => (
                <div
                    key={t.id}
                    className={`px-5 py-3 rounded-xl shadow-lg text-white font-medium text-sm animate-slide-in flex items-center gap-2 min-w-[280px] ${t.type === "success" ? "bg-green-500" :
                            t.type === "error" ? "bg-red-500" :
                                t.type === "warning" ? "bg-orange-500" :
                                    "bg-blue-500"
                        }`}
                >
                    {t.type === "success" && <span>✓</span>}
                    {t.type === "error" && <span>✕</span>}
                    {t.type === "warning" && <span>⚠</span>}
                    {t.type === "info" && <span>ℹ</span>}
                    {t.message}
                </div>
            ))}
        </div>
    );
}

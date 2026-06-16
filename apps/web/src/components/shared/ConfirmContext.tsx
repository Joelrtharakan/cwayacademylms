"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface ConfirmOptions {
  message: string;
  title?: string;
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmContextType {
  confirm: (options: string | ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context.confirm;
};

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ message: "" });
  const [resolvePromise, setResolvePromise] = useState<(value: boolean) => void>();

  const confirm = useCallback((opts: string | ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setOptions(typeof opts === "string" ? { message: opts } : opts);
      setIsOpen(true);
      setResolvePromise(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolvePromise) resolvePromise(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolvePromise) resolvePromise(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(28, 43, 30, 0.4)' }}>
          <div 
            className="bg-white shadow-2xl border border-[#E4E8E0] max-w-md w-full flex flex-col animate-in fade-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            style={{ borderRadius: '24px', padding: '32px' }}
          >
            <h3 className="text-3xl font-bold text-[#1C2B1E] font-serif tracking-tight mb-4">
              {options.title || "Confirm Action"}
            </h3>
            <p className="text-[#243825] text-lg leading-relaxed mb-8">
              {options.message}
            </p>
            <div className="flex justify-end gap-4 mt-2">
              <button
                onClick={handleCancel}
                className="transition-colors font-bold text-base"
                style={{ padding: '12px 24px', borderRadius: '999px', color: '#526658', backgroundColor: '#F3F4F0' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#E4E8E0'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F3F4F0'}
              >
                {options.cancelText || "Cancel"}
              </button>
              <button
                onClick={handleConfirm}
                className="transition-colors font-bold text-base shadow-sm"
                style={{ padding: '12px 24px', borderRadius: '999px', color: 'white', backgroundColor: '#C9973A' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#B88645'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#C9973A'}
              >
                {options.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

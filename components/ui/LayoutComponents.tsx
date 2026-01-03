import React, { useEffect } from 'react';

export const Card = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => (
  <div className={`bg-card text-card-foreground rounded-xl border border-border shadow-sm ${className}`}>
    {children}
  </div>
);

export const Label = ({ children, htmlFor, className = "" }: { children?: React.ReactNode, htmlFor?: string, className?: string }) => (
  <label htmlFor={htmlFor} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground ${className}`}>
    {children}
  </label>
);

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => {
  return (
    <input
      className={`flex h-12 w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${className}`}
      ref={ref}
      {...props}
    />
  )
});
Input.displayName = "Input";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        className={`flex h-12 w-full appearance-none rounded-lg border border-input bg-muted px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${className}`}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
});
Select.displayName = "Select";

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary',
  size?: 'default' | 'sm' | 'lg' | 'icon'
}>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants = {
      default: "bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20",
      outline: "border border-border bg-muted hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80"
    };

    const sizes = {
      default: "h-12 px-6 py-2",
      sm: "h-9 px-4 py-2",
      lg: "h-14 px-8 py-3 text-base",
      icon: "h-10 w-10"
    };

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-lg text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className || ''}`}
        {...props}
      />
    )
  }
);
Button.displayName = "Button";

export const TextArea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={`flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${className}`}
      ref={ref}
      {...props}
    />
  )
});
TextArea.displayName = "TextArea";

export const Modal = ({ isOpen, onClose, title, children, actions }: { isOpen: boolean, onClose: () => void, title: string, children?: React.ReactNode, actions?: React.ReactNode }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-2xl transform rounded-xl bg-card border border-border shadow-2xl transition-all max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-bold font-display tracking-tight text-foreground">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {actions}
            <button onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors ml-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
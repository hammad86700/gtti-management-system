import React from "react";
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from "lucide-react";

export default class ErrorBoundary extends React.Component {
 constructor(props) {
 super(props);
 this.state = { hasError: false, error: null };
 }

 static getDerivedStateFromError(error) {
 return { hasError: true, error };
 }

 componentDidCatch(error, errorInfo) {
 console.error("Institutional ERP ErrorBoundary caught an exception:", error, errorInfo);
 }

 handleReload = () => {
 window.location.reload();
 };

 handleGoHome = () => {
 window.location.href = "/dashboard";
 };

 render() {
 if (this.state.hasError) {
 return (
 <div className="min-h-screen bg-govt-cream flex items-center justify-center p-6 font-sans">
 <div className="max-w-md w-full bg-white border border-gray-200 rounded-xl p-8 text-center space-y-6 shadow-govt-lg">
 <div className="h-1 bg-gradient-to-r from-govt-gold-400 via-govt-gold to-govt-gold-400 -mt-8 -mx-8 mb-6 rounded-t-xl" />

 <div className="mx-auto h-16 w-16 rounded-xl bg-amber-50 text-govt-gold border border-govt-gold-200 flex items-center justify-center">
 <ShieldAlert className="h-8 w-8" />
 </div>

 <div className="space-y-2">
 <h2 className="text-xl font-bold text-gray-900 tracking-tight font-serif">
 Temporary View Interruption
 </h2>
 <p className="text-sm text-gray-500 leading-relaxed">
 An unexpected rendering event occurred in this portal area. Your session and administrative data remain safe and uncompromised.
 </p>
 </div>

 {this.state.error && (
 <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-left font-mono text-xs text-red-700 truncate max-h-24 overflow-y-auto">
 {this.state.error.message || String(this.state.error)}
 </div>
 )}

 <div className="flex flex-col sm:flex-row gap-3 pt-2">
 <button
 type="button"
 onClick={this.handleReload}
 className="flex-1 px-4 py-2.5 rounded-lg bg-govt-green hover:bg-govt-green-500 text-white text-xs font-bold transition-all duration-200 flex items-center justify-center space-x-1.5 shadow-govt"
 >
 <RefreshCw className="h-4 w-4" />
 <span>Reload Interface</span>
 </button>
 <button
 type="button"
 onClick={this.handleGoHome}
 className="flex-1 px-4 py-2.5 rounded-lg bg-white hover:bg-govt-green-50 text-govt-green border border-govt-green-200 text-xs font-bold transition-all duration-200 flex items-center justify-center space-x-1.5"
 >
 <Home className="h-4 w-4" />
 <span>Return Home</span>
 </button>
 </div>

 <div className="text-[10px] text-gray-400 font-mono">
 Institutional Emergency Fallback - TEVTA Punjab
 </div>
 </div>
 </div>
 );
 }

 return this.props.children;
 }
}

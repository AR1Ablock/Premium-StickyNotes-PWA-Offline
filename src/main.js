
import './style.css';
import App from './App.vue';
import './registerServiceWorker';
import { ViteSSG } from 'vite-ssg';
import '@fortawesome/fontawesome-free/css/all.css';



// ViteSSG replaces createApp, but you still get the Vue app instance in the hook
export const createApp = ViteSSG(
    App,
    { routes: [{ path: '/', component: App }], base: '/' }, // Single route
    async ({ app, isClient, initialState }) => {
        // Ensure initialState.data exists on client
        if (isClient) {
            initialState.data = initialState.data || {};
        }

        // Global Vue error handler
        app.config.errorHandler = (err, vm, info) => {
            console.error('[Global Error Handler]', info);
            console.error('[Global Error Handler]', err);
            console.error('[Global Error Handler]', vm);
            // Optionally report to external logging service
        };

        // Global window error handler
        if (isClient) {
            window.onerror = function (message, source, lineno, colno, error) {
                console.error("[Window Error Handler]", message);
                console.error("Source:", source, "Line:", lineno, "Column:", colno);
                console.error("Error Object:", error);
            };
        }
    },
    { rootContainer: '.con' }
);

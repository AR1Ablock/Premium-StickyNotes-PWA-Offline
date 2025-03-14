import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import './registerServiceWorker'

const app = createApp(App);

app.config.errorHandler = (err, vm, info) => {
    console.error('[Global Error Handler]', info);
    console.error('[Global Error Handler]', err);
    console.error('[Global Error Handler]', vm);
    // Optionally, you can add custom logic here to report errors to an external logging service
};

window.onerror = function (message, source, lineno, colno, error) {
    console.error("[Window Error Handler]", message);
    console.error("Source:", source, "Line:", lineno, "Column:", colno);
    console.error("Error Object:", error);
};


app.mount('.con');

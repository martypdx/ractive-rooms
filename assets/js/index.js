import Ractive from 'ractive';
import Components from './components';
import App from './app';
import stroll from './new-stroll';

Ractive.decorators.stroll = stroll;

window.ractive = new App({
    el: document.body
})

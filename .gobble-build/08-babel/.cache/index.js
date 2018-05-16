import Ractive from 'ractive';
import Components from './components';
import App from './app';
import stroll from './new-stroll';

Ractive.decorators.stroll = stroll;

window.ractive = new App({
    el: document.body
});
//# sourceMappingURL=/Users/marty/dev/ractive-rooms/.gobble-build/08-babel/.cache/index.js.map

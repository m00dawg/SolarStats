import 'bootstrap';
import 'bootstrap/css/bootstrap.css!';

export class App {
  configureRouter(config, router){
    config.title = 'Turn Off the Dryer';
    config.map([
      //{ route: ['','welcome'], name: 'welcome',  moduleId: './welcome',      nav: true, title:'Welcome' }
      { route: [ '', 'overview'], name: 'overview', moduleId: './overview', nav: true, title: 'Overview' }
    ]);

    this.router = router;
  }
}

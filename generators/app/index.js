'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var camelCase = require('camelcase');

module.exports = yeoman.Base.extend({

  initializing: function () {
    this.pkg = require('../../package.json');
  },

  prompting: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the spectacular ' + chalk.red('generator-addin') + ' generator!'
    ));

    var prompts = [{
      type: 'input',
      name: 'name',
      message: 'What is the name of your add-in?',
      default: this.appname
    }, {
      type: 'list',
      name: 'type',
      message: 'What type of add-in do you want to create?',
      default: 'MyGeotabPage',
      choices: [{
        name: 'MyGeotab Add-In Page',
        value: 'MyGeotabPage'
      }, {
        name: 'MyGeotab Add-In Button',
        value: 'MyGeotabButton'
      }, {
        name: 'Geotab Drive Add-In Page',
        value: 'DrivePage'
      }]
    }, {
      type: 'input',
      name: 'supportEmail',
      message: 'What is the support contact email address for the add-in?',
      default: ''
    }, {
      type: 'input',
      name: 'host',
      message: 'What is the deployment host URL?',
      default: 'https://www.example.com/myaddin/'
    }];

    var MyGeotabPagePrompts = [{
      type: 'list',
      name: 'path',
      message: 'Select where your add-in will be located in MyGeotab side nav tree: (Geotab Drive specific add-in must choose "Geotab Drive")',
      default: false,
      choices: [{
        name: 'Root',
        value: ''
      }, {
        name: 'Getting Started',
        value: 'GettingStartedLink/'
      }, {
        name: 'Activity',
        value: 'ActivityLink/'
      }, {
        name: 'Engine & Maintenance',
        value: 'EngineMaintenanceLink/'
      }, {
        name: 'Zones & Messages',
        value: 'ZoneAndMessagesLink/'
      }, {
        name: 'Rules & Groups',
        value: 'RuleAndGroupsLink/'
      }, {
        name: 'Administration',
        value: 'AdministrationLink/'
      }]
    }, {
      type: 'input',
      name: 'menuName',
      message: 'What is the add-in menu item name?',
      default: this.appname
    }];

    var MyGeotabButtonPrompts = [{
      type: 'list',
      name: 'page',
      message: 'Select which page your add-in button will be located in MyGeotab',
      default: 'Map',
      choices: [{
        name: 'Map',
        value: 'map'
      }, {
        name: 'Trips History',
        value: 'tripsHistory'
      }, {
        name: 'Vehicles',
        value: 'devices'
      }, {
        name: 'Vehicle Add/Edit',
        value: 'device'
      }, {
        name: 'Zones',
        value: 'zones'
      }, {
        name: 'Zone Add/Edit',
        value: 'zones'
      }, {
        name: 'Users',
        value: 'users'
      }, {
        name: 'User Add/Edit',
        value: 'user'
      }, {
        name: 'Rules',
        value: 'rules'
      }, {
        name: 'Rule Add/Edit',
        value: 'rule'
      }, {
        name: 'Exceptions',
        value: 'exceptions'
      }, {
        name: 'Custom Reports',
        value: 'customReports'
      }, {
        name: 'Custom Report Edit',
        value: 'customReport'
      }, {
        name: 'Engine Faults',
        value: 'engineFaults'
      }, {
        name: 'Speed Profile',
        value: 'speedProfile'
      }, {
        name: 'Duty Status Logs',
        value: 'hosLogs'
      }, {
        name: 'HOS Log Add/Edit',
        value: 'hosLog'
      }, {
        name: 'Groups',
        value: 'groupsTree'
      }, {
        name: 'Routes',
        value: 'routes'
      }, {
        name: 'Fuel Usage',
        value: 'fuelUsage'
      }, {
        name: 'Engine Measurements',
        value: 'engineMeasurements'
      }]
    }, {
      type: 'input',
      name: 'menuName',
      message: 'What is the add-in button text?',
      default: this.appname
    }];

    this.prompt(prompts, function (props) {
      var nextPrompts;

      props.camelName = camelCase(props.name);
      if (props.host && props.host.indexOf('/', props.host.length - 1) === -1) {
        props.host += '/';
      }

      switch (props.type) {
        case 'MyGeotabPage':
          nextPrompts = MyGeotabPagePrompts;
          break;
        case 'MyGeotabButton':
          nextPrompts = MyGeotabButtonPrompts;
          props.isButton = true;
          break;
        case 'DrivePage':
          nextPrompts = [MyGeotabPagePrompts[1]];
          props.isDriveAddin = true;
          props.path === 'DriveAppLink/'
          break;
      }

      this.prompt(nextPrompts, function (props2) {
        Object.assign(props, props2);
        this.props = props;

        done();
      }.bind(this));

    }.bind(this));
  },

  writing: {
    gulpfile: function () {
      this.fs.copyTpl(
        this.templatePath('gulpfile.babel.js'),
        this.destinationPath('gulpfile.babel.js'), {
          date: new Date().toISOString().split('T')[0],
          name: this.props.camelName,
          pkgname: this.pkg.name,
          version: this.pkg.version,
          isButton: this.props.isButton,
        }
      );
    },

    packageJSON: function () {
      this.fs.copyTpl(
        this.templatePath('_package.json'),
        this.destinationPath('package.json'), {
          name: this.props.camelName
        }
      );
    },

    babel: function () {
      this.fs.copy(
        this.templatePath('babelrc'),
        this.destinationPath('.babelrc')
      );
    },

    git: function () {
      this.fs.copy(
        this.templatePath('gitignore'),
        this.destinationPath('.gitignore'));

      this.fs.copy(
        this.templatePath('gitattributes'),
        this.destinationPath('.gitattributes'));
    },

    bower: function () {
      this.fs.copyTpl(
        this.templatePath('_bower.json'),
        this.destinationPath('bower.json'), {
          name: this.props.camelName.toLowerCase()
        }
      );

      this.fs.copy(
        this.templatePath('bowerrc'),
        this.destinationPath('.bowerrc')
      );
    },

    index: function () {
      var indexLocation = this.props.isButton ? '.dev/button.html' : `app/${this.props.camelName}.html`;
      this.fs.copyTpl(
        this.templatePath('app/addin.html'),
        this.destinationPath(indexLocation), {
          title: this.props.name,
          root: this.props.camelName,
          isDriveAddin: this.props.isDriveAddin,
          isButton: this.props.isButton,
          click: this.props.camelName + (this.props.isButton ? '.js' : '.html')
        }
      );
    },

    config: function () {
      this.fs.copyTpl(
        this.templatePath('app/config.json'),
        this.destinationPath('app/config.json'), {
          title: this.props.name,
          supportEmail: this.props.supportEmail,
          url: this.props.camelName + (this.props.isButton ? '.js' : '.html'),
          path: this.props.path,
          page: this.props.page,
          menuName: this.props.menuName,
          root: this.props.camelName,
          host: this.props.host,
          isButton: this.props.isButton
        }
      );
    },

    scripts: function () {
      if (this.props.isButton) {
        this.fs.copyTpl(
          this.templatePath('app/scripts/button.js'),
          this.destinationPath('app/scripts/' + this.props.camelName + '.js'), {
            root: this.props.camelName
          }
        );
      } else {
        this.fs.copyTpl(
          this.templatePath('app/scripts/main.js'),
          this.destinationPath('app/scripts/main.js'), {
            root: this.props.camelName,
            isDriveAddin: this.props.isDriveAddin
          }
        );
      }
    },

    css: function () {
      if (!this.props.isButton) {
        this.fs.copy(
          this.templatePath('app/styles/main.css'),
          this.destinationPath('app/styles/main.css')
        );
      }
    },

    icon: function () {
      this.fs.copy(
        this.templatePath('app/images/icon.svg'),
        this.destinationPath('app/images/icon.svg')
      );
    },

    test: function () {
      this.fs.copy(
        this.templatePath('test/functional/mocks/mocks.js'),
        this.destinationPath('test/functional/mocks/mocks.js')
      );

      this.fs.copyTpl(
        this.templatePath('test/functional/test.js'),
        this.destinationPath('test/functional/test.js'), {
          isDriveAddin: this.props.isDriveAddin,
          root: this.props.camelName
        }
      );
    },

    dev: function () {
      this.fs.copy(
        this.templatePath('_dev/api.js'),
        this.destinationPath('.dev/api.js')
      );

      this.fs.copyTpl(
        this.templatePath('_dev/login.html'),
        this.destinationPath('.dev/login.html'), {
          isDriveAddin: this.props.isDriveAddin
        }
      );

      this.fs.copy(
        this.templatePath('_dev/login.js'),
        this.destinationPath('.dev/login.js')
      );

      this.fs.copy(
        this.templatePath('_dev/rison.js'),
        this.destinationPath('.dev/rison.js')
      );

      this.fs.copy(
        this.templatePath('_dev/style/styleGuide.css'),
        this.destinationPath('.dev/style/styleGuide.css')
      );

      this.fs.copy(
        this.templatePath('_dev/style/styleGuideMyGeotab.html'),
        this.destinationPath('.dev/style/styleGuideMyGeotab.html')
      );
    }
  },

  install: function () {
    this.installDependencies();
  }
});

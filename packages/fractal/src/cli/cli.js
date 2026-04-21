'use strict';

const _ = require('lodash');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const Console = require('./console');
const Notifier = require('./notifier');
const requireAll = require('require-all');
const Log = require('@frctl/core').Log;
const mix = require('@frctl/core').mixins.mix;
const Configurable = require('@frctl/core').mixins.configurable;
const Emitter = require('@frctl/core').mixins.emitter;

class Cli extends mix(Configurable, Emitter) {
    constructor(app) {
        super(app);
        this.config(app.get('cli'));

        this._app = app;
        this._commands = new Map();
        this._configPath = null;
        this._scope = 'project';
        this._cliPackage = {};
        this._env = {};
        this._commandsDir = `${__dirname}/commands`;
        this._yargs = null;

        this.console = new Console();
        this.console.debugMode(app.debug);

        this.notify = new Notifier(this.console, false);

        for (const method of ['log', 'error', 'warn', 'debug', 'success']) {
            this[method] = function () {
                this.console[method].apply(this.console, Array.from(arguments));
            };
            Log.on(method, (msg, data) => this[method](msg, data));
        }
    }

    has(command) {
        return this._commands.has(command);
    }

    get(command) {
        return this._commands.get(command);
    }

    isInteractive() {
        return false; // No longer interactive
    }

    command(commandStr, action, config) {
        action = action || function () {};
        config = config || {};
        if (_.isString(config)) {
            config = {
                description: config,
            };
        }

        const commandScope = config.scope ? [].concat(config.scope) : ['project'];

        if (!_.includes(commandScope, this._scope)) {
            // command not available in this scope
            return;
        }

        // Parse command name and args (e.g., "new <path>" -> "new" with positional "path")
        const parts = commandStr.split(' ');
        const commandName = parts[0];
        const positionals = parts.slice(1);

        this._commands.set(commandName, {
            action,
            config,
            positionals,
        });

        return this;
    }

    exec() {
        // Load all commands
        _.forEach(requireAll(this._commandsDir), (c) => this.command(c.command, c.action, c.config || {}));

        // Build yargs configuration
        this._yargs = yargs(hideBin(process.argv));

        const console = this.console;
        const app = this._app;

        this._commands.forEach((cmd, name) => {
            const { action, config, positionals } = cmd;

            this._yargs.command(
                name + (positionals.length ? ' ' + positionals.join(' ') : ''),
                config.description || '',
                (yargs) => {
                    // Add options
                    if (config.options) {
                        config.options.forEach((opt) => {
                            const [flags, description, def] = _.castArray(opt);
                            const match = flags.match(/^(-[a-z]), --([a-z-]+)(?:\s+<(.+)>)?/i);
                            if (match) {
                                const [, short, long, arg] = match;
                                yargs.option(long, {
                                    alias: short.replace('-', ''),
                                    describe: description,
                                    type: arg ? 'string' : 'boolean',
                                    default: def,
                                });
                            } else {
                                const longMatch = flags.match(/^--([a-z-]+)(?:\s+<(.+)>)?/i);
                                if (longMatch) {
                                    const [, long, arg] = longMatch;
                                    yargs.option(long, {
                                        describe: description,
                                        type: arg ? 'string' : 'boolean',
                                        default: def,
                                    });
                                }
                            }
                        });
                    }
                    return yargs;
                },
                (argv) => {
                    // Execute command
                    const context = {
                        console,
                        fractal: app,
                    };

                    const promise = this._scope === 'global' || name === 'new' ? Promise.resolve() : app.load();

                    promise
                        .then(() => {
                            return action.call(context, argv, () => {});
                        })
                        .catch((err) => {
                            console.error(err.message, err);
                            process.exit(1);
                        });
                }
            );
        });

        this._yargs
            .demandCommand(1, 'You must provide a command')
            .help()
            .alias('help', 'h')
            .version(app.version)
            .alias('version', 'v')
            .strict()
            .parse();
    }

    theme(theme) {
        if (_.isString(theme)) {
            theme = require(theme);
        }
        this.console.theme = theme;
        return this;
    }

    init(scope, configPath, env, cliPackage) {
        this._scope = scope;
        this._configPath = configPath;
        this._env = env;
        this._cliPackage = cliPackage;
        this.exec();
        return this;
    }

    get scope() {
        return this._scope;
    }

    get configPath() {
        return this._configPath;
    }

    get env() {
        return this._env;
    }

    get cliPackage() {
        return this._cliPackage;
    }
}

module.exports = Cli;

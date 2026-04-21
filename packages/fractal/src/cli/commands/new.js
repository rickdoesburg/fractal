'use strict';

const Path = require('path');
const Handlebars = require('handlebars');
const execa = require('execa');
const fs = require('fs-extra');
const helpers = require('@frctl/core').utils;

module.exports = {
    command: 'new <path>',

    config: {
        description: 'Create a new Fractal project',
        scope: ['global'],
        options: [
            ['--title <title>', 'Project title', null],
            ['--components <dir>', 'Components directory', 'components'],
            ['--docs <dir>', 'Documentation directory', 'docs'],
            ['--public <dir>', 'Public/static files directory', 'public'],
            ['--git', 'Initialize Git repository', true],
            ['--no-git', 'Skip Git initialization'],
        ],
    },

    action(args, done) {
        const fractal = this.fractal;
        const console = this.console;
        const baseDir = args.path;
        const basePath = baseDir.startsWith('/') ? baseDir : Path.join(process.cwd(), baseDir);
        const viewsPath = Path.join(__dirname, '../../../views/cli/new');
        const fractalFileTpl = Path.join(viewsPath, 'fractal.hbs');
        const docsIndexTpl = Path.join(viewsPath, 'docs/index.md');
        const exampleComponent = Path.join(viewsPath, 'components/example');

        if (helpers.fileExistsSync(basePath)) {
            console.error(`Cannot create new project: The directory ${basePath} already exists.`);
            done();
            return;
        }

        // Use provided values or sensible defaults
        const projectTitle = args.title || helpers.titlize(args.path);
        const componentsDir = args.components || 'components';
        const docsDir = args.docs || 'docs';
        const publicDir = args.public || 'public';
        const useGit = args.git !== false; // true by default unless --no-git

        console.br().log(`Creating new Fractal project: ${projectTitle}`).br();

        const componentsPath = Path.join(basePath, componentsDir);
        const docsPath = Path.join(basePath, docsDir);
        const publicPath = Path.join(basePath, publicDir);
        const packageJSONPath = Path.join(basePath, 'package.json');
        const gitIgnorePath = Path.join(basePath, '.gitignore');
        const fractalFilePath = Path.join(basePath, 'fractal.config.js');
        const docsIndexPath = Path.join(docsPath, '01-index.md');

        // Create directories
        fs.ensureDirSync(basePath);
        fs.ensureDirSync(componentsPath);
        fs.ensureDirSync(docsPath);
        fs.ensureDirSync(publicPath);

        // Create package.json
        const packageJSON = {
            name: args.path,
            version: '0.1.0',
            dependencies: {
                '@frctl/fractal': fractal.version,
            },
            scripts: {
                start: 'fractal start --sync',
                build: 'fractal build',
            },
        };
        fs.writeFileSync(packageJSONPath, JSON.stringify(packageJSON, null, 2));
        console.success(`Created package.json`);

        // Create fractal.config.js from template
        const fractalFileContent = Handlebars.compile(fs.readFileSync(fractalFileTpl, 'utf8'))({
            project: {
                title: projectTitle,
            },
            paths: {
                components: componentsDir,
                docs: docsDir,
                public: publicDir,
            },
        });
        fs.writeFileSync(fractalFilePath, fractalFileContent);
        console.success(`Created fractal.config.js`);

        // Create docs index
        fs.writeFileSync(docsIndexPath, fs.readFileSync(docsIndexTpl, 'utf8'));
        console.success(`Created documentation index`);

        // Copy example component
        fs.copySync(exampleComponent, Path.join(componentsPath, 'example'));
        console.success(`Created example component`);

        // Create .gitignore if using git
        if (useGit) {
            const gitIgnoreContent = ['node_modules', 'dist', '.DS_Store', '*.log'].join('\n');
            fs.writeFileSync(gitIgnorePath, gitIgnoreContent);
            console.success(`Created .gitignore`);

            // Initialize git repo
            try {
                execa.sync('git', ['init'], { cwd: basePath });
                console.success(`Initialized Git repository`);
            } catch (err) {
                console.warn(`Could not initialize Git repository: ${err.message}`);
            }
        }

        console
            .br()
            .success(`Project created successfully!`)
            .br()
            .log(`To get started:`)
            .log(`  cd ${baseDir}`)
            .log(`  npm install`)
            .log(`  npm start`)
            .br();

        done();
    },
};

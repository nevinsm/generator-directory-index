var Generator = require('yeoman-generator');
var recursive = require('recursive-readdir');

module.exports = class extends Generator {
  // The name `constructor` is important here
  constructor(args, opts) {
    // Calling the super constructor is important so our generator is correctly set up
    super(args, opts);

    // Next, add your custom code
    this.root = this.destinationRoot();
    this.fileArray;
    this.baseUrl;
    this.title;
  }

  getInput() {
    return this.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Your directory title',
        default: 'Directory Index',
        store: true,
      },
      {
        type: 'input',
        name: 'baseUrl',
        message: 'Your base url [including http(s)://]',
        validate: (input) => {
          if (/^((http|https):\/\/)/i.test(input)) {
            return true;
          } else {
            return 'The base url must start with either http://, or https://';
          }
        },
        store: true,
      },
    ]).then((answers) => {
      this.title = answers.title;
      this.baseUrl = answers.baseUrl.replace(/\/+$/, '');
    });
  }

  getFiles() {
    return recursive(this.root).then((files, err) => {
      if (err) {
        this.env.error(err);
      }

      this.fileArray = files
        .map((file) => {
          const fileName = file.replace(this.root, '').replace(/^\/+/g, '');
          const fileUrl = this.baseUrl + file.replace(this.root, '');
          const fileObject = { name: fileName, url: fileUrl };

          return fileObject;
        })
        .filter((file) => {
          let fileName = file.name.split('/');
          fileName = fileName[fileName.length - 1];

          if (fileName === 'index.html' || fileName.startsWith('.')) {
            return false;
          }

          return true;
        });
    });
  }

  createIndex() {
    this.fs.copyTpl(
      this.templatePath('index.ejs'),
      this.destinationPath('index.html'),
      {
        title: this.title,
        files: this.fileArray,
      }
    );
  }
};

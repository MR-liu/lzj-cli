#!/usr/bin/env node
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const Configstore = require('configstore');

const files = require('./lib/files');
const inquirer  = require('./lib/inquirer');
const github  = require('./lib/github');

const conf = new Configstore('ginit');

clear();
console.log(
  chalk.yellow(
    figlet.textSync('Lzj-CLI', { horizontalLayout: 'full' })
  )
);

if (files.directoryExists('.git')) {
  console.log(chalk.red('Already a git repository!'));
  process.exit();
}

const getGithubToken = async () => {
  //从 config store 获取 token
  let token = github.getStoredGithubToken();
  if(token) {
    return token;
  }

  console.log(token)

  // 没找到 token ，使用凭证访问 GitHub 账号
  await github.setGithubCredentials();

  // 注册新 token
  token = await github.registerNewToken();
  return token;
}

const run = async () => {
  try {
    // 获取并设置认证 Token
    const token = await getGithubToken();

    github.githubAuth(token);

    // 创建远程仓库
    const url = await repo.createRemoteRepo();

    // 创建 .gitignore 文件
    await repo.createGitignore();

    // 建立本地仓库并推送到远端
    const done = await repo.setupRepo(url);
    if(done) {
      console.log(chalk.green('All done!'));
    }
  } catch(err) {
      console.log(err)
      if (err) {
        switch (err.code) {
          case 401:
            console.log(chalk.red('Couldn\'t log you in. Please provide correct credentials/token.'));
            break;
          case 422:
            console.log(chalk.red('There already exists a remote repository with the same name'));
            break;
          default:
            console.log(err);
        }
      }
  }
}

run();
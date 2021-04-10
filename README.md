# imgcook 上传7牛插件

imgcook 上传7牛CDN插件，支持将imgcook生成的图片同时下载至本地，并上传至7牛CDN。

## 配置

使用之前需要在`home`路径下配置7牛的相关信息。Mac的路径放在：

    /Users/xxxxx/.imgcook/.qiniu

Linux & Windows暂未测试。

### 配置内容

    {
      "AK": "7牛的AK",
      "SK": "7牛的SK",
      "BK": "用于上传的7牛bucket",
      "prefix": "xxxxx/",
      "host": "https://your.domain/"
    }

`AK`和`SK`在7牛的个人中心获取，BK是你要上传的7牛空间，`prefix`指上传的目录，`host`是你的7牛自定义域名。

## 安装使用

1. 团队后台设置添加 `@imgcook/plugin-image-qiniu`
2. imgcook-cli中也要添加 `@imgcook/plugin-image-qiniu`

## 更多内容

[我的博客](https://yqc.im)
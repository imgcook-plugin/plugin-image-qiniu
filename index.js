/**
 * @name plugin example
 * @param option: { data, filePath, config }
 * - data: module and generate code Data
 * - filePath: Pull file storage directory
 * - config: cli config
 */

const fs = require("fs");
const { unique, downloadImg } = require("@imgcook/cli-utils");
const chalk = require("chalk");
const qiniu = require("qiniu");
const path = require("path");
const homedir = require("os").homedir();

const qiniuUpload = (globalConfig, local) => {
  const accessKey = globalConfig.AK;
  const secretKey = globalConfig.SK;
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
  const options = {
    scope: globalConfig.BK,
  };
  const putPolicy = new qiniu.rs.PutPolicy(options);
  const uploadToken = putPolicy.uploadToken(mac);
  const config = new qiniu.conf.Config();
  // 空间对应的机房
  config.zone = qiniu.zone.Zone_z0;

  const formUploader = new qiniu.form_up.FormUploader(config);
  const putExtra = new qiniu.form_up.PutExtra();
  const key = `${globalConfig.prefix}${path.basename(local)}`;
  // 文件上传
  return new Promise((resolve) => {
    formUploader.putFile(
      uploadToken,
      key,
      local,
      putExtra,
      function (respErr, respBody, respInfo) {
        if (respErr) {
          throw respErr;
        }
        if (respInfo.statusCode == 200) {
          resolve(
            `${globalConfig.host}${globalConfig.prefix}${path.basename(local)}`
          );
        } else {
          console.log(respInfo.statusCode);
          console.log(respBody);
        }
      }
    );
  });
};

const pluginHandler = async (option) => {
  let { data, filePath, config } = option;
  // body...
  let imgArr = [];
  if (!data.code) return null;
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
  }
  const panelDisplay = data.code.panelDisplay || [];
  const moduleData = data.moduleData;
  let index = 0;
  for (const item of panelDisplay) {
    let fileValue = item.panelValue;
    const temporaryImages = `${(
      new Date().getTime() + Math.floor(Math.random() * 10000)
    ).toString(30)}`;
    imgArr = fileValue.match(
      /(https?):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|](\.png|\.jpg)/g
    );
    if (imgArr && imgArr.length > 0) {
      imgArr = unique(imgArr);
      const imgPath = `${filePath}/images`;
      let imgObj = [];
      const imgrc = `${imgPath}/.imgrc`;
      if (fs.existsSync(imgrc)) {
        let imgConfig = fs.readFileSync(imgrc, "utf8");
        imgObj = JSON.parse(imgConfig) || [];
      }
      const qiniurc = `${homedir}/.imgcook/.qiniu`;

      let qiniuConfig = {};
      if (fs.existsSync(qiniurc)) {
        let qiniuConfigStr = fs.readFileSync(qiniurc, "utf8");
        qiniuConfig = JSON.parse(qiniuConfigStr) || {};
      }

      for (let idx = 0; idx < imgArr.length; idx++) {
        if (!fs.existsSync(imgPath)) {
          fs.mkdirSync(imgPath);
        }
        let suffix = imgArr[idx].split(".");
        suffix = suffix[suffix.length - 1];
        const imgName = `img_${moduleData.id}_${index}_${idx}.${suffix}`;
        const imgPathItem = `${imgPath}/${imgName}`;
        const reg = new RegExp(imgArr[idx], "g");

        await downloadImg(imgArr[idx], imgPathItem);
        // TODO add upload 7牛
        const newImgUrl = await qiniuUpload(qiniuConfig, imgPathItem)
        fileValue = fileValue.replace(reg, newImgUrl);
        imgObj.push({
          newImgUrl,
          imgUrl: imgArr[idx],
          imgPath: `./images/${imgName}`,
        });
      }
      if (imgObj.length > 0) {
        fs.writeFileSync(imgrc, JSON.stringify(imgObj), "utf8");
      }
    }
    item.panelValue = fileValue;
    index++;
  }
  return { data, filePath, config };
};

module.exports = (...args) => {
  return pluginHandler(...args).catch((err) => {
    console.log(chalk.red(err));
  });
};
